import { useState } from 'react'
import { ArrowLeft, Trash2, Plus, Minus, Clock } from 'lucide-react'
import { pickupSlots } from '../lib/menuData'

export default function CartPage({ cart, onUpdateCart, onNavigate }) {
  const [selectedSlot, setSelectedSlot] = useState(pickupSlots[0].id)

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const updateQty = (itemId, delta) => {
    onUpdateCart(prev => {
      const updated = prev.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity + delta } : i
      ).filter(i => i.quantity > 0)
      return updated
    })
  }

  const slot = pickupSlots.find(s => s.id === selectedSlot)

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-6xl">🛒</div>
      <h2 className="font-heading text-2xl font-bold text-gray-800">Cart is empty</h2>
      <p className="text-gray-500 text-center">Add some delicious items from the menu!</p>
      <button onClick={() => onNavigate('home')} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button">
        Browse Menu
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="gradient-hero text-white p-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className="bg-white/20 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Your Cart</h1>
            <p className="text-orange-100 text-sm">{cart.length} item{cart.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Items */}
        <div className="bg-white rounded-2xl overflow-hidden border border-orange-100">
          {cart.map((item, idx) => (
            <div key={item.id} className={`p-4 flex items-center gap-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-primary font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.id, -1)}
                  className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>
                <span className="w-6 text-center font-bold text-gray-800">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, 1)}
                  className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pickup Slot */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold">Pickup Slot</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {pickupSlots.map(s => (
              <button key={s.id} onClick={() => setSelectedSlot(s.id)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  selectedSlot === s.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-primary/50'
                }`}>
                <div className="font-bold">{s.label}</div>
                <div className="text-xs opacity-70">{s.session}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100 space-y-3">
          <h3 className="font-heading text-lg font-semibold">Order Summary</h3>
          {cart.map(item => (
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
              <p className="text-green-600 text-xs">Direct UPI payment — ₹0 extra charges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => onNavigate('checkout', { cart, slot, total })}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-button active:shadow-none active:translate-y-1 transition-all"
          >
            Proceed to Pay ₹{total} via UPI
          </button>
        </div>
      </div>
    </div>
  )
}