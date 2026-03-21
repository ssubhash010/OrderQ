import { supabase, MERCHANT_UPI_VPA, MERCHANT_NAME } from '../lib/supabaseClient'

// Generate UPI deep link — works natively on Android GPay / PhonePe / BHIM
export function buildUPILink(orderId, amount) {
  const params = new URLSearchParams({
    pa: MERCHANT_UPI_VPA,
    pn: MERCHANT_NAME,
    am: amount.toFixed(2),
    tn: `ORDER-${orderId}`,
    cu: 'INR',
  })
  return `upi://pay?${params.toString()}`
}

// Generate QR code as data URL (for desktop / iOS)
export async function generateQR(upiLink) {
  try {
    // Dynamic import so build doesn't fail without the package
    const QRCode = await import('qrcode')
    return await QRCode.default.toDataURL(upiLink, {
      width: 260,
      margin: 2,
      color: { dark: '#1a0a00', light: '#ffffff' },
    })
  } catch {
    // Fallback: return a placeholder QR image URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiLink)}`
  }
}

// Main hook: create PENDING order → return UPI link + QR
export async function createOrderAndPay(cartItems, pickupSlot, userId = 'mock-user-123') {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // 1. Create PENDING order in Supabase
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'PENDING',
      total_amount: total,
      pickup_slot: pickupSlot,
    })
    .select()
    .single()

  if (error) throw new Error('Failed to create order: ' + error)

  // 2. Insert order items (fire and forget in mock)
  // await supabase.from('order_items').insert(cartItems.map(...))

  // 3. Build UPI link — order.id is the idempotency key
  const upiLink = buildUPILink(order.id, total)

  // 4. Generate QR
  const qrDataUrl = await generateQR(upiLink)

  // 5. In mock mode: auto-confirm after 4s to simulate bank webhook
  supabase.simulatePayment(order.id)

  return { order, upiLink, qrDataUrl, total }
}