import { supabase } from '../lib/supabaseClient'

// 1. Generate the UPI link for the payment apps
export function buildUPILink(orderId, amount, canteen) {
  const params = new URLSearchParams({
    pa: canteen.upi_vpa || canteen.upiVpa, // Support both naming conventions
    pn: canteen.name,
    am: amount.toFixed(2),
    tn: `OrderQ-${orderId.slice(-6).toUpperCase()}`,
    cu: 'INR',
  })
  return `upi://pay?${params.toString()}`
}

// 2. Generate QR Code with fallback
export async function generateQR(upiLink) {
  try {
    const QRCode = await import('qrcode')
    return await QRCode.default.toDataURL(upiLink, {
      width: 260, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  } catch {
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiLink)}`
  }
}

// 3. The Main Order Creation Function
export async function createOrderAndPay(cartItems, pickupSlot, canteen) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Session expired. Please login again.')

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // Create PENDING order
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

  if (error) {
    console.error('[OrderPayment] DB Error:', error);
    throw error; // This preserves the error.code (e.g., 23505) for your duplicate check
  }

  // Insert order items
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
  if (itemsErr) console.warn('[OrderItems] Warning:', itemsErr.message)

  const upiLink   = buildUPILink(order.id, total, canteen)
  const qrDataUrl = await generateQR(upiLink)

  return { order, upiLink, qrDataUrl, total }
}