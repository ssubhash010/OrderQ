// src/pages/CartPage.js
import { useState }                       from 'react'
import { ArrowLeft, Trash2, Plus, Minus, Clock } from 'lucide-react'
import { pickupSlots }                    from '../lib/menuData'

export default function CartPage({ cart, onUpdateCart, onNavigate }) {
  const [selectedSlot, setSelectedSlot] = useState(pickupSlots[0].id)

  const { items, canteen } = cart
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const updateQty = (itemId, delta) => {
    onUpdateCart(prev => ({
      ...prev,
      items: prev.items
        .map(i => i.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0),
    }))
  }

  const slot = pickupSlots.find(s => s.id === selectedSlot)

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-6xl">🛒</div>
      <h2 className="font-heading text-2xl font-bold text-gray-800">Cart is empty</h2>
      <p className="text-gray-500 text-center">Add some delicious items from a canteen!</p>
      <button
        onClick={() => onNavigate('canteen-list')}
        className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button"
      >
        Browse Canteens
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Header */}
      <div className="gradient-hero text-white p-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button
            onClick={() => onNavigate('canteen-menu', { canteen })}
            className="bg-white/20 p-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Your Cart</h1>
            <p className="text-orange-100 text-sm">
              {canteen?.name} · {items.length} item{items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Canteen badge */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-xl">{canteen?.badge}</span>
          <span className="text-sm font-semibold text-orange-800">{canteen?.name}</span>
        </div>

        {/* Cart items */}
        <div className="bg-white rounded-2xl overflow-hidden border border-orange-100">
          {items.map((item, idx) => (
            <div key={item.id} className={`p-4 flex items-center gap-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-primary font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.id, -1)}
                  className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>
                <span className="w-6 text-center font-bold text-gray-800">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.id, 1)}
                  className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pickup slot */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold">Pickup Slot</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {pickupSlots.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSlot(s.id)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  selectedSlot === s.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-primary/50'
                }`}
              >
                <div className="font-bold">{s.label}</div>
                <div className="text-xs opacity-70">{s.session}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100 space-y-3">
          <h3 className="font-heading text-lg font-semibold">Order Summary</h3>
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-primary text-lg">₹{total}</span>
          </div>
          <div className="bg-green-50 rounded-xl p-3 flex items-start gap-2">
            <span className="text-green-600 text-lg">₹</span>
            <div>
              <p className="text-green-800 font-semibold text-sm">Zero Platform Fee</p>
              <p className="text-green-600 text-xs">
                Payment goes directly to {canteen?.shortName} — ₹0 extra
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-screen-sm mx-auto">
        <button
          onClick={() => onNavigate('checkout', { cart, slot, total })}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-button active:shadow-none active:translate-y-1 transition-all"
        >
          Pay ₹{total} via UPI →
        </button>
      </div>
    </div>
  )
}