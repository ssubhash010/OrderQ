// // src/pages/CanteenDashboard.js
// import { useEffect, useState } from 'react'
// import { ArrowLeft, ChefHat, LogOut, XCircle } from 'lucide-react'
// import { supabase } from '../lib/supabaseClient'
// import { getCanteenById, getMenuByCanteen } from '../lib/menuData'
// import { requestFCMToken, onForegroundMessage } from '../lib/firebase'

// // ── 1. CONSTANTS ──────────────────────────────────────────────────────────────
// const NEXT_STATUS  = { 
//   CONFIRMED: 'READY', 
//   READY: 'PICKED_UP' 
// }

// const ACTION_LABEL = { 
//   CONFIRMED: '🔔 Mark Ready for Pickup', 
//   READY: '✅ Mark as Picked Up' 
// }

// const STATUS_COLOR = {
//   CONFIRMED: 'border-blue-300 bg-blue-50',
//   READY:     'border-green-300 bg-green-100 shadow-sm',
//   PICKED_UP: 'border-gray-200 bg-gray-50 opacity-60',
// }

// // ── 2. STAFF LOGIN COMPONENT ──────────────────────────────────────────────
// function StaffLogin({ onLogin }) {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [errMsg, setErrMsg] = useState('')

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     setLoading(true); setErrMsg('')
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
//     if (error) {
//       setErrMsg(error.message)
//     } else {
//       const meta = data.user?.user_metadata
//       if (meta?.role !== 'canteen_staff') {
//         await supabase.auth.signOut()
//         setErrMsg('Access Denied: Not a staff account.')
//       } else {
//         onLogin(data.user)
//       }
//     }
//     setLoading(false)
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
//       <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-gray-200">
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <ChefHat className="w-10 h-10 text-primary" />
//           </div>
//           <h1 className="text-2xl font-black text-gray-900">Staff Portal</h1>
//         </div>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
//             className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-primary focus:outline-none transition-all" />
//           <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
//             className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-primary focus:outline-none transition-all" />
//           {errMsg && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{errMsg}</p>}
//           <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-button transition-all">
//             {loading ? 'Authenticating...' : 'Sign In'}
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }

// // ── 3. MAIN DASHBOARD ─────────────────────────────────────────────────────
// export default function CanteenDashboard({ onNavigate }) {
//   const [staffUser, setStaffUser] = useState(null)
//   const [orders, setOrders] = useState([])
//   const [overrides, setOverrides] = useState(new Set()) 
//   const [activeTab, setActiveTab] = useState('orders') 
//   const [firstLoad, setFirstLoad] = useState(true)
//   const [updating, setUpdating] = useState(null)
  
//   const canteenId = staffUser?.user_metadata?.canteen_id
//   const canteen = canteenId ? getCanteenById(canteenId) : null
//   const menuItems = canteenId ? getMenuByCanteen(canteenId) : []

//   const loadOrders = async (silent = false) => {
//     if (!canteenId) { setFirstLoad(false); return }
//     if (!silent) setFirstLoad(true)
//     const { data } = await supabase
//       .from('orders')
//       .select('*, order_items(*)')
//       .eq('canteen_id', canteenId)
//       .in('status', ['CONFIRMED', 'READY', 'PICKED_UP'])
//       .order('token_number', { ascending: true })
//     if (data) setOrders(data)
//     setFirstLoad(false)
//   }

//   const fetchStockStatus = async () => {
//     if (!canteenId) return
//     const { data } = await supabase.from('item_overrides').select('item_id').eq('canteen_id', canteenId)
//     if (data) setOverrides(new Set(data.map(row => row.item_id)))
//   }

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data: { user } }) => {
//       if (user?.user_metadata?.role === 'canteen_staff') setStaffUser(user)
//       else setFirstLoad(false)
//     })
//   }, [])
//   useEffect(() => {
//     if (!staffUser) return
//     loadOrders(); fetchStockStatus()

//     const setupNotifications = async () => {
//       const token = await requestFCMToken();
//       if (token) {
//         await supabase.from('canteen_devices').upsert({
//           user_id: staffUser.id,
//           canteen_id: canteenId,
//           fcm_token: token,
//           updated_at: new Date().toISOString()
//         }, { onConflict: 'user_id' });
//       }
//     };
//     setupNotifications();
    
//     const unsubscribeFCM = onForegroundMessage((payload) => {
//       alert(`🔔 ${payload.notification?.title}\n${payload.notification?.body}`);
//       loadOrders(true); // Instantly refresh the kanban board
//     });

//     const channel = supabase.channel(`db-${canteenId}`)
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `canteen_id=eq.${canteenId}` }, () => loadOrders(true))
//       // RT-5 Fix: Full re-fetch on network reconnect
//       .on('system', {}, ({ event }) => {
//          if (event === 'SUBSCRIBED') loadOrders(true) 
//       })
//       .subscribe()

//     // RT-5 Fix: Full re-fetch on tab focus (waking up from background)
//     const handleVisibility = () => { if (!document.hidden) loadOrders(true) }
//     document.addEventListener('visibilitychange', handleVisibility)

//     return () => { 
//       supabase.removeChannel(channel) 
//       document.removeEventListener('visibilitychange', handleVisibility)
//       unsubscribeFCM();
//     }
//   }, [staffUser?.id, canteenId])

//   const toggleStock = async (itemId, isAvailable) => {
//     setUpdating(itemId)
//     if (isAvailable) {
//       await supabase.from('item_overrides').upsert({ item_id: itemId, canteen_id: canteenId, is_available: false })
//     } else {
//       await supabase.from('item_overrides').delete().eq('item_id', itemId).eq('canteen_id', canteenId)
//     }
//     await fetchStockStatus(); setUpdating(null)
//   }

//   const updateStatus = async (order) => {
//     const next = NEXT_STATUS[order.status]
//     if (!next) return
//     setUpdating(order.id)
//     await supabase.from('orders').update({ status: next }).eq('id', order.id)
//     await loadOrders(true)
//     setUpdating(null)
//   }

//   // ── NEW: CANCEL LOGIC ───────────────────────────────────────────────────
//   const handleCancel = async (order) => {
//     const confirmCancel = window.confirm("Cancel this order? This will trigger an automatic refund for the student.");
//     if (!confirmCancel) return;

//     setUpdating(order.id);
//     // const { error } = await supabase
//     //   .from('orders')
//     //   .update({ status: 'CANCELLED' })
//     //   .eq('id', order.id);
//     const { error } = await supabase.rpc('cancel_and_refund_order', {
//       p_order_id: order.id,
//       p_reason: "Canteen cancelled - Item Out of Stock"
//     });

//     if (error) alert("Error: " + error.message);
//     else loadOrders(true);
//     setUpdating(null);
//   }

//   if (!staffUser) return <StaffLogin onLogin={setStaffUser} />
//   if (firstLoad) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

//   const activeOrders = orders.filter(o => o.status !== 'PICKED_UP')

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       {/* Header */}
//       <div className="bg-gray-900 text-white p-5 sticky top-0 z-50 shadow-lg">
//         <div className="flex items-center gap-4 mb-5">
//           <button onClick={() => onNavigate('profile')} className="bg-white/10 p-2.5 rounded-2xl hover:bg-white/20 transition-all"><ArrowLeft className="w-5 h-5" /></button>
//           <div className="flex-1">
//              <h1 className="font-bold text-lg leading-tight">{canteen?.name}</h1>
//              <p className="text-[10px] text-primary uppercase font-black tracking-widest">Dashboard Live</p>
//           </div>
//           <button onClick={() => supabase.auth.signOut().then(() => setStaffUser(null))} className="bg-red-500/20 text-red-400 p-2.5 rounded-2xl hover:bg-red-500/30 transition-all"><LogOut className="w-5 h-5" /></button>
//         </div>

//         <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
//           <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg' : 'text-gray-400'}`}>Active Orders</button>
//           <button onClick={() => setActiveTab('menu')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'menu' ? 'bg-primary text-white shadow-lg' : 'text-gray-400'}`}>Menu Management</button>
//         </div>
//       </div>

//       {/* Stats Bar */}
//       {activeTab === 'orders' && (
//         <div className="bg-white border-b px-5 py-4 flex gap-8 shadow-sm">
//           <div><p className="text-2xl font-black text-blue-600">{orders.filter(o => o.status === 'CONFIRMED').length}</p><p className="text-[10px] text-gray-400 font-bold uppercase">New</p></div>
//           <div><p className="text-2xl font-black text-green-600">{orders.filter(o => o.status === 'READY').length}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Ready</p></div>
//         </div>
//       )}

//       <div className="max-w-2xl mx-auto p-4">
//         {activeTab === 'orders' ? (
//           <div className="space-y-4">
//             {activeOrders.length === 0 ? (
//                <div className="text-center py-20 opacity-30"><ChefHat className="w-20 h-20 mx-auto mb-4" /><p className="font-bold">No pending orders</p></div>
//             ) : (
//               activeOrders.map(order => (
//                 <div key={order.id} className={`rounded-3xl border-2 p-5 transition-all animate-in slide-in-from-bottom-2 ${STATUS_COLOR[order.status]}`}>
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex gap-4">
//                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm text-gray-900">#{order.token_number}</div>
//                       <div>
//                         <p className="font-black text-gray-900 text-lg">₹{order.total_amount}</p>
//                         <p className="text-xs font-bold text-gray-500 uppercase">{order.pickup_slot}</p>
//                       </div>
//                     </div>
//                     <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${order.status === 'READY' ? 'bg-green-200 text-green-700' : 'bg-blue-200 text-blue-700'}`}>
//                       {order.status === 'READY' ? 'Waiting for Pickup' : 'New Order'}
//                     </div>
//                   </div>

//                   <div className="bg-white/60 rounded-2xl p-4 mb-4 space-y-2">
//                     {order.order_items?.map(i => (
//                       <div key={i.id} className="flex justify-between items-center text-sm font-bold text-gray-800">
//                         <span>{i.quantity} × {i.name}</span>
//                         <span className="text-gray-400 font-medium">₹{i.price * i.quantity}</span>
//                       </div>
//                     ))}
//                   </div>

//                   {/* BUTTONS: ACTION + CANCEL */}
//                   <div className="flex gap-2">
//                     <button 
//                       onClick={() => updateStatus(order)} 
//                       disabled={updating === order.id} 
//                       className="flex-[3] bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:translate-y-1 transition-all disabled:opacity-50"
//                     >
//                       {updating === order.id ? 'Updating...' : ACTION_LABEL[order.status]}
//                     </button>

//                     {order.status === 'CONFIRMED' && (
//                       <button 
//                         onClick={() => handleCancel(order)}
//                         disabled={updating === order.id}
//                         className="flex-1 bg-red-50 text-red-500 border-2 border-red-100 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-red-100 transition-all flex flex-col items-center justify-center leading-none"
//                       >
//                         <XCircle className="w-4 h-4 mb-1" />
//                         Cancel
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         ) : (
//           /* Inventory Section */
//           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
//             <div className="p-5 border-b bg-gray-50/50"><h2 className="font-black text-gray-800 uppercase text-xs tracking-wider">Stock Control</h2></div>
//             {menuItems.map(item => {
//               const isAvailable = !overrides.has(item.id);
//               return (
//                 <div key={item.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
//                   <div className="flex items-center gap-4">
//                     <img src={item.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm grayscale-[0.2]" alt={item.name} />
//                     <div><p className="font-bold text-gray-900 text-sm">{item.name}</p><p className={`text-[10px] font-black uppercase ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>{isAvailable ? '● In Stock' : '● Sold Out'}</p></div>
//                   </div>
//                   <button onClick={() => toggleStock(item.id, isAvailable)} disabled={updating === item.id} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${isAvailable ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
//                     {updating === item.id ? '...' : isAvailable ? 'Out of Stock' : 'In Stock'}
//                   </button>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


// src/pages/CanteenDashboard.js
import { useEffect, useState } from 'react'
import { ArrowLeft, ChefHat, LogOut, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getCanteenById, getMenuByCanteen } from '../lib/menuData'
import { requestFCMToken, onForegroundMessage } from '../lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'

// ── 1. CONSTANTS ──────────────────────────────────────────────────────────────
const NEXT_STATUS  = { 
  CONFIRMED: 'READY', 
  READY: 'PICKED_UP' 
}

const ACTION_LABEL = { 
  CONFIRMED: '🔔 Mark Ready for Pickup', 
  READY: '✅ Mark as Picked Up' 
}

// UI UPDATE: Adjusted for dark mode compatibility
const STATUS_COLOR = {
  CONFIRMED: 'border-blue-500/30 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  READY:     'border-green-500/30 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
  PICKED_UP: 'border-white/5 bg-[#121212] opacity-50',
}

// ── 2. STAFF LOGIN COMPONENT ──────────────────────────────────────────────
function StaffLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setErrMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setErrMsg(error.message)
    } else {
      const meta = data.user?.user_metadata
      if (meta?.role !== 'canteen_staff') {
        await supabase.auth.signOut()
        setErrMsg('Access Denied: Not a staff account.')
      } else {
        onLogin(data.user)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#1c1c1e] rounded-[32px] shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] border border-white/5 p-8 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#f06e28]/10 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-[#f06e28]/20 shadow-inner">
            <ChefHat className="w-10 h-10 text-[#f06e28]" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold tracking-wide text-white">Staff Portal</h1>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-2">Authorized Access Only</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:border-[#f06e28] focus:outline-none focus:ring-1 focus:ring-[#f06e28] transition-all font-medium tracking-wide shadow-inner" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full bg-[#121212] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:border-[#f06e28] focus:outline-none focus:ring-1 focus:ring-[#f06e28] transition-all font-medium tracking-wide shadow-inner" />
          {errMsg && <p className="text-red-400 text-xs font-bold tracking-wider text-center bg-red-500/10 border border-red-500/20 py-3 rounded-xl">{errMsg}</p>}
          <motion.button whileTap={{ scale: 0.96 }} type="submit" disabled={loading} className="w-full bg-[#f06e28] text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-sm shadow-[0_8px_20px_-4px_rgba(240,110,40,0.4)] disabled:opacity-50 transition-all">
            {loading ? 'Authenticating...' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

// ── 3. MAIN DASHBOARD ─────────────────────────────────────────────────────
export default function CanteenDashboard({ onNavigate }) {
  const [staffUser, setStaffUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [overrides, setOverrides] = useState(new Set()) 
  const [activeTab, setActiveTab] = useState('orders') 
  const [firstLoad, setFirstLoad] = useState(true)
  const [updating, setUpdating] = useState(null)
  
  const canteenId = staffUser?.user_metadata?.canteen_id
  const canteen = canteenId ? getCanteenById(canteenId) : null
  const menuItems = canteenId ? getMenuByCanteen(canteenId) : []

  const loadOrders = async (silent = false) => {
    if (!canteenId) { setFirstLoad(false); return }
    if (!silent) setFirstLoad(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('canteen_id', canteenId)
      .in('status', ['CONFIRMED', 'READY', 'PICKED_UP'])
      .order('token_number', { ascending: true })
    if (data) setOrders(data)
    setFirstLoad(false)
  }

  const fetchStockStatus = async () => {
    if (!canteenId) return
    const { data } = await supabase.from('item_overrides').select('item_id').eq('canteen_id', canteenId)
    if (data) setOverrides(new Set(data.map(row => row.item_id)))
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === 'canteen_staff') setStaffUser(user)
      else setFirstLoad(false)
    })
  }, [])

  useEffect(() => {
    if (!staffUser) return
    loadOrders(); fetchStockStatus()

    const setupNotifications = async () => {
      const token = await requestFCMToken();
      if (token) {
        await supabase.from('canteen_devices').upsert({
          user_id: staffUser.id,
          canteen_id: canteenId,
          fcm_token: token,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
    };
    setupNotifications();
    
    const unsubscribeFCM = onForegroundMessage((payload) => {
      alert(`🔔 ${payload.notification?.title}\n${payload.notification?.body}`);
      loadOrders(true); 
    });

    const channel = supabase.channel(`db-${canteenId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `canteen_id=eq.${canteenId}` }, () => loadOrders(true))
      .on('system', {}, ({ event }) => {
         if (event === 'SUBSCRIBED') loadOrders(true) 
      })
      .subscribe()

    const handleVisibility = () => { if (!document.hidden) loadOrders(true) }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => { 
      supabase.removeChannel(channel) 
      document.removeEventListener('visibilitychange', handleVisibility)
      unsubscribeFCM();
    }
  }, [staffUser?.id, canteenId])

  const toggleStock = async (itemId, isAvailable) => {
    setUpdating(itemId)
    if (isAvailable) {
      await supabase.from('item_overrides').upsert({ item_id: itemId, canteen_id: canteenId, is_available: false })
    } else {
      await supabase.from('item_overrides').delete().eq('item_id', itemId).eq('canteen_id', canteenId)
    }
    await fetchStockStatus(); setUpdating(null)
  }

  const updateStatus = async (order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setUpdating(order.id)
    await supabase.from('orders').update({ status: next }).eq('id', order.id)
    await loadOrders(true)
    setUpdating(null)
  }

  const handleCancel = async (order) => {
    const confirmCancel = window.confirm("Cancel this order? This will trigger an automatic refund for the student.");
    if (!confirmCancel) return;

    setUpdating(order.id);
    const { error } = await supabase.rpc('cancel_and_refund_order', {
      p_order_id: order.id,
      p_reason: "Canteen cancelled - Item Out of Stock"
    });

    if (error) alert("Error: " + error.message);
    else loadOrders(true);
    setUpdating(null);
  }

  if (!staffUser) return <StaffLogin onLogin={setStaffUser} />
  if (firstLoad) return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#1c1c1e] border-t-[#f06e28] rounded-full animate-spin shadow-[0_0_15px_rgba(240,110,40,0.5)]" />
      <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Loading System...</p>
    </div>
  )

  const activeOrders = orders.filter(o => o.status !== 'PICKED_UP')

  return (
    <div className="min-h-screen bg-[#121212] pb-24 font-sans text-gray-100 selection:bg-[#f06e28] selection:text-white">
      {/* Header */}
      <div className="bg-[#121212]/90 backdrop-blur-xl p-5 pt-12 sticky top-0 z-50 border-b border-white/5 shadow-2xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-5">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('profile')} className="bg-[#1c1c1e] p-3 rounded-full border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]"><ArrowLeft className="w-5 h-5 text-gray-200" /></motion.button>
            <div className="flex-1">
               <h1 className="font-heading font-extrabold tracking-wide text-xl text-white leading-tight">{canteen?.name}</h1>
               <div className="flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">System Online</p>
               </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => supabase.auth.signOut().then(() => setStaffUser(null))} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-full shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]"><LogOut className="w-4 h-4" /></motion.button>
          </div>

          <div className="flex bg-[#1c1c1e] rounded-2xl p-1.5 gap-1.5 border border-white/5 shadow-inner">
            <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-[#f06e28] text-white shadow-[0_4px_10px_-2px_rgba(240,110,40,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}>Active</button>
            <button onClick={() => setActiveTab('menu')} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'bg-[#f06e28] text-white shadow-[0_4px_10px_-2px_rgba(240,110,40,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}>Menu</button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <AnimatePresence>
        {activeTab === 'orders' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#1c1c1e] border-b border-white/5 px-6 py-4 flex gap-10 shadow-lg justify-center max-w-2xl mx-auto overflow-hidden">
            <div className="text-center">
              <p className="text-3xl font-heading font-black text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">{orders.filter(o => o.status === 'CONFIRMED').length}</p>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">New</p>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center">
              <p className="text-3xl font-heading font-black text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">{orders.filter(o => o.status === 'READY').length}</p>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">Ready</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto p-5 mt-2">
        {activeTab === 'orders' ? (
          <div className="space-y-5">
            {activeOrders.length === 0 ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 opacity-40">
                 <ChefHat className="w-20 h-20 mx-auto mb-4 text-gray-500" />
                 <p className="font-bold tracking-widest uppercase text-sm">No Pending Orders</p>
               </motion.div>
            ) : (
              <AnimatePresence>
                {activeOrders.map((order, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={order.id} 
                    className={`rounded-[28px] border-2 p-5 transition-all bg-[#1c1c1e] relative overflow-hidden ${STATUS_COLOR[order.status]}`}
                  >
                    {order.status === 'CONFIRMED' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>}
                    {order.status === 'READY' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-transparent"></div>}

                    <div className="flex justify-between items-start mb-5">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-[#121212] border border-white/10 rounded-2xl flex items-center justify-center font-heading font-black text-3xl shadow-inner text-white">#{order.token_number}</div>
                        <div className="flex flex-col justify-center">
                          <p className="font-heading font-black text-[#f06e28] text-xl tracking-wide">₹{order.total_amount}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">{order.pickup_slot}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${order.status === 'READY' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                        {order.status === 'READY' ? 'Waiting' : 'New'}
                      </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 shadow-inner rounded-2xl p-4 mb-5 space-y-3">
                      {order.order_items?.map((i, index) => (
                        <div key={i.id} className={`flex justify-between items-center text-sm font-bold text-gray-200 tracking-wide ${index > 0 ? 'border-t border-white/5 pt-3' : ''}`}>
                          <span><span className="text-[#f06e28] mr-2">{i.quantity}×</span > {i.name}</span>
                          <span className="text-gray-500 font-medium tracking-wider">₹{i.price * i.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateStatus(order)} 
                        disabled={updating === order.id} 
                        className={`flex-[3] py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 border ${
                          order.status === 'READY' 
                            ? 'bg-gray-800 text-white border-white/10 hover:bg-gray-700' 
                            : 'bg-[#f06e28] text-white border-[#f06e28]/50 shadow-[0_8px_20px_-4px_rgba(240,110,40,0.3)]'
                        }`}
                      >
                        {updating === order.id ? 'Processing...' : ACTION_LABEL[order.status]}
                      </motion.button>

                      {order.status === 'CONFIRMED' && (
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancel(order)}
                          disabled={updating === order.id}
                          className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-red-500/20 transition-all flex flex-col items-center justify-center leading-none"
                        >
                          <XCircle className="w-4 h-4 mb-1" />
                          Cancel
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        ) : (
          /* Inventory Section */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1c1c1e] rounded-[32px] border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-[#121212]/50"><h2 className="font-black text-gray-400 uppercase text-xs tracking-widest">Live Stock Control</h2></div>
            <div className="divide-y divide-white/5">
              {menuItems.map(item => {
                const isAvailable = !overrides.has(item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-inner border border-white/5 flex-shrink-0">
                        <img src={item.image} className={`w-full h-full object-cover transition-all ${!isAvailable ? 'grayscale opacity-50' : ''}`} alt={item.name} />
                      </div>
                      <div>
                        <p className={`font-bold tracking-wide text-sm mb-1 ${isAvailable ? 'text-gray-100' : 'text-gray-500'}`}>{item.name}</p>
                        <p className={`text-[9px] font-black tracking-widest uppercase ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                          {isAvailable ? '● Active' : '● Depleted'}
                        </p>
                      </div>
                    </div>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleStock(item.id, isAvailable)} 
                      disabled={updating === item.id} 
                      className={`px-5 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${
                        isAvailable 
                          ? 'bg-[#121212] text-red-400 border-red-500/30 hover:bg-red-500/10' 
                          : 'bg-[#121212] text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:bg-green-500/10'
                      }`}
                    >
                      {updating === item.id ? 'Wait' : isAvailable ? 'Kill' : 'Revive'}
                    </motion.button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}