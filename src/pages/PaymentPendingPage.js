// import { useEffect, useRef, useState } from 'react'
// import { supabase } from '../lib/supabaseClient'

// const STORAGE_KEY = 'campuseats_pending_order'

// export default function PaymentPendingPage({ pendingData, onNavigate, userId, sessionToken }) {
//   const { order, total } = pendingData
//   const [status, setStatus] = useState('waiting')
//   const [timeLeft, setTimeLeft] = useState(600)
  
//   // Refs for reliability
//   const confirmedRef = useRef(false) 
//   const navigateRef = useRef(onNavigate)

//   useEffect(() => { navigateRef.current = onNavigate }, [onNavigate])

//   // 1. verifyWithRetry() logic
//   // Absorbs WAL replication lag (checks 3 times with 200ms gaps)
//   const verifyWithRetry = async (retryCount = 0) => {
//     if (confirmedRef.current) return

//     const { data } = await supabase
//       .from('orders')
//       .select('status')
//       .eq('id', order.id)
//       .single()

//     if (data?.status === 'CONFIRMED') {
//       handleSuccess()
//     } else if (retryCount < 2) {
//       setTimeout(() => verifyWithRetry(retryCount + 1), 200)
//     }
//   }

//   const handleSuccess = () => {
//     if (confirmedRef.current) return
//     confirmedRef.current = true
//     setStatus('confirmed')
//     try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    
//     setTimeout(() => {
//       navigateRef.current('order-success', { order: { ...order, status: 'CONFIRMED' } })
//     }, 800)
//   }

//   // 2. Private Realtime + Reconnect
//   useEffect(() => {
//     // Listen on a private channel specific to this user/order
//     const channel = supabase
//       .channel(`private:confirm-${userId}`)
//       .on('postgres_changes', {
//         event: 'UPDATE', schema: 'public', table: 'orders',
//         filter: `id=eq.${order.id}`,
//       }, (payload) => {
//         if (payload.new.status === 'CONFIRMED') handleSuccess()
//         if (payload.new.status === 'FAILED') setStatus('failed')
//       })
//       .on('system', {}, ({ event }) => {
//         // Recovery logic: if we re-subscribe, check the DB immediately
//         if (event === 'SUBSCRIBED') verifyWithRetry()
//       })
//       .subscribe()

//     return () => { supabase.removeChannel(channel) }
//   }, [order.id, userId, sessionToken])

//   // 3. Adaptive Jitter Polling
//   useEffect(() => {
//     let timeoutId
//     let delay = 2000 // Start at 2s

//     const poll = async () => {
//       if (confirmedRef.current || status !== 'waiting') return

//       await verifyWithRetry()

//       // Backoff logic: increase delay up to 8s with ±0.5s jitter
//       delay = Math.min(delay * 1.2, 8000)
//       const jitter = (Math.random() - 0.5) * 1000
      
//       timeoutId = setTimeout(poll, delay + jitter)
//     }

//     timeoutId = setTimeout(poll, delay)
//     return () => clearTimeout(timeoutId)
//   }, [status])

//   // 4. Manual Cancel Button Logic
//   const handleManualCancel = async () => {
//     const { error } = await supabase
//       .from('orders')
//       .update({ status: 'CANCELLED' })
//       .eq('id', order.id)
//       .eq('status', 'PENDING') // Only cancel if it hasn't been confirmed yet

//     if (!error) onNavigate('canteen-list')
//   }

//   // 5. Countdown logic
//   useEffect(() => {
//     if (status !== 'waiting') return
//     const t = setInterval(() => {
//       setTimeLeft(s => {
//         if (s <= 1) { setStatus('failed'); return 0 }
//         return s - 1
//       })
//     }, 1000)
//     return () => clearInterval(t)
//   }, [status])

//   if (status === 'confirmed') return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-green-50 p-6">
//       <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl animate-bounce">✅</div>
//       <h2 className="text-2xl font-bold text-green-800">Order Placed!</h2>
//       <p className="text-green-600">Preparing your receipt...</p>
//     </div>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
//       <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
//       <h2 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Payment</h2>
//       <p className="text-gray-500 mb-8">Amount: ₹{total}</p>
      
//       <div className="bg-white p-4 rounded-2xl border border-orange-100 w-full max-w-sm mb-6">
//         <p className="text-gray-400 text-sm">Expires in</p>
//         <p className="text-3xl font-mono font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
//       </div>

//       <button 
//         onClick={handleManualCancel}
//         className="text-gray-400 underline text-sm"
//       >
//         Cancel and go back
//       </button>
//     </div>
//   )
// }


// src/pages/PaymentPendingPage.js
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'

const STORAGE_KEY = 'campuseats_pending_order'

export default function PaymentPendingPage({ pendingData, onNavigate, userId, sessionToken }) {
  const { order, total } = pendingData
  const [status, setStatus] = useState('waiting')
  const [timeLeft, setTimeLeft] = useState(600)
  
  const confirmedRef = useRef(false) 
  const navigateRef = useRef(onNavigate)

  useEffect(() => { navigateRef.current = onNavigate }, [onNavigate])

  const verifyWithRetry = async (retryCount = 0) => {
    if (confirmedRef.current) return
    const { data } = await supabase.from('orders').select('status').eq('id', order.id).single()

    if (data?.status === 'CONFIRMED') {
      handleSuccess()
    } else if (retryCount < 2) {
      setTimeout(() => verifyWithRetry(retryCount + 1), 200)
    }
  }

  const handleSuccess = () => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    setStatus('confirmed')
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    
    setTimeout(() => {
      navigateRef.current('order-success', { order: { ...order, status: 'CONFIRMED' } })
    }, 1200) // Slightly longer to show the checkmark animation
  }

  useEffect(() => {
    const channel = supabase.channel(`private:confirm-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` }, 
        (payload) => {
          if (payload.new.status === 'CONFIRMED') handleSuccess()
          if (payload.new.status === 'FAILED') setStatus('failed')
        }
      )
      .on('system', {}, ({ event }) => { if (event === 'SUBSCRIBED') verifyWithRetry() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [order.id, userId, sessionToken])

  useEffect(() => {
    let timeoutId
    let delay = 2000 
    const poll = async () => {
      if (confirmedRef.current || status !== 'waiting') return
      await verifyWithRetry()
      delay = Math.min(delay * 1.2, 8000)
      const jitter = (Math.random() - 0.5) * 1000
      timeoutId = setTimeout(poll, delay + jitter)
    }
    timeoutId = setTimeout(poll, delay)
    return () => clearTimeout(timeoutId)
  }, [status])

  const handleManualCancel = async () => {
    const { error } = await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', order.id).eq('status', 'PENDING')
    if (!error) onNavigate('canteen-list')
  }

  useEffect(() => {
    if (status !== 'waiting') return
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { setStatus('failed'); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status])

  if (status === 'confirmed') return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-6 p-6 font-sans">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: 'spring', damping: 15 }} className="w-24 h-24 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(34,197,94,0.3)] backdrop-blur-md">
        ✅
      </motion.div>
      <div className="text-center">
        <h2 className="font-heading text-3xl font-extrabold tracking-wide text-white mb-2">Order Secured</h2>
        <p className="text-green-400 font-bold tracking-widest uppercase text-xs">Generating Digital Receipt...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-[#f06e28] selection:text-white">
      <div className="relative mb-8">
        <div className="absolute inset-0 border-4 border-[#1c1c1e] rounded-full"></div>
        <div className="w-28 h-28 border-4 border-transparent border-t-[#f06e28] rounded-full animate-spin shadow-[0_0_20px_rgba(240,110,40,0.4)] relative z-10" />
        <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xl">₹</div>
      </div>
      
      <h2 className="font-heading text-2xl font-extrabold tracking-wide text-white mb-2">Awaiting Transfer</h2>
      <p className="text-gray-400 font-medium tracking-wider mb-10 text-sm">Please complete payment of <span className="font-bold text-[#f06e28]">₹{total}</span> in your UPI app</p>
      
      <motion.div 
        animate={{ scale: [1, 1.02, 1] }} 
        transition={{ repeat: Infinity, duration: 2 }} 
        className="bg-[#1c1c1e] p-6 rounded-[32px] border border-white/5 w-full max-w-xs mb-8 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f06e28] to-transparent opacity-30"></div>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px] mb-2">Session Expires In</p>
        <p className={`font-heading text-5xl font-black tracking-widest drop-shadow-lg ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
          {Math.floor(timeLeft / 60)}:<span className="font-sans">{String(timeLeft % 60).padStart(2, '0')}</span>
        </p>
      </motion.div>

      <button 
        onClick={handleManualCancel}
        className="text-gray-500 font-bold tracking-widest uppercase text-xs hover:text-red-400 transition-colors bg-white/5 px-6 py-3 rounded-full border border-white/5"
      >
        Cancel & Go Back
      </button>
    </div>
  )
}