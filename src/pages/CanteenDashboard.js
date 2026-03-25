// src/pages/CanteenDashboard.js
// ─────────────────────────────────────────────────────────────────────────────
// Canteen staff sign in with their Supabase email + password credentials.
// Their user_metadata.canteen_id determines which canteen's orders they see.
//
// Admin setup (run once per staff account):
//   supabase.auth.admin.updateUserById(userId, {
//     user_metadata: { canteen_id: 'ball-1', role: 'canteen_staff' }
//   })
// ─────────────────────────────────────────────────────────────────────────────
// src/pages/CanteenDashboard.js
// ─────────────────────────────────────────────────────────────────────────────
// Canteen staff sign in with their Supabase email + password credentials.
// Their user_metadata.canteen_id determines which canteen's orders they see.
//
// Admin setup (run once per staff account):
//   supabase.auth.admin.updateUserById(userId, {
//     user_metadata: { canteen_id: 'ball-1', role: 'canteen_staff' }
//   })
// ─────────────────────────────────────────────────────────────────────────────


// src/pages/CanteenDashboard.js
import { useEffect, useRef, useState }        from 'react'
import { ArrowLeft, RefreshCw, ChefHat, CheckCircle2, LogOut } from 'lucide-react'
import { supabase }                            from '../lib/supabaseClient'
import { getCanteenById }                      from '../lib/menuData'

const NEXT_STATUS  = { CONFIRMED: 'PREPARING', PREPARING: 'READY', READY: 'PICKED_UP' }
const ACTION_LABEL = { CONFIRMED: '👨‍🍳 Start Preparing', PREPARING: '🍱 Mark Ready', READY: '✅ Mark Picked Up' }
const STATUS_COLOR = {
  CONFIRMED: 'border-blue-300 bg-blue-50',
  PREPARING: 'border-amber-300 bg-amber-50',
  READY:     'border-green-300 bg-green-100',
  PICKED_UP: 'border-gray-200 bg-gray-50 opacity-60',
}
const BTN_COLOR = {
  CONFIRMED: 'bg-blue-500 hover:bg-blue-600',
  PREPARING: 'bg-amber-500 hover:bg-amber-600',
  READY:     'bg-green-500 hover:bg-green-600',
}

// ── Staff Login ───────────────────────────────────────────────────────────────
function StaffLogin({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [errMsg,   setErrMsg]   = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setErrMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrMsg(error.message)
    } else {
      const meta = data.user?.user_metadata
      if (meta?.role !== 'canteen_staff') {
        await supabase.auth.signOut()
        setErrMsg('This account is not a canteen staff account.')
      } else {
        onLogin(data.user)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <ChefHat className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold">Staff Login</h1>
          <p className="text-gray-400 text-sm mt-1">Canteen dashboard access</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Staff email" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary" />
          {errMsg && <p className="text-red-500 text-sm">{errMsg}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-button disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function CanteenDashboard({ onNavigate }) {
  const [staffUser, setStaffUser] = useState(null)
  const [orders,    setOrders]    = useState([])
  const [firstLoad, setFirstLoad] = useState(true)   // show spinner only on first load
  const [updating,  setUpdating]  = useState(null)
  const canteen = staffUser ? getCanteenById(staffUser.user_metadata?.canteen_id) : null

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === 'canteen_staff') setStaffUser(user)
      else setFirstLoad(false)
    })
  }, [])

  const handleLogin   = (user) => setStaffUser(user)
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setStaffUser(null); setOrders([])
  }

  // ── Load orders + their items together ───────────────────────────────────
  // Uses a single query with nested select so we get items in one round-trip.
  // `silent` = true → don't show spinner (background refresh)
  const loadOrders = async (silent = false) => {
    if (!staffUser?.user_metadata?.canteen_id) return
    if (!silent) setFirstLoad(true)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id, item_id, name, price, quantity
        )
      `)
      .eq('canteen_id', staffUser.user_metadata.canteen_id)
      .in('status', ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'])
      .order('token_number', { ascending: true })

    if (!error) setOrders(data || [])
    setFirstLoad(false)
  }

  // ── Realtime + silent background poll ────────────────────────────────────
  // Realtime fires immediately on any order change.
  // Poll every 8 s as a fallback — runs silently (no spinner, no flicker).
  const staffRef = useRef(staffUser)
  useEffect(() => { staffRef.current = staffUser }, [staffUser])

  useEffect(() => {
    if (!staffUser) return

    loadOrders()   // initial load with spinner

    const canteenId = staffUser.user_metadata.canteen_id

    const channel = supabase
      .channel(`dashboard-${canteenId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders',
        filter: `canteen_id=eq.${canteenId}`,
      }, () => loadOrders(true))   // silent on realtime event
      .subscribe()

    const poll = setInterval(() => loadOrders(true), 8000)  // silent poll

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [staffUser]) // eslint-disable-line

  // Update order status
  const updateStatus = async (order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setUpdating(order.id)
    const { error } = await supabase
      .from('orders').update({ status: next }).eq('id', order.id)
    if (error) console.error('Status update failed:', error.message)
    await loadOrders(true)   // silent refresh after update
    setUpdating(null)
  }

  if (!staffUser) return <StaffLogin onLogin={handleLogin} />

  if (firstLoad) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const active = orders.filter(o => o.status !== 'PICKED_UP')
  const done   = orders.filter(o => o.status === 'PICKED_UP')

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <div className="bg-gray-900 text-white p-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('profile')} className="bg-white/10 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-400" />
              <h1 className="font-heading text-xl font-bold">
                {canteen ? canteen.name : 'Canteen'} Dashboard
              </h1>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              {active.length} active · live updates on
            </p>
          </div>
          <button onClick={() => loadOrders(false)} className="bg-white/10 p-2 rounded-full" title="Refresh">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={handleSignOut} className="bg-white/10 p-2 rounded-full" title="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-2xl mx-auto px-5 py-3 flex gap-8">
          {[
            { label: 'Confirmed', count: orders.filter(o => o.status === 'CONFIRMED').length, color: 'text-blue-400'  },
            { label: 'Preparing', count: orders.filter(o => o.status === 'PREPARING').length, color: 'text-amber-400' },
            { label: 'Ready',     count: orders.filter(o => o.status === 'READY').length,     color: 'text-green-400' },
          ].map(s => (
            <div key={s.label}>
              <p className={`font-heading text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order cards */}
      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        {active.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-3" />
            <h2 className="font-heading text-xl font-bold text-gray-700">All caught up!</h2>
            <p className="text-gray-400">No pending orders right now</p>
          </div>
        ) : (
          active.map(order => (
            <div key={order.id}
              className={`rounded-2xl border-2 p-4 transition-all ${STATUS_COLOR[order.status] || ''}`}>

              {/* Order header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-heading text-2xl font-bold text-white flex-shrink-0 ${
                    order.status === 'READY'     ? 'bg-green-500' :
                    order.status === 'PREPARING' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}>
                    #{order.token_number}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {order.status === 'CONFIRMED' ? 'New Order' :
                       order.status === 'PREPARING' ? 'Preparing' : 'Ready!'}
                    </p>
                    <p className="text-gray-500 text-sm">Pickup: {order.pickup_slot}</p>
                    <p className="text-primary font-bold text-sm">₹{order.total_amount}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  order.status === 'READY'     ? 'bg-green-200 text-green-800' :
                  order.status === 'PREPARING' ? 'bg-amber-200 text-amber-800' :
                                                 'bg-blue-200 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Items list */}
              {order.order_items?.length > 0 ? (
                <div className="bg-white/70 rounded-xl p-3 mb-3 space-y-1">
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-800 font-medium">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="text-gray-500">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 rounded-xl p-2 mb-3 text-xs text-gray-400 text-center">
                  No item details available
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => updateStatus(order)}
                disabled={updating === order.id}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${BTN_COLOR[order.status] || ''} disabled:opacity-50`}
              >
                {updating === order.id ? 'Updating…' : ACTION_LABEL[order.status]}
              </button>
            </div>
          ))
        )}

        {/* Completed today */}
        {done.length > 0 && (
          <div className="mt-6">
            <p className="text-gray-500 text-sm font-semibold mb-2 px-1">
              Completed Today ({done.length})
            </p>
            {done.map(order => (
              <div key={order.id}
                className="bg-white rounded-xl p-3 border border-gray-200 opacity-60 flex justify-between items-center mb-2">
                <div>
                  <span className="font-mono text-gray-600 text-sm font-semibold">
                    Token #{order.token_number}
                  </span>
                  {order.order_items?.length > 0 && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      {order.order_items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                  )}
                </div>
                <span className="text-green-600 font-bold text-sm">✅ Done</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
