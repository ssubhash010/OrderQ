// import { useState } from 'react'
// import { ShoppingCart, UtensilsCrossed, Coffee, Cookie, Plus, Search } from 'lucide-react'
// import { menuItems, categories } from '../lib/menuData'

// const categoryIcons = { UtensilsCrossed, Coffee, Cookie }

// export default function HomePage({ cart, onAddToCart, onNavigate }) {
//   const [activeCategory, setActiveCategory] = useState('all')
//   const [search, setSearch] = useState('')

//   const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

//   const filtered = menuItems.filter(item => {
//     const matchCat = activeCategory === 'all' || item.category === activeCategory
//     const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
//     return matchCat && matchSearch
//   })

//   return (
//     <div className="min-h-screen pb-24">
//       {/* Header */}
//       <div className="gradient-hero text-white p-6 pb-8">
//         <div className="max-w-6xl mx-auto">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h1 className="font-heading text-3xl font-bold mb-1">CampusEats</h1>
//               <p className="text-orange-100 text-sm">Fast UPI Payments</p>
//             </div>
//             <button
//               onClick={() => onNavigate('cart')}
//               className="relative bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
//             >
//               <ShoppingCart className="w-6 h-6" />
//               {cartCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                   {cartCount}
//                 </span>
//               )}
//             </button>
//           </div>

//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search for food..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Category pills */}
//       <div className="max-w-6xl mx-auto px-4 -mt-4">
//         <div className="flex gap-3 overflow-x-auto pb-4">
//           {categories.map(cat => {
//             const Icon = cat.icon ? categoryIcons[cat.icon] : null
//             const active = activeCategory === cat.id
//             return (
//               <button
//                 key={cat.id}
//                 onClick={() => setActiveCategory(cat.id)}
//                 className={`flex-shrink-0 flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
//                   active
//                     ? 'bg-primary text-white shadow-button'
//                     : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
//                 }`}
//               >
//                 {Icon && <Icon className="w-4 h-4" />}
//                 {cat.label}
//               </button>
//             )
//           })}
//         </div>
//       </div>

//       {/* Menu grid */}
//       <div className="max-w-6xl mx-auto px-4 mt-2">
//         {filtered.length === 0 ? (
//           <div className="text-center py-16 text-gray-400">
//             <p className="text-lg">No items found</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map(item => (
//               <MenuItemCard key={item.id} item={item} onAdd={() => onAddToCart(item)} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// function MenuItemCard({ item, onAdd }) {
//   const [added, setAdded] = useState(false)

//   const handleAdd = () => {
//     onAdd()
//     setAdded(true)
//     setTimeout(() => setAdded(false), 800)
//   }

//   return (
//     <div className="bg-white rounded-2xl overflow-hidden border border-orange-100 card-hover shadow-sm">
//       <div className="relative h-48 overflow-hidden">
//         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
//         <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow">
//           <span className="font-bold text-primary">₹{item.price}</span>
//         </div>
//         <div className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
//           ⏱ {item.prepTime}
//         </div>
//       </div>
//       <div className="p-4">
//         <h3 className="font-heading text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
//         <p className="text-sm text-gray-600 mb-4">{item.description}</p>
//         <button
//           onClick={handleAdd}
//           className={`w-full rounded-full px-6 py-2.5 font-bold transition-all ${
//             added
//               ? 'bg-green-500 text-white'
//               : 'bg-primary text-white shadow-button active:shadow-none active:translate-y-1 hover:bg-primary/90'
//           }`}
//         >
//           <Plus className="w-5 h-5 inline mr-1" />
//           {added ? 'Added!' : 'Add to Cart'}
//         </button>
//       </div>
//     </div>
//   )
// }

// src/pages/HomePage.js
import { useState } from 'react'
import { ShoppingCart, UtensilsCrossed, Coffee, Cookie, Plus, Search } from 'lucide-react'
import { menuItems, categories } from '../lib/menuData'
import { motion } from 'framer-motion'

const categoryIcons = { UtensilsCrossed, Coffee, Cookie }

export default function HomePage({ cart, onAddToCart, onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const filtered = menuItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-[#121212] font-sans text-gray-100 pb-24 selection:bg-[#f06e28] selection:text-white">
      {/* Header */}
      <div className="p-6 pb-8 pt-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-wide text-white mb-1">CampusEats</h1>
              <p className="text-gray-400 text-xs font-medium tracking-wider uppercase">Premium Dining Experience</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('cart')}
              className="relative bg-[#1c1c1e] rounded-full p-3 border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)] transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f06e28] text-white text-[10px] font-black tracking-tighter rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#121212]">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for food..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#1c1c1e] text-white placeholder-gray-500 focus:outline-none border border-white/5 shadow-inner shadow-black/20 font-medium tracking-wide"
            />
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="max-w-6xl mx-auto px-4 -mt-2">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 pt-1">
          {categories.map(cat => {
            const Icon = cat.icon ? categoryIcons[cat.icon] : null
            const active = activeCategory === cat.id
            return (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),2px_2px_6px_rgba(0,0,0,0.4)] ${
                  active
                    ? 'bg-[#f06e28] text-white border border-[#f06e28]/50 shadow-lg shadow-[#f06e28]/20'
                    : 'bg-[#1c1c1e] text-gray-400 border border-white/5 hover:text-gray-200'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {cat.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="font-medium tracking-wider">No items found</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map(item => (
              <MenuItemCard key={item.id} item={item} onAdd={() => onAddToCart(item)} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function MenuItemCard({ item, onAdd }) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 800)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="bg-[#1c1c1e] rounded-[28px] overflow-hidden border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-transparent opacity-80" />
        <div className="absolute top-4 right-4 bg-[#121212]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <span className="font-extrabold tracking-wide text-[#f06e28]">₹{item.price}</span>
        </div>
        <div className="absolute top-4 left-4 bg-[#121212]/80 backdrop-blur-md text-gray-300 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          ⏱ {item.prepTime}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between -mt-4 relative z-10">
        <div>
          <h3 className="font-heading text-xl font-bold tracking-wide text-white mb-1 drop-shadow-md">{item.name}</h3>
          <p className="text-xs font-medium tracking-wider text-gray-400 mb-5 line-clamp-2">{item.description}</p>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAdd}
          className={`w-full rounded-2xl px-6 py-3.5 font-bold tracking-widest uppercase text-sm transition-all shadow-[0_4px_15px_-4px_rgba(0,0,0,0.3)] ${
            added
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-[#121212] text-white border border-white/5 hover:border-white/10'
          }`}
        >
          {added ? (
            'Added'
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4 text-[#f06e28]" /> Add to Order
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}