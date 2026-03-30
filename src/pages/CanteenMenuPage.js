// // src/pages/CanteenMenuPage.js
// import { useState, useEffect } from 'react'
// import { ArrowLeft, ShoppingCart, Plus, Search } from 'lucide-react'
// import { getMenuByCanteen, getCategoriesByCanteen } from '../lib/menuData'
// import { supabase } from '../lib/supabaseClient'

// // ── Cart conflict modal ────────────────────────────────────────────────────────
// function ConflictModal({ existingCanteen, newCanteen, onConfirm, onCancel }) {
//   return (
//     <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4">
//       <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
//         <div className="text-4xl text-center mb-3">🛒</div>
//         <h3 className="font-heading text-xl font-bold text-gray-900 text-center mb-2">
//           Replace cart?
//         </h3>
//         <p className="text-gray-500 text-sm text-center mb-5 leading-relaxed">
//           Your cart has items from <strong>{existingCanteen.name}</strong>.
//           Adding from <strong>{newCanteen.name}</strong> will clear your current cart.
//         </p>
//         <button
//           onClick={onConfirm}
//           className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-button active:shadow-none active:translate-y-1 transition-all mb-3"
//         >
//           Start fresh with {newCanteen.shortName}
//         </button>
//         <button
//           onClick={onCancel}
//           className="w-full text-gray-500 py-2 text-sm font-medium"
//         >
//           Keep {existingCanteen.shortName} cart
//         </button>
//       </div>
//     </div>
//   )
// }

// // ── Menu Item Card ─────────────────────────────────────────────────────────────
// function MenuItemCard({ item, isSoldOut, qtyInCart, onAdd, stockLoaded = true }) {
//   const [flash, setFlash] = useState(false)

//   const handleAdd = () => {
//     if (isSoldOut || !stockLoaded) return
//     onAdd(item)
//     setFlash(true)
//     setTimeout(() => setFlash(false), 700)
//   }

//   return (
//     <div className={`bg-white rounded-2xl overflow-hidden border border-orange-100 card-hover shadow-sm transition-all ${isSoldOut ? 'opacity-60 grayscale-[0.3]' : ''}`}>
//       <div className="relative h-44 overflow-hidden">
//         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        
//         {/* Price Tag */}
//         <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow">
//           <span className="font-bold text-primary">₹{item.price}</span>
//         </div>

//         {/* Prep Time */}
//         <div className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
//           ⏱ {item.prepTime}
//         </div>

//         {/* Sold Out Overlay */}
//         {isSoldOut && (
//           <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
//             <span className="bg-red-600 text-white font-black px-4 py-1.5 rounded-lg shadow-lg rotate-[-5deg] border-2 border-white text-sm uppercase tracking-wider">
//               Sold Out
//             </span>
//           </div>
//         )}
        
//         {/* Cart Count Badge */}
//         {!isSoldOut && qtyInCart > 0 && (
//           <div className="absolute bottom-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full animate-in fade-in zoom-in duration-300">
//             ×{qtyInCart} in cart
//           </div>
//         )}
//       </div>

//       <div className="p-4">
//         <h3 className="font-heading text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
//         <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>

//         <button
//           onClick={handleAdd}
//           disabled={isSoldOut || !stockLoaded}
//           className={`w-full rounded-full px-6 py-2.5 font-bold transition-all flex items-center justify-center gap-2 ${
//             !stockLoaded || isSoldOut 
//               ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
//               : flash
//                 ? 'bg-green-500 text-white'
//                 : 'bg-primary text-white shadow-button active:shadow-none active:translate-y-1 hover:bg-primary/90'
//           }`}
//         >
//           {!stockLoaded ? (
//             <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
//           ) : isSoldOut ? (
//             'Unavailable'
//           ) : (
//             <>
//               <Plus className="w-4 h-4" />
//               {flash ? 'Added!' : 'Add to Cart'}
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   )
// }

// // ── Main Page ──────────────────────────────────────────────────────────────────
// export default function CanteenMenuPage({ cart, canteen, onAddToCart, onNavigate }) {
//   const [activeCategory, setActiveCategory] = useState('all')
//   const [search, setSearch] = useState('')
//   const [pendingItem, setPendingItem] = useState(null)
  
//   // Dynamic availability state
//   const [overrides, setOverrides] = useState(new Set())
//   const [stockLoaded, setStockLoaded] = useState(false)

//   if (!canteen) {
//     onNavigate('canteen-list')
//     return null
//   }

//   useEffect(() => {
//     const proactiveCleanup = async () => {
//       try {
//         // Clear any 5-minute-old stale orders before they even reach checkout
//         await supabase.rpc('cleanup_stale_pending_orders');
//         console.log('Proactive cleanup: Stale orders cleared.');
//       } catch (err) {
//         console.error('Menu cleanup failed:', err);
//       }
//     };
  
//     proactiveCleanup();
//   }, []); // Runs once when the menu loads

//   // 1. Fetch item availability overrides from Supabase
//   useEffect(() => {
//     const fetchStockStatus = async () => {
//       const { data } = await supabase
//         .from('item_overrides')
//         .select('item_id')
//         .eq('canteen_id', canteen.id)
//         .eq('is_available', false)

//       if (data) {
//         setOverrides(new Set(data.map(row => row.item_id)))
//       }
//       setStockLoaded(true)
//     }

//     fetchStockStatus()

//     // 2. Real-time Sync (RT-5 style): update if staff toggles stock
//     const channel = supabase
//       .channel(`stock-${canteen.id}`)
//       .on('postgres_changes', { 
//         event: '*', 
//         schema: 'public', 
//         table: 'item_overrides',
//         filter: `canteen_id=eq.${canteen.id}`
//       }, () => fetchStockStatus())
//       .subscribe()

//     return () => { supabase.removeChannel(channel) }
//   }, [canteen.id])

//   const allItems = getMenuByCanteen(canteen.id)
//   const categories = getCategoriesByCanteen(canteen.id)
//   const cartCount = cart.items.reduce((s, i) => s + i.quantity, 0)

//   const filtered = allItems.filter(item => {
//     const matchCat = activeCategory === 'all' || item.category === activeCategory
//     const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
//     return matchCat && matchSearch
//   })

//   const getQty = (itemId) => cart.items.find(i => i.id === itemId)?.quantity ?? 0

//   const handleAddToCart = (item) => {
//     // Prevent adding sold out items (extra layer of security)
//     // if (overrides.has(item.id)) return
//     if (!stockLoaded || overrides.has(item.id)) return

//     if (cart.canteen && cart.canteen.id !== canteen.id && cart.items.length > 0) {
//       setPendingItem(item)
//       return
//     }
//     onAddToCart(item, canteen)
//   }

//   const handleConflictConfirm = () => {
//     if (pendingItem) onAddToCart(pendingItem, canteen, true)
//     setPendingItem(null)
//   }

//   return (
//     <div className="min-h-screen pb-28">
//       {/* Header */}
//       <div className="gradient-hero text-white p-5 pb-8">
//         <div className="max-w-lg mx-auto">
//           <div className="flex items-center gap-4 mb-4">
//             <button onClick={() => onNavigate('canteen-list')} className="bg-white/20 p-2 rounded-full">
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <div className="flex-1">
//               <h1 className="font-heading text-2xl font-bold">{canteen.name}</h1>
//               <p className="text-orange-100 text-xs">{canteen.description}</p>
//             </div>
//             <button onClick={() => onNavigate('cart')} className="relative bg-white/20 p-2.5 rounded-full">
//               <ShoppingCart className="w-5 h-5" />
//               {cartCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                   {cartCount}
//                 </span>
//               )}
//             </button>
//           </div>

//           {/* Search */}
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder={`Search in ${canteen.shortName}…`}
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Category pills */}
//       <div className="max-w-lg mx-auto px-4 -mt-4 mb-4">
//         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
//           {categories.map(cat => (
//             <button
//               key={cat.id}
//               onClick={() => setActiveCategory(cat.id)}
//               className={`flex-shrink-0 px-5 py-2 rounded-full font-medium text-sm transition-all ${
//                 activeCategory === cat.id
//                   ? 'bg-primary text-white shadow-button'
//                   : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primary'
//               }`}
//             >
//               {cat.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Menu grid */}
//       <div className="max-w-lg mx-auto px-4">
//         {filtered.length === 0 ? (
//           <div className="text-center py-16 text-gray-400">
//             <p className="text-4xl mb-3">🔍</p>
//             <p>No items found</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-4">
//             {filtered.map(item => (
//               <MenuItemCard
//                 key={item.id}
//                 item={item}
//                 isSoldOut={overrides.has(item.id)}
//                 qtyInCart={getQty(item.id)}
//                 onAdd={handleAddToCart}
//                 stockLoaded={stockLoaded}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Sticky checkout bar */}
//       {cartCount > 0 && (
//         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 max-w-screen-sm mx-auto z-40">
//           <button
//             onClick={() => onNavigate('cart')}
//             className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold shadow-button active:shadow-none active:translate-y-1 transition-all flex items-center justify-between px-5"
//           >
//             <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{cartCount}</span>
//             <span>View Cart</span>
//             <span className="text-orange-200">→</span>
//           </button>
//         </div>
//       )}

//       {/* Conflict Modal */}
//       {pendingItem && (
//         <ConflictModal
//           existingCanteen={cart.canteen}
//           newCanteen={canteen}
//           onConfirm={handleConflictConfirm}
//           onCancel={() => setPendingItem(null)}
//         />
//       )}
//     </div>
//   )
// }

// src/pages/CanteenMenuPage.js
import { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart, Plus, Search } from 'lucide-react'
import { getMenuByCanteen, getCategoriesByCanteen } from '../lib/menuData'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

// ── Cart conflict modal ────────────────────────────────────────────────────────
function ConflictModal({ existingCanteen, newCanteen, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1c1c1e] border border-white/10 rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="text-5xl text-center mb-4 drop-shadow-lg">🛒</div>
        <h3 className="font-heading text-2xl font-extrabold tracking-wide text-white text-center mb-3">
          Replace cart?
        </h3>
        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed font-medium tracking-wider">
          Your cart has items from <strong className="text-gray-200">{existingCanteen.name}</strong>.
          Adding from <strong className="text-gray-200">{newCanteen.name}</strong> will clear your current cart.
        </p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onConfirm}
          className="w-full bg-[#f06e28] text-white py-4 rounded-2xl font-bold tracking-wider shadow-lg shadow-[#f06e28]/20 mb-3"
        >
          Start fresh with {newCanteen.shortName}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onCancel}
          className="w-full bg-transparent text-gray-400 py-3 rounded-2xl text-sm font-bold tracking-wider border border-white/5 hover:bg-white/5"
        >
          Keep {existingCanteen.shortName} cart
        </motion.button>
      </motion.div>
    </div>
  )
}

// ── Menu Item Card ─────────────────────────────────────────────────────────────
function MenuItemCard({ item, isSoldOut, qtyInCart, onAdd, stockLoaded = true }) {
  const [flash, setFlash] = useState(false)

  const handleAdd = () => {
    if (isSoldOut || !stockLoaded) return
    onAdd(item)
    setFlash(true)
    setTimeout(() => setFlash(false), 700)
  }

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      className={`bg-[#1c1c1e] rounded-[24px] overflow-hidden border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_12px_rgba(0,0,0,0.5)] flex p-3 gap-4 ${isSoldOut ? 'opacity-50 grayscale-[0.5]' : ''}`}
    >
      <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">
              Sold Out
            </span>
          </div>
        )}
        
        {!isSoldOut && qtyInCart > 0 && (
          <div className="absolute top-2 left-2 bg-[#f06e28] text-white text-[10px] font-black tracking-wider px-2 py-1 rounded-md shadow-md">
            ×{qtyInCart}
          </div>
        )}
      </div>

      <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-heading text-lg font-bold tracking-wide text-gray-100 truncate">{item.name}</h3>
          <p className="text-xs text-gray-500 font-medium tracking-wider mt-1 line-clamp-2">{item.description}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold text-lg text-gray-100 tracking-wide">₹{item.price}</span>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            disabled={isSoldOut || !stockLoaded}
            className={`rounded-full px-5 py-2 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-1 ${
              !stockLoaded || isSoldOut 
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : flash
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-[#f06e28] text-white shadow-lg shadow-[#f06e28]/20'
            }`}
          >
            {!stockLoaded ? (
              <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : isSoldOut ? (
              'N/A'
            ) : (
              <>
                {flash ? 'Added' : 'Add'}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CanteenMenuPage({ cart, canteen, onAddToCart, onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [pendingItem, setPendingItem] = useState(null)
  const [overrides, setOverrides] = useState(new Set())
  const [stockLoaded, setStockLoaded] = useState(false)

  if (!canteen) {
    onNavigate('canteen-list')
    return null
  }

  useEffect(() => {
    const proactiveCleanup = async () => {
      try {
        await supabase.rpc('cleanup_stale_pending_orders');
      } catch (err) {
        console.error('Menu cleanup failed:', err);
      }
    };
    proactiveCleanup();
  }, []);

  useEffect(() => {
    const fetchStockStatus = async () => {
      const { data } = await supabase
        .from('item_overrides')
        .select('item_id')
        .eq('canteen_id', canteen.id)
        .eq('is_available', false)

      if (data) setOverrides(new Set(data.map(row => row.item_id)))
      setStockLoaded(true)
    }
    fetchStockStatus()

    const channel = supabase
      .channel(`stock-${canteen.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'item_overrides',
        filter: `canteen_id=eq.${canteen.id}`
      }, () => fetchStockStatus())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [canteen.id])

  const allItems = getMenuByCanteen(canteen.id)
  const categories = getCategoriesByCanteen(canteen.id)
  const cartCount = cart.items.reduce((s, i) => s + i.quantity, 0)

  const filtered = allItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const getQty = (itemId) => cart.items.find(i => i.id === itemId)?.quantity ?? 0

  const handleAddToCart = (item) => {
    if (!stockLoaded || overrides.has(item.id)) return
    if (cart.canteen && cart.canteen.id !== canteen.id && cart.items.length > 0) {
      setPendingItem(item)
      return
    }
    onAddToCart(item, canteen)
  }

  const handleConflictConfirm = () => {
    if (pendingItem) onAddToCart(pendingItem, canteen, true)
    setPendingItem(null)
  }

  return (
    <div className="min-h-screen bg-[#121212] pb-32 font-sans selection:bg-[#f06e28] selection:text-white">
      {/* Header */}
      <div className="p-5 pb-6 pt-12 sticky top-0 bg-[#121212]/90 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-5">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('canteen-list')} className="bg-[#1c1c1e] p-3 rounded-full border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]">
              <ArrowLeft className="w-5 h-5 text-gray-200" />
            </motion.button>
            <div className="flex-1">
              <h1 className="font-heading text-2xl font-extrabold tracking-wide text-white">{canteen.name}</h1>
              <p className="text-gray-400 text-xs font-medium tracking-wider">{canteen.description}</p>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('cart')} className="relative bg-[#1c1c1e] p-3 rounded-full border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]">
              <ShoppingCart className="w-5 h-5 text-gray-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f06e28] text-white text-[10px] font-black tracking-tighter rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#1c1c1e]">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#1c1c1e] text-white placeholder-gray-500 text-sm focus:outline-none border border-white/5 shadow-inner shadow-black/20 font-medium tracking-wide"
            />
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="max-w-lg mx-auto px-4 mt-2 mb-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
          {categories.map(cat => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-[-2px_-2px_6px_rgba(255,255,255,0.02),2px_2px_6px_rgba(0,0,0,0.4)] ${
                activeCategory === cat.id
                  ? 'bg-[#f06e28] text-white border border-[#f06e28]/50 shadow-lg shadow-[#f06e28]/20'
                  : 'bg-[#1c1c1e] text-gray-400 border border-white/5 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-lg mx-auto px-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3 opacity-50">🍽️</p>
            <p className="font-medium tracking-wider">No items found</p>
          </div>
        ) : (
          <motion.div 
            initial="hidden" animate="show" 
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 gap-4"
          >
            {filtered.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                isSoldOut={overrides.has(item.id)}
                qtyInCart={getQty(item.id)}
                onAdd={handleAddToCart}
                stockLoaded={stockLoaded}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Sticky checkout bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-5 bg-[#121212]/90 backdrop-blur-xl border-t border-white/10 max-w-screen-sm mx-auto z-40"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('cart')}
              className="w-full bg-[#f06e28] text-white py-4 rounded-2xl font-bold tracking-wide shadow-lg shadow-[#f06e28]/20 flex items-center justify-between px-6"
            >
              <div className="flex items-center gap-3">
                <span className="bg-black/20 px-3 py-1 rounded-full text-sm font-black tracking-widest border border-white/10">{cartCount}</span>
                <span className="uppercase tracking-widest text-sm">View Cart</span>
              </div>
              <span className="text-xl">→</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict Modal */}
      <AnimatePresence>
        {pendingItem && (
          <ConflictModal
            existingCanteen={cart.canteen}
            newCanteen={canteen}
            onConfirm={handleConflictConfirm}
            onCancel={() => setPendingItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}