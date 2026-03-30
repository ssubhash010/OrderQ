// // src/pages/CanteenListPage.js
// import { ShoppingCart } from 'lucide-react'
// import { canteens }     from '../lib/menuData'

// export default function CanteenListPage({ cart, onNavigate }) {
//   const cartCount   = cart.items.reduce((s, i) => s + i.quantity, 0)
//   const cartCanteen = cart.canteen

//   return (
//     <div className="min-h-screen pb-24">
//       {/* Header */}
//       <div className="gradient-hero text-white p-6 pb-10">
//         <div className="max-w-lg mx-auto">
//           <div className="flex justify-between items-start mb-2">
//             <div>
//               <h1 className="font-heading text-3xl font-bold">CampusEats 🍱</h1>
//               <p className="text-orange-100 text-sm mt-1">Fast UPI Payments</p>
//             </div>
//             {/* Cart button — only visible when cart has items */}
//             {cartCount > 0 && (
//               <button
//                 onClick={() => onNavigate('cart')}
//                 className="relative bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
//               >
//                 <ShoppingCart className="w-6 h-6" />
//                 <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                   {cartCount}
//                 </span>
//               </button>
//             )}
//           </div>
//           <p className="text-orange-100/80 text-sm">Choose a canteen to order from</p>
//         </div>
//       </div>

//       {/* Active cart banner */}
//       {cartCanteen && cartCount > 0 && (
//         <div
//           className="mx-4 -mt-5 mb-2 bg-white border-2 border-primary rounded-2xl p-3 flex items-center justify-between cursor-pointer shadow-md"
//           onClick={() => onNavigate('cart')}
//         >
//           <div>
//             <p className="text-xs text-gray-500 font-medium">Cart · {cartCanteen.shortName}</p>
//             <p className="font-bold text-gray-900">
//               {cartCount} item{cartCount > 1 ? 's' : ''} in cart
//             </p>
//           </div>
//           <span className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full">
//             View →
//           </span>
//         </div>
//       )}

//       {/* Canteen cards */}
//       <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
//         {canteens.map(canteen => {
//           const isCartCanteen = cartCanteen?.id === canteen.id
//           return (
//             <button
//               key={canteen.id}
//               onClick={() => onNavigate('canteen-menu', { canteen })}
//               className="w-full bg-white rounded-2xl overflow-hidden border-2 border-orange-100 text-left card-hover shadow-sm active:scale-[0.98] transition-all"
//             >
//               {/* Image */}
//               <div className="relative h-44 overflow-hidden">
//                 <img
//                   src={canteen.image}
//                   alt={canteen.name}
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                 <div className="absolute bottom-3 left-4 text-white">
//                   <p className="font-heading text-xl font-bold">{canteen.name}</p>
//                   <p className="text-white/80 text-sm">{canteen.description}</p>
//                 </div>
//                 <div className="absolute top-3 right-3 bg-white/90 text-2xl w-10 h-10 rounded-full flex items-center justify-center shadow">
//                   {canteen.badge}
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="px-4 py-3 flex items-center justify-between">
//                 <div className="flex flex-wrap gap-1.5">
//                   {canteen.categories.map(cat => (
//                     <span key={cat} className="text-xs bg-orange-50 text-orange-700 font-semibold px-2.5 py-1 rounded-full border border-orange-200">
//                       {cat}
//                     </span>
//                   ))}
//                 </div>
//                 {isCartCanteen && cartCount > 0 ? (
//                   <span className="text-xs bg-primary text-white font-bold px-3 py-1.5 rounded-full">
//                     {cartCount} in cart
//                   </span>
//                 ) : (
//                   <span className="text-sm font-bold text-primary">Order →</span>
//                 )}
//               </div>
//             </button>
//           )
//         })}
//       </div>

//       {/* Zero-fee badge */}
//       <div className="max-w-lg mx-auto px-4 mt-4">
//         <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3">
//           <span className="text-2xl">💸</span>
//           <div>
//             <p className="font-semibold text-green-800 text-sm">₹0 Platform Fee — Always</p>
//             <p className="text-green-600 text-xs">Your money goes directly to the canteen via UPI</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



// src/pages/CanteenListPage.js
import { ShoppingCart } from 'lucide-react'
import { canteens }     from '../lib/menuData'
import { motion }       from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function CanteenListPage({ cart, onNavigate }) {
  const cartCount   = cart.items.reduce((s, i) => s + i.quantity, 0)
  const cartCanteen = cart.canteen

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 pb-24 font-sans selection:bg-[#f06e28] selection:text-white">
      {/* Header */}
      <div className="p-6 pb-8 pt-12">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-wide text-white">Explore Canteens</h1>
              <p className="text-gray-400 text-sm mt-1 tracking-wider font-medium">Fast UPI Payments</p>
            </div>
            {cartCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate('cart')}
                className="relative bg-[#1c1c1e] border border-white/5 rounded-full p-3 shadow-[-2px_-2px_8px_rgba(255,255,255,0.04),4px_4px_8px_rgba(0,0,0,0.6)] transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-gray-200" />
                <span className="absolute -top-1 -right-1 bg-[#f06e28] text-white text-[10px] font-black tracking-tighter rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#121212]">
                  {cartCount}
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Active cart banner */}
      {cartCanteen && cartCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto px-4 mb-6 cursor-pointer"
          onClick={() => onNavigate('cart')}
        >
          <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[-2px_-2px_8px_rgba(255,255,255,0.04),4px_4px_8px_rgba(0,0,0,0.6)]">
            <div>
              <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Cart · {cartCanteen.shortName}</p>
              <p className="font-bold text-gray-100 tracking-wide mt-1">
                {cartCount} item{cartCount > 1 ? 's' : ''} in cart
              </p>
            </div>
            <span className="bg-[#f06e28] text-white text-sm font-bold tracking-wide px-5 py-2 rounded-full shadow-lg shadow-[#f06e28]/20">
              View Cart
            </span>
          </div>
        </motion.div>
      )}

      {/* Canteen cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto px-4 space-y-6"
      >
        {canteens.map(canteen => {
          const isCartCanteen = cartCanteen?.id === canteen.id
          return (
            <motion.button
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              key={canteen.id}
              onClick={() => onNavigate('canteen-menu', { canteen })}
              className="w-full bg-[#1c1c1e] rounded-[28px] overflow-hidden border border-white/5 text-left shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] transition-all flex flex-col"
            >
              {/* Image Area */}
              <div className="relative h-48 overflow-hidden rounded-t-[28px]">
                <img
                  src={canteen.image}
                  alt={canteen.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-black/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-[#121212]/80 backdrop-blur-md text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-white/10">
                  {canteen.badge}
                </div>
              </div>

              {/* Footer / Content */}
              <div className="px-5 py-5 -mt-8 relative z-10 flex flex-col gap-2">
                <h2 className="font-heading text-2xl font-bold tracking-wide text-white drop-shadow-md">{canteen.name}</h2>
                <p className="text-gray-400 text-sm font-medium tracking-wider mb-2">{canteen.description}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-2">
                    {canteen.categories.map(cat => (
                      <span key={cat} className="text-[10px] uppercase bg-white/5 text-gray-300 font-bold tracking-widest px-3 py-1.5 rounded-full border border-white/10">
                        {cat}
                      </span>
                    ))}
                  </div>
                  {isCartCanteen && cartCount > 0 ? (
                    <span className="text-xs bg-[#f06e28] text-white font-bold tracking-wide px-4 py-2 rounded-full shadow-lg shadow-[#f06e28]/20">
                      {cartCount} in cart
                    </span>
                  ) : (
                    <span className="text-sm font-bold tracking-wide text-[#f06e28] px-2">Order →</span>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Zero-fee badge */}
      <motion.div variants={itemVariants} className="max-w-lg mx-auto px-4 mt-8">
        <div className="bg-[#121212] border border-green-900/50 rounded-2xl p-4 flex items-center gap-4 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.4)]">
          <span className="text-2xl drop-shadow-sm">💸</span>
          <div>
            <p className="font-bold tracking-wide text-green-400 text-sm">₹0 Platform Fee — Always</p>
            <p className="text-gray-500 text-xs font-medium tracking-wider mt-0.5">Your money goes directly to the canteen via UPI</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}