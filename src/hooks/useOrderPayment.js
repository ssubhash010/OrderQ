// src/hooks/useOrderPayment.js
// ─────────────────────────────────────────────────────────────────────────────
// Creates a PENDING order in Supabase, inserts item snapshots, builds
// the UPI deep-link using the canteen's own UPI VPA, and generates a QR.
// DEV_MODE auto-confirms after 4 s; production uses the upi-webhook Edge Fn.
// ─────────────────────────────────────────────────────────────────────────────


// src/hooks/useOrderPayment.js
import { supabase } from '../lib/supabaseClient'

const DEV_MODE = process.env.REACT_APP_DEV_MODE === 'true'

export function buildUPILink(orderId, amount, canteen) {
  const params = new URLSearchParams({
    pa: canteen.upiVpa,
    pn: canteen.name,
    am: amount.toFixed(2),
    tn: `CE-${orderId.slice(-8).toUpperCase()}`,
    cu: 'INR',
  })
  return `upi://pay?${params.toString()}`
}

export async function generateQR(upiLink) {
  try {
    const QRCode = await import('qrcode')
    return await QRCode.default.toDataURL(upiLink, {
      width: 260, margin: 2,
      color: { dark: '#1a0a00', light: '#ffffff' },
    })
  } catch {
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiLink)}`
  }
}

export async function createOrderAndPay(cartItems, pickupSlot, canteen) {
  // ── Resolve user ID ────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Authentication error — please refresh the page')

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // ── Create PENDING order ───────────────────────────────────────────────────
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id:      user.id,
      canteen_id:   canteen.id,
      status:       'PENDING',
      total_amount: total,
      pickup_slot:  pickupSlot,
    })
    .select()
    .single()

  if (error) throw new Error('Could not create order: ' + error.message)

  // ── Insert order items snapshot ────────────────────────────────────────────
  const { error: itemsErr } = await supabase.from('order_items').insert(
    cartItems.map(item => ({
      order_id:   order.id,
      item_id:    item.id,
      canteen_id: canteen.id,
      name:       item.name,
      price:      item.price,
      quantity:   item.quantity,
    }))
  )
  if (itemsErr) console.warn('[order_items]', itemsErr.message)

  // ── UPI deep-link + QR ────────────────────────────────────────────────────
  const upiLink   = buildUPILink(order.id, total, canteen)
  const qrDataUrl = await generateQR(upiLink)

  // ── DEV: simulate bank webhook via SECURITY DEFINER RPC after 4 s ─────────
  // simulate_payment() calls confirm_order() internally — same production path.
  // Returns JSON: { ok: true, txn_id } or { ok: false, error: '...' }
  if (DEV_MODE) {
    setTimeout(async () => {
      console.log('[DEV] Calling simulate_payment RPC for order:', order.id)
      const { data: rpcResult, error: rpcErr } = await supabase
        .rpc('simulate_payment', { p_order_id: order.id })

      if (rpcErr) {
        // Usually means the SQL was not run yet in Supabase
        console.error('[DEV] simulate_payment RPC failed:', rpcErr.message,
          '\n→ Did you run supabase/simulate_payment.sql in Supabase SQL Editor?')
      } else if (rpcResult?.ok === false) {
        console.warn('[DEV] simulate_payment returned error:', rpcResult.error,
          rpcResult.current_status ? '(current status: ' + rpcResult.current_status + ')' : '')
      } else {
        console.log('[DEV] ✅ Order confirmed via simulate_payment RPC:',
          rpcResult?.txn_id, '| amount: ₹' + rpcResult?.amount)
      }
    }, 4000)
  }

  return { order, upiLink, qrDataUrl, total }
}