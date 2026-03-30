// // src/pages/CartPage.js
// import { useState }                       from 'react'
// import { ArrowLeft, Trash2, Plus, Minus, Clock } from 'lucide-react'
// import { pickupSlots }                    from '../lib/menuData'

// export default function CartPage({ cart, onUpdateCart, onNavigate }) {
//   const [selectedSlot, setSelectedSlot] = useState(pickupSlots[0].id)

//   const { items, canteen } = cart
//   const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

//   const updateQty = (itemId, delta) => {
//     onUpdateCart(prev => ({
//       ...prev,
//       items: prev.items
//         .map(i => i.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
//         .filter(i => i.quantity > 0),
//     }))
//   }

//   const slot = pickupSlots.find(s => s.id === selectedSlot)

//   if (items.length === 0) return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
//       <div className="text-6xl">🛒</div>
//       <h2 className="font-heading text-2xl font-bold text-gray-800">Cart is empty</h2>
//       <p className="text-gray-500 text-center">Add some delicious items from a canteen!</p>
//       <button
//         onClick={() => onNavigate('canteen-list')}
//         className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button"
//       >
//         Browse Canteens
//       </button>
//     </div>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50 pb-36">
//       {/* Header */}
//       <div className="gradient-hero text-white p-6">
//         <div className="max-w-lg mx-auto flex items-center gap-4">
//           <button
//             onClick={() => onNavigate('canteen-menu', { canteen })}
//             className="bg-white/20 p-2 rounded-full"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div>
//             <h1 className="font-heading text-2xl font-bold">Your Cart</h1>
//             <p className="text-orange-100 text-sm">
//               {canteen?.name} · {items.length} item{items.length > 1 ? 's' : ''}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
//         {/* Canteen badge */}
//         <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 flex items-center gap-2">
//           <span className="text-xl">{canteen?.badge}</span>
//           <span className="text-sm font-semibold text-orange-800">{canteen?.name}</span>
//         </div>

//         {/* Cart items */}
//         <div className="bg-white rounded-2xl overflow-hidden border border-orange-100">
//           {items.map((item, idx) => (
//             <div key={item.id} className={`p-4 flex items-center gap-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
//               <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
//                 <p className="text-primary font-bold">₹{item.price}</p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => updateQty(item.id, -1)}
//                   className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
//                 >
//                   {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
//                 </button>
//                 <span className="w-6 text-center font-bold text-gray-800">{item.quantity}</span>
//                 <button
//                   onClick={() => updateQty(item.id, 1)}
//                   className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
//                 >
//                   <Plus className="w-3.5 h-3.5" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Pickup slot */}
//         <div className="bg-white rounded-2xl p-4 border border-orange-100">
//           <div className="flex items-center gap-2 mb-3">
//             <Clock className="w-5 h-5 text-primary" />
//             <h3 className="font-heading text-lg font-semibold">Pickup Slot</h3>
//           </div>
//           <div className="grid grid-cols-3 gap-2">
//             {pickupSlots.map(s => (
//               <button
//                 key={s.id}
//                 onClick={() => setSelectedSlot(s.id)}
//                 className={`py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
//                   selectedSlot === s.id
//                     ? 'border-primary bg-primary/10 text-primary'
//                     : 'border-gray-200 text-gray-600 hover:border-primary/50'
//                 }`}
//               >
//                 <div className="font-bold">{s.label}</div>
//                 <div className="text-xs opacity-70">{s.session}</div>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Order summary */}
//         <div className="bg-white rounded-2xl p-4 border border-orange-100 space-y-3">
//           <h3 className="font-heading text-lg font-semibold">Order Summary</h3>
//           {items.map(item => (
//             <div key={item.id} className="flex justify-between text-sm text-gray-600">
//               <span>{item.name} × {item.quantity}</span>
//               <span>₹{item.price * item.quantity}</span>
//             </div>
//           ))}
//           <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
//             <span>Total</span>
//             <span className="text-primary text-lg">₹{total}</span>
//           </div>
//           <div className="bg-green-50 rounded-xl p-3 flex items-start gap-2">
//             <span className="text-green-600 text-lg">₹</span>
//             <div>
//               <p className="text-green-800 font-semibold text-sm">Zero Platform Fee</p>
//               <p className="text-green-600 text-xs">
//                 Payment goes directly to {canteen?.shortName} — ₹0 extra
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Proceed button */}
//       <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-screen-sm mx-auto">
//         <button
//           onClick={() => onNavigate('checkout', { cart, slot, total })}
//           className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-button active:shadow-none active:translate-y-1 transition-all"
//         >
//           Pay ₹{total} via UPI →
//         </button>
//       </div>
//     </div>
//   )
// }

// src/pages/CartPage.js
import { useState }                       from 'react'
import { ArrowLeft, Trash2, Plus, Minus, Clock } from 'lucide-react'
import { pickupSlots }                    from '../lib/menuData'
import { motion }                         from 'framer-motion'

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
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-6 p-6 font-sans">
      <div className="text-6xl drop-shadow-2xl grayscale opacity-50">🛒</div>
      <div className="text-center">
        <h2 className="font-heading text-2xl font-extrabold tracking-wide text-white mb-2">Cart is empty</h2>
        <p className="text-gray-500 font-medium tracking-wider">Add some delicious items from a canteen!</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('canteen-list')}
        className="bg-[#1c1c1e] text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase border border-white/10 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_12px_rgba(0,0,0,0.5)]"
      >
        Browse Canteens
      </motion.button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 pb-36 font-sans">
      {/* Header */}
      <div className="p-5 pb-6 pt-12">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('canteen-menu', { canteen })}
            className="bg-[#1c1c1e] p-3 rounded-full border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]"
          >
            <ArrowLeft className="w-5 h-5 text-gray-200" />
          </motion.button>
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-wide text-white">Your Cart</h1>
            <p className="text-gray-400 text-xs font-medium tracking-wider mt-1">
              {canteen?.name} · {items.length} item{items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-2 space-y-6">
        {/* Cart items */}
        <div className="bg-[#1c1c1e] rounded-[28px] overflow-hidden border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)]">
          {items.map((item, idx) => (
            <div key={item.id} className={`p-5 flex items-center gap-4 ${idx > 0 ? 'border-t border-white/5' : ''}`}>
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-white/10" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold tracking-wide text-gray-100 truncate">{item.name}</h3>
                <p className="text-[#f06e28] font-extrabold tracking-wider mt-1">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-3 bg-[#121212] p-1.5 rounded-full border border-white/5 shadow-inner shadow-black/50">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => updateQty(item.id, -1)}
                  className="w-8 h-8 rounded-full bg-[#1c1c1e] text-gray-300 flex items-center justify-center border border-white/5"
                >
                  {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                </motion.button>
                <span className="w-4 text-center font-bold tracking-widest text-white text-sm">{item.quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => updateQty(item.id, 1)}
                  className="w-8 h-8 rounded-full bg-[#f06e28] text-white flex items-center justify-center shadow-lg shadow-[#f06e28]/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          ))}
        </div>

        {/* Pickup slot */}
        <div className="bg-[#1c1c1e] rounded-[28px] p-5 border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-[#f06e28]" />
            <h3 className="font-heading text-lg font-bold tracking-wide text-white">Pickup Slot</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {pickupSlots.map(s => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={s.id}
                onClick={() => setSelectedSlot(s.id)}
                className={`py-3 px-2 rounded-2xl text-center border transition-all ${
                  selectedSlot === s.id
                    ? 'border-[#f06e28] bg-[#f06e28]/10 text-white shadow-inner'
                    : 'border-white/5 bg-[#121212] text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className={`font-bold tracking-wider text-sm ${selectedSlot === s.id ? 'text-[#f06e28]' : ''}`}>{s.label}</div>
                <div className="text-[10px] font-medium tracking-widest uppercase mt-1 opacity-70">{s.session}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-[#1c1c1e] rounded-[28px] p-5 border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] space-y-4">
          <h3 className="font-heading text-lg font-bold tracking-wide text-white mb-2">Order Summary</h3>
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm text-gray-400 font-medium tracking-wider">
              <span>{item.name} <span className="text-gray-600 px-1">×</span> {item.quantity}</span>
              <span className="text-gray-300">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4 flex justify-between items-center font-extrabold text-white tracking-wide">
            <span className="text-lg">Total</span>
            <span className="text-[#f06e28] text-2xl">₹{total}</span>
          </div>
        </div>
      </div>

      {/* Proceed button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#121212]/90 backdrop-blur-xl border-t border-white/5 max-w-screen-sm mx-auto z-40">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('checkout', { cart, slot, total })}
          className="w-full bg-[#f06e28] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-sm shadow-[0_8px_20px_-4px_rgba(240,110,40,0.4)] flex justify-center items-center gap-2"
        >
          Checkout <span className="text-black/30 font-black px-1">|</span> ₹{total}
        </motion.button>
      </div>
    </div>
  )
}