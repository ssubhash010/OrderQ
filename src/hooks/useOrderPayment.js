import { supabase } from '../lib/supabaseClient'

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

  return { order, total }
}