// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabaseClient'

// // 1. Configuration for the Tracking UI
// const STATUS_CONFIG = {
//   CONFIRMED: { icon: '✅', label: 'Order Confirmed', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
//   READY:     { icon: '🍱', label: 'Waiting for Pickup', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
//   PICKED_UP: { icon: '🎉', label: 'Picked Up', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
// }

// const STATUS_ORDER = ['CONFIRMED', 'READY', 'PICKED_UP']

// export default function OrderSuccessPage({ successData, onNavigate }) {
//   const [order, setOrder] = useState(null)
//   const [status, setStatus] = useState('verifying') // verifying | confirmed | ready | picked_up
//   const [loading, setLoading] = useState(true)

//   // Determine Order ID safely from various possible prop names
//   const orderId = successData?.orderId || successData?.id || successData?.order?.id

//   // ── STEP 1: Initial Sync & Payment Verification ───────────────────────────
//   useEffect(() => {
//     if (!orderId) return

//     const initOrder = async () => {
//       const { data, error } = await supabase
//         .from('orders')
//         .select('*')
//         .eq('id', orderId)
//         .single()

//       if (error) {
//         console.error('Fetch error:', error.message)
//         return
//       }

//       setOrder(data)
      
//       if (data.status !== 'PENDING') {
//         // If already paid, jump straight to the tracking UI
//         setStatus(data.status)
//         setLoading(false)
//       } else {
//         // If still pending, we wait for the Broadcast from Edge Function
//         subscribeToPayment(data.user_id)
//       }
//     }

//     const subscribeToPayment = (userId) => {
//       const channel = supabase.channel(`private:confirm-${userId}`)
//         .on('broadcast', { event: 'payment_success' }, (payload) => {
//           if (payload.payload.order_id === orderId) {
//             setOrder(prev => ({ ...prev, status: 'CONFIRMED', token_number: payload.payload.token_number }))
//             setStatus('CONFIRMED')
//             setLoading(false)
//             if (navigator.vibrate) navigator.vibrate([100, 30, 100])
//           }
//         })
//         .subscribe()

//       return () => supabase.removeChannel(channel)
//     }

//     initOrder()
//   }, [orderId])

//   // ── STEP 2: Live Progress Updates (CONFIRMED -> READY -> PICKED_UP) ────────
//   useEffect(() => {
//     if (!order?.id || status === 'verifying') return

//     const channel = supabase
//       .channel(`live-progress-${order.id}`)
//       .on(
//         'postgres_changes',
//         { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
//         ({ new: updated }) => {
//           if (STATUS_CONFIG[updated.status]) {
//             setStatus(updated.status)
//             setOrder(updated)
//           }
//         }
//       )
//       .subscribe()

//     return () => supabase.removeChannel(channel)
//   }, [order?.id, status])

//   // ── VIEW A: Verifying Spinner ──────────────────────────────────────────────
//   if (status === 'verifying' || loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
//         <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
//         <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
//         <p className="text-gray-400 text-sm mt-2">Order ID: {orderId?.split('-')[0]}...</p>
//       </div>
//     )
//   }

//   // ── VIEW B: Tracking Dashboard ─────────────────────────────────────────────
//   const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CONFIRMED
//   const currentIndex = STATUS_ORDER.indexOf(status)

//   return (
//     <div className="min-h-screen bg-gray-50 pb-10">
//       {/* Dynamic Hero Header */}
//       <div className={`p-8 text-center transition-all duration-700 ${status === 'READY' ? 'bg-green-600' : 'bg-orange-500'} text-white shadow-lg`}>
//         <div className="text-6xl mb-3 animate-bounce">{cfg.icon}</div>
//         <h1 className="font-heading text-3xl font-bold mb-1">{cfg.label}</h1>
//         <p className="text-white/80 text-sm italic">
//           {status === 'READY' ? 'Please collect at the counter now!' : "We'll notify you the moment it's ready"}
//         </p>
//       </div>

//       <div className="max-w-sm mx-auto px-4 mt-6 space-y-4">
//         {/* Token Card */}
//         <div className="bg-white rounded-3xl p-8 border-2 border-orange-100 text-center shadow-xl transform -mt-12 relative z-10">
//           <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Token Number</p>
//           <div className="font-heading text-8xl font-black text-primary animate-pulse">
//             {order.token_number || '...'}
//           </div>
//           <p className="text-gray-400 text-[10px] mt-4">Show this to the canteen staff to collect your order</p>
//         </div>

//         {/* Progress Tracker */}
//         <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
//           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
//             <div className="w-1.5 h-4 bg-primary rounded-full" />
//             Order Progress
//           </h3>
//           <div className="space-y-3">
//             {STATUS_ORDER.map((s, idx) => {
//               const c = STATUS_CONFIG[s]
//               const isCurr = s === status
//               const isDone = idx < currentIndex
//               return (
//                 <div key={s} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCurr ? `${c.bg} ${c.border} border-2 scale-105 shadow-sm` : isDone ? 'opacity-50' : 'opacity-20'}`}>
//                   <span className="text-2xl">{c.icon}</span>
//                   <div className="flex-1 text-left">
//                     <p className={`font-bold text-sm ${isCurr ? c.color : 'text-gray-600'}`}>{c.label}</p>
//                     {isCurr && <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Live Status</p>}
//                   </div>
//                   {isCurr && <div className="w-2 h-2 bg-primary rounded-full animate-ping" />}
//                 </div>
//               )
//             })}
//           </div>
//         </div>

//         {/* Order Details Grid */}
//         <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm space-y-3">
//             <div className="flex justify-between items-center text-sm">
//               <span className="text-gray-400">Paid Amount</span>
//               <span className="font-bold text-primary text-lg">₹{order.total_amount}</span>
//             </div>
//             <div className="flex justify-between items-center text-sm">
//               <span className="text-gray-400">Pickup Slot</span>
//               <span className="font-bold text-gray-700">{order.pickup_slot}</span>
//             </div>
//         </div>

//         {/* Navigation Actions */}
//         <div className="grid grid-cols-2 gap-4 pt-4">
//           <button onClick={() => onNavigate('orders')} className="border-2 border-gray-200 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm">
//             My Orders
//           </button>
//           <button onClick={() => onNavigate('canteen-list')} className="bg-primary text-white py-4 rounded-2xl font-bold shadow-button active:translate-y-1 transition-all text-sm">
//             Order More
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// src/pages/OrderSuccessPage.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

// UI UPDATE: Adjusted configurations for dark mode elegance
const STATUS_CONFIG = {
  CONFIRMED: { icon: '✅', label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
  READY:     { icon: '🍱', label: 'Ready for Pickup', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]' },
  PICKED_UP: { icon: '🎉', label: 'Completed', color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', glow: 'shadow-none' },
}

const STATUS_ORDER = ['CONFIRMED', 'READY', 'PICKED_UP']

export default function OrderSuccessPage({ successData, onNavigate }) {
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('verifying') 
  const [loading, setLoading] = useState(true)

  const orderId = successData?.orderId || successData?.id || successData?.order?.id

  useEffect(() => {
    if (!orderId) return

    const initOrder = async () => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single()
      if (error) return console.error('Fetch error:', error.message)

      setOrder(data)
      if (data.status !== 'PENDING') {
        setStatus(data.status)
        setLoading(false)
      } else {
        subscribeToPayment(data.user_id)
      }
    }

    const subscribeToPayment = (userId) => {
      const channel = supabase.channel(`private:confirm-${userId}`)
        .on('broadcast', { event: 'payment_success' }, (payload) => {
          if (payload.payload.order_id === orderId) {
            setOrder(prev => ({ ...prev, status: 'CONFIRMED', token_number: payload.payload.token_number }))
            setStatus('CONFIRMED')
            setLoading(false)
            if (navigator.vibrate) navigator.vibrate([100, 30, 100])
          }
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    }

    initOrder()
  }, [orderId])

  useEffect(() => {
    if (!order?.id || status === 'verifying') return
    const channel = supabase.channel(`live-progress-${order.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        ({ new: updated }) => {
          if (STATUS_CONFIG[updated.status]) {
            setStatus(updated.status)
            setOrder(updated)
          }
        }
      ).subscribe()
    return () => supabase.removeChannel(channel)
  }, [order?.id, status])

  // ── VIEW A: Verifying Spinner ──────────────────────────────────────────────
  if (status === 'verifying' || loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-16 h-16 border-4 border-[#1c1c1e] border-t-[#f06e28] rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(240,110,40,0.5)]" />
        <h2 className="text-xl font-heading font-extrabold tracking-wide text-white">Verifying Transaction</h2>
        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-3 bg-[#1c1c1e] px-4 py-2 rounded-lg border border-white/5 shadow-inner">ID: {orderId?.split('-')[0]}...</p>
      </div>
    )
  }

  // ── VIEW B: Tracking Dashboard ─────────────────────────────────────────────
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CONFIRMED
  const currentIndex = STATUS_ORDER.indexOf(status)

  return (
    <div className="min-h-screen bg-[#121212] pb-10 font-sans selection:bg-[#f06e28] selection:text-white">
      {/* Dynamic Hero Header (Dark Mode Version) */}
      <div className={`pt-16 pb-20 px-8 text-center transition-all duration-1000 relative overflow-hidden ${status === 'READY' ? 'bg-[#062c14]' : 'bg-[#1c1c1e]'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]"></div>
        <div className="relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} className="text-7xl mb-4 drop-shadow-2xl">{cfg.icon}</motion.div>
          <h1 className="font-heading text-3xl font-extrabold tracking-wide text-white mb-2">{cfg.label}</h1>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">
            {status === 'READY' ? 'Please collect at the counter' : "Live Tracking Active"}
          </p>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 space-y-5 -mt-12 relative z-20">
        {/* Token Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`bg-[#1c1c1e] rounded-[32px] p-8 border ${cfg.border} text-center shadow-2xl relative overflow-hidden backdrop-blur-xl ${cfg.glow}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-2">Secure Pickup Token</p>
          <div className="font-heading text-8xl font-black text-white drop-shadow-lg tracking-tighter">
            {order.token_number || '...'}
          </div>
          <p className="text-[#f06e28] text-xs font-bold tracking-widest mt-4 uppercase">Show at Counter</p>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#1c1c1e] rounded-[28px] p-6 border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)]">
          <h3 className="font-bold text-gray-300 mb-5 flex items-center gap-3 text-xs tracking-widest uppercase">
            <div className="w-2 h-2 bg-gray-500 rounded-full" /> Timeline
          </h3>
          <div className="space-y-4">
            {STATUS_ORDER.map((s, idx) => {
              const c = STATUS_CONFIG[s]
              const isCurr = s === status
              const isDone = idx < currentIndex
              return (
                <div key={s} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${isCurr ? `${c.bg} ${c.border} border shadow-inner` : isDone ? 'opacity-60 grayscale' : 'opacity-20 grayscale'}`}>
                  <span className="text-2xl drop-shadow-md">{c.icon}</span>
                  <div className="flex-1 text-left">
                    <p className={`font-bold tracking-wide text-sm ${isCurr ? c.color : 'text-gray-300'}`}>{c.label}</p>
                    {isCurr && <p className={`text-[9px] uppercase font-black tracking-widest mt-1 ${c.color} opacity-70`}>Current Status</p>}
                  </div>
                  {isCurr && <div className={`w-3 h-3 rounded-full animate-ping opacity-75 ${s==='READY' ? 'bg-green-500' : 'bg-blue-500'}`} />}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Order Details Grid */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#1c1c1e] rounded-[28px] p-6 border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
              <span className="text-gray-500 font-bold tracking-widest uppercase text-[10px]">Total Paid</span>
              <span className="font-heading font-black text-white text-xl">₹{order.total_amount}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-gray-500 font-bold tracking-widest uppercase text-[10px]">Pickup Slot</span>
              <span className="font-bold text-gray-200 tracking-wide bg-[#121212] px-3 py-1 rounded-md border border-white/5">{order.pickup_slot}</span>
            </div>
        </motion.div>

        {/* Navigation Actions */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => onNavigate('orders')} className="bg-[#121212] border border-white/10 text-gray-300 py-4 rounded-2xl font-bold tracking-widest uppercase text-[10px] hover:bg-white/5 transition-all shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.4)]">
            Order History
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => onNavigate('canteen-list')} className="bg-[#f06e28] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-[10px] shadow-[0_8px_20px_-4px_rgba(240,110,40,0.4)] transition-all">
            New Order
          </motion.button>
        </div>
      </div>
    </div>
  )
}