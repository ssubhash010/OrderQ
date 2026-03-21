// ─────────────────────────────────────────────────────────────────────────────
// supabaseClient.js  —  MOCK MODE (no real Supabase needed for testing)
//
// TO GO LIVE, replace the mock export with:
//   import { createClient } from '@supabase/supabase-js'
//   export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
//
// and fill in your .env:
//   REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
//   REACT_APP_SUPABASE_ANON_KEY=eyJ...
//   REACT_APP_MERCHANT_UPI=canteen@kotak
// ─────────────────────────────────────────────────────────────────────────────

export const MERCHANT_UPI_VPA = process.env.REACT_APP_MERCHANT_UPI || 'campuseats@upi'
export const MERCHANT_NAME    = 'CampusEats'

let _orderIdCounter = 1000

// ── In-memory store (resets on page refresh — that's fine for testing) ────────
const _store = {
  orders:    [],              // all orders
  listeners: {},              // orderId → [callback]
}

// ── Helper: fire all listeners for an orderId ─────────────────────────────────
function _notify(orderId) {
  const order = _store.orders.find(o => o.id === orderId)
  if (!order) return
  ;(_store.listeners[orderId] || []).forEach(cb => cb({ new: { ...order } }))
}

// ── Fluent query builder returned by .from() ──────────────────────────────────
function _queryBuilder(table) {
  let _filters = {}
  let _inFilter = null

  const builder = {
    // INSERT
    insert(data) {
      return {
        select() {
          return {
            async single() {
              const order = {
                ...data,
                id:           `order-${++_orderIdCounter}-${Date.now()}`,
                token_number: _orderIdCounter,
                created_at:   new Date().toISOString(),
                status:       data.status || 'PENDING',
              }
              _store.orders.push(order)
              return { data: order, error: null }
            },
          }
        },
      }
    },

    // SELECT — chainable .eq() / .in() / .single() / .then()
    select(cols = '*') {
      const q = {
        _col: null, _val: null, _inVals: null,

        eq(col, val) {
          this._col = col
          this._val = val
          return this
        },

        in(col, vals) {
          this._inVals = vals
          return this
        },

        order(col, opts) { return this },   // stub — mock already ordered

        async single() {
          const found = _store.orders.find(o => o[this._col] === this._val)
          return { data: found || null, error: found ? null : { message: 'not found' } }
        },

        then(cb) {
          let results = [..._store.orders]
          if (this._col) results = results.filter(o => o[this._col] === this._val)
          if (this._inVals) results = results.filter(o => this._inVals.includes(o.status))
          results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          return cb({ data: results, error: null })
        },
      }
      return q
    },

    // UPDATE
    update(data) {
      return {
        eq(col, val) {
          const idx = _store.orders.findIndex(o => o[col] === val)
          if (idx > -1) {
            _store.orders[idx] = { ..._store.orders[idx], ...data }
            _notify(_store.orders[idx].id)
          }
          return { data: _store.orders[idx] || null, error: null }
        },
      }
    },
  }

  return builder
}

// ── Realtime channel (mock pub/sub) ──────────────────────────────────────────
function _channel(name) {
  let _cb = null
  let _orderId = null

  const ch = {
    on(event, filterObj, callback) {
      _cb = callback
      if (filterObj && filterObj.filter) {
        // filter looks like "id=eq.order-1001-..."
        _orderId = filterObj.filter.split('=eq.')[1]
        _store.listeners[_orderId] = _store.listeners[_orderId] || []
        _store.listeners[_orderId].push(callback)
      }
      return ch          // ← return channel for chaining  .on(...).subscribe()
    },
    subscribe(cb) {
      return ch          // ← return channel so caller can removeChannel(ch)
    },
    unsubscribe() {
      if (_orderId && _cb) {
        _store.listeners[_orderId] = (_store.listeners[_orderId] || []).filter(f => f !== _cb)
      }
    },
    _orderId: () => _orderId,
    _cb:      () => _cb,
  }
  return ch
}

// ── Main export ───────────────────────────────────────────────────────────────
export const supabase = {
  // Expose store for CanteenDashboard direct access
  get _orders() { return _store.orders },

  from:          (table) => _queryBuilder(table),
  channel:       (name)  => _channel(name),
  removeChannel: (ch)    => { try { ch && ch.unsubscribe && ch.unsubscribe() } catch {} },

  auth: {
    getUser:    async () => ({ data: { user: { id: 'mock-user-123', email: 'student@campus.edu' } } }),
    signInWithOtp: async () => ({ error: null }),
    verifyOtp:  async () => ({ data: { user: { id: 'mock-user-123' } }, error: null }),
  },

  /**
   * Call this right after creating an order to simulate the bank webhook
   * auto-confirming the payment after 4 seconds (testing only).
   */
  simulatePayment(orderId) {
    setTimeout(() => {
      const idx = _store.orders.findIndex(o => o.id === orderId)
      if (idx > -1) {
        _store.orders[idx].status = 'CONFIRMED'
        _notify(orderId)
      }
    }, 4000)
  },
}
