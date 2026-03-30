// // src/pages/OrdersPage.js
// import { useEffect, useState } from 'react'
// import { ArrowLeft, RefreshCw } from 'lucide-react'
// import { supabase }             from '../lib/supabaseClient'
// import { getCanteenById }       from '../lib/menuData'

// const STATUS_LABELS = {
//   PENDING:        { label: 'Pending Payment', color: 'text-yellow-700', bg: 'bg-yellow-100' },
//   CONFIRMED:      { label: 'Confirmed',       color: 'text-blue-700',   bg: 'bg-blue-100'   },
//   PREPARING:      { label: 'Preparing',       color: 'text-amber-700',  bg: 'bg-amber-100'  },
//   READY:          { label: '🍱 Ready!',       color: 'text-green-700',  bg: 'bg-green-100'  },
//   PICKED_UP:      { label: 'Completed',       color: 'text-gray-600',   bg: 'bg-gray-100'   },
//   FAILED:         { label: 'Failed',          color: 'text-red-700',    bg: 'bg-red-100'    },
//   CANCELLED:      { label: 'Cancelled',       color: 'text-gray-500',   bg: 'bg-gray-100'   },
//   REFUND_PENDING: { label: 'Refund Pending',  color: 'text-orange-700', bg: 'bg-orange-100' },
//   REFUNDED:       { label: 'Refunded',        color: 'text-purple-700', bg: 'bg-purple-100' },
// }

// export default function OrdersPage({ onNavigate }) {
//   const [orders,  setOrders]  = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error,   setError]   = useState(null)

//   const loadOrders = async () => {
//     setLoading(true)
//     setError(null)

//     const { data: { user } } = await supabase.auth.getUser()
//     if (!user) {
//       setError('Not logged in')
//       setLoading(false)
//       return
//     }

//     const { data, error: dbErr } = await supabase
//       .from('orders')
//       .select('*')
//       .eq('user_id', user.id)
//       .order('created_at', { ascending: false })

//     if (dbErr) {
//       setError(dbErr.message)
//     } else {
//       setOrders(data || [])
//     }
//     setLoading(false)
//   }

//   useEffect(() => { loadOrders() }, [])

//   return (
//     <div className="min-h-screen bg-gray-50 pb-24">
//       {/* Header */}
//       <div className="gradient-hero text-white p-6">
//         <div className="max-w-lg mx-auto flex items-center gap-4">
//           <button onClick={() => onNavigate('canteen-list')} className="bg-white/20 p-2 rounded-full">
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <h1 className="font-heading text-2xl font-bold flex-1">My Orders</h1>
//           <button onClick={loadOrders} className="bg-white/20 p-2 rounded-full">
//             <RefreshCw className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
//             {error}
//           </div>
//         )}

//         {/* Loading */}
//         {loading ? (
//           <div className="flex justify-center py-16">
//             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : orders.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="text-5xl mb-4">📋</div>
//             <h2 className="font-heading text-xl font-bold text-gray-700">No orders yet</h2>
//             <p className="text-gray-400 mt-2">Your order history will appear here</p>
//             <button
//               onClick={() => onNavigate('canteen-list')}
//               className="mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button"
//             >
//               Order Now
//             </button>
//           </div>
//         ) : (
//           orders.map(order => {
//             const st      = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING
//             const canteen = getCanteenById(order.canteen_id)
//             const canClick = !['PENDING', 'FAILED', 'CANCELLED'].includes(order.status)

//             return (
//               <div
//                 key={order.id}
//                 className={`bg-white rounded-2xl p-4 border border-orange-100 transition-shadow ${
//                   canClick ? 'cursor-pointer hover:shadow-md' : ''
//                 }`}
//                 onClick={() => canClick && onNavigate('order-success', { order })}
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <div>
//                     <p className="font-bold text-gray-900">Token #{order.token_number}</p>
//                     <p className="text-gray-400 text-xs mt-0.5">
//                       {new Date(order.created_at).toLocaleString('en-IN', {
//                         day: 'numeric', month: 'short',
//                         hour: '2-digit', minute: '2-digit',
//                       })}
//                     </p>
//                     {canteen && (
//                       <p className="text-gray-500 text-xs mt-0.5">
//                         {canteen.badge} {canteen.shortName}
//                       </p>
//                     )}
//                   </div>
//                   <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.bg} ${st.color}`}>
//                     {st.label}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <p className="text-gray-500 text-sm">Pickup: {order.pickup_slot}</p>
//                   <p className="font-bold text-primary">₹{order.total_amount}</p>
//                 </div>

//                 {order.status === 'READY' && (
//                   <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-2 text-center">
//                     <p className="text-green-700 font-bold text-sm">🍱 Your order is ready! Please collect.</p>
//                   </div>
//                 )}
//               </div>
//             )
//           })
//         )}
//       </div>
//     </div>
//   )
// }


// src/pages/OrdersPage.js
import { useEffect, useState } from 'react'
import { ArrowLeft, RefreshCw, ChevronRight } from 'lucide-react'
import { supabase }             from '../lib/supabaseClient'
import { getCanteenById }       from '../lib/menuData'
import { motion, AnimatePresence } from 'framer-motion'

// UI UPDATE: Colors mapped to deep dark mode aesthetics
const STATUS_LABELS = {
  PENDING:        { label: 'Pending',       color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  CONFIRMED:      { label: 'Confirmed',     color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  PREPARING:      { label: 'Preparing',     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  READY:          { label: '🍱 Ready!',     color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20'  },
  PICKED_UP:      { label: 'Completed',     color: 'text-gray-400',   bg: 'bg-white/5',       border: 'border-white/10'   },
  FAILED:         { label: 'Failed',        color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
  CANCELLED:      { label: 'Cancelled',     color: 'text-gray-500',   bg: 'bg-white/5',       border: 'border-white/10'   },
  REFUND_PENDING: { label: 'Refunding',     color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  REFUNDED:       { label: 'Refunded',      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
}

export default function OrdersPage({ onNavigate }) {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not logged in')
      setLoading(false)
      return
    }

    const { data, error: dbErr } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (dbErr) {
      setError(dbErr.message)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  return (
    <div className="min-h-screen bg-[#121212] pb-24 font-sans text-gray-100 selection:bg-[#f06e28] selection:text-white">
      {/* Header */}
      <div className="p-5 pb-6 pt-12 border-b border-white/5 bg-[#121212]/90 backdrop-blur-xl sticky top-0 z-30 shadow-xl">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('canteen-list')} className="bg-[#1c1c1e] p-3 rounded-full border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]">
            <ArrowLeft className="w-5 h-5 text-gray-200" />
          </motion.button>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-extrabold tracking-wide text-white">My Orders</h1>
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-0.5">Your History</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={loadOrders} className="bg-[#1c1c1e] p-3 rounded-full border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]">
            <RefreshCw className={`w-5 h-5 text-gray-200 ${loading ? 'animate-spin text-[#f06e28]' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-400 text-sm font-bold tracking-wider">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#1c1c1e] border-t-[#f06e28] rounded-full animate-spin shadow-[0_0_15px_rgba(240,110,40,0.5)]" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="text-6xl mb-5 opacity-40 grayscale">📋</div>
            <h2 className="font-heading text-2xl font-bold text-gray-200 tracking-wide">No orders yet</h2>
            <p className="text-gray-500 mt-2 font-medium tracking-wider text-sm">Your order history will appear here</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('canteen-list')}
              className="mt-8 bg-[#1c1c1e] text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase text-xs border border-white/10 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_12px_rgba(0,0,0,0.5)]"
            >
              Start Exploring
            </motion.button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="space-y-4">
            {orders.map(order => {
              const st      = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING
              const canteen = getCanteenById(order.canteen_id)
              const canClick = !['PENDING', 'FAILED', 'CANCELLED'].includes(order.status)

              return (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                  key={order.id}
                  className={`bg-[#1c1c1e] rounded-[28px] p-5 border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] transition-all ${
                    canClick ? 'cursor-pointer hover:border-white/10 hover:bg-white/[0.02]' : 'opacity-70'
                  }`}
                  onClick={() => canClick && onNavigate('order-success', { order })}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-heading font-extrabold text-white text-lg tracking-wide">#{order.token_number || '---'}</p>
                        {canteen && <span className="text-xs bg-[#121212] px-2 py-1 rounded-md border border-white/5 font-bold tracking-wider text-gray-300">{canteen.shortName}</span>}
                      </div>
                      <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mt-1">
                        {new Date(order.created_at).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border ${st.bg} ${st.color} ${st.border} shadow-sm`}>
                      {st.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-[#121212] p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Slot:</span>
                      <p className="font-bold text-gray-200 text-sm">{order.pickup_slot}</p>
                    </div>
                    <p className="font-heading font-black text-[#f06e28] text-xl">₹{order.total_amount}</p>
                  </div>

                  {order.status === 'READY' && (
                    <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                      <p className="text-green-400 font-bold tracking-wide text-sm">🍱 Ready for collection!</p>
                    </div>
                  )}

                  {canClick && order.status !== 'READY' && order.status !== 'PICKED_UP' && (
                     <div className="mt-4 flex items-center justify-center gap-1 text-[#f06e28] text-xs font-bold tracking-widest uppercase opacity-80">
                        View Tracker <ChevronRight className="w-4 h-4" />
                     </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}