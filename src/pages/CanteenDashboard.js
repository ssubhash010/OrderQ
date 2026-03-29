// src/pages/CanteenDashboard.js
import { useEffect, useState } from 'react'
import { ArrowLeft, ChefHat, LogOut, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getCanteenById, getMenuByCanteen } from '../lib/menuData'

// ── 1. CONSTANTS ──────────────────────────────────────────────────────────────
const NEXT_STATUS  = { 
  CONFIRMED: 'READY', 
  READY: 'PICKED_UP' 
}

const ACTION_LABEL = { 
  CONFIRMED: '🔔 Mark Ready for Pickup', 
  READY: '✅ Mark as Picked Up' 
}

const STATUS_COLOR = {
  CONFIRMED: 'border-blue-300 bg-blue-50',
  READY:     'border-green-300 bg-green-100 shadow-sm',
  PICKED_UP: 'border-gray-200 bg-gray-50 opacity-60',
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Staff Portal</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-primary focus:outline-none transition-all" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-primary focus:outline-none transition-all" />
          {errMsg && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{errMsg}</p>}
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-button transition-all">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
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

  // useEffect(() => {
  //   if (!staffUser) return
  //   loadOrders(); fetchStockStatus()
    
  //   const channel = supabase.channel(`db-${canteenId}`)
  //     .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `canteen_id=eq.${canteenId}` }, () => loadOrders(true))
  //     .subscribe()

  //   return () => { supabase.removeChannel(channel) }
  // }, [staffUser])
  useEffect(() => {
    if (!staffUser) return
    loadOrders(); fetchStockStatus()
    
    const channel = supabase.channel(`db-${canteenId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `canteen_id=eq.${canteenId}` }, () => loadOrders(true))
      // RT-5 Fix: Full re-fetch on network reconnect
      .on('system', {}, ({ event }) => {
         if (event === 'SUBSCRIBED') loadOrders(true) 
      })
      .subscribe()

    // RT-5 Fix: Full re-fetch on tab focus (waking up from background)
    const handleVisibility = () => { if (!document.hidden) loadOrders(true) }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => { 
      supabase.removeChannel(channel) 
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [staffUser, canteenId])

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

  // ── NEW: CANCEL LOGIC ───────────────────────────────────────────────────
  const handleCancel = async (order) => {
    const confirmCancel = window.confirm("Cancel this order? This will trigger an automatic refund for the student.");
    if (!confirmCancel) return;

    setUpdating(order.id);
    // const { error } = await supabase
    //   .from('orders')
    //   .update({ status: 'CANCELLED' })
    //   .eq('id', order.id);
    const { error } = await supabase.rpc('cancel_and_refund_order', {
      p_order_id: order.id,
      p_reason: "Canteen cancelled - Item Out of Stock"
    });

    if (error) alert("Error: " + error.message);
    else loadOrders(true);
    setUpdating(null);
  }

  if (!staffUser) return <StaffLogin onLogin={setStaffUser} />
  if (firstLoad) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const activeOrders = orders.filter(o => o.status !== 'PICKED_UP')

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gray-900 text-white p-5 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-4 mb-5">
          <button onClick={() => onNavigate('profile')} className="bg-white/10 p-2.5 rounded-2xl hover:bg-white/20 transition-all"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex-1">
             <h1 className="font-bold text-lg leading-tight">{canteen?.name}</h1>
             <p className="text-[10px] text-primary uppercase font-black tracking-widest">Dashboard Live</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => setStaffUser(null))} className="bg-red-500/20 text-red-400 p-2.5 rounded-2xl hover:bg-red-500/30 transition-all"><LogOut className="w-5 h-5" /></button>
        </div>

        <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
          <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg' : 'text-gray-400'}`}>Active Orders</button>
          <button onClick={() => setActiveTab('menu')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'menu' ? 'bg-primary text-white shadow-lg' : 'text-gray-400'}`}>Menu Management</button>
        </div>
      </div>

      {/* Stats Bar */}
      {activeTab === 'orders' && (
        <div className="bg-white border-b px-5 py-4 flex gap-8 shadow-sm">
          <div><p className="text-2xl font-black text-blue-600">{orders.filter(o => o.status === 'CONFIRMED').length}</p><p className="text-[10px] text-gray-400 font-bold uppercase">New</p></div>
          <div><p className="text-2xl font-black text-green-600">{orders.filter(o => o.status === 'READY').length}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Ready</p></div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4">
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
               <div className="text-center py-20 opacity-30"><ChefHat className="w-20 h-20 mx-auto mb-4" /><p className="font-bold">No pending orders</p></div>
            ) : (
              activeOrders.map(order => (
                <div key={order.id} className={`rounded-3xl border-2 p-5 transition-all animate-in slide-in-from-bottom-2 ${STATUS_COLOR[order.status]}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm text-gray-900">#{order.token_number}</div>
                      <div>
                        <p className="font-black text-gray-900 text-lg">₹{order.total_amount}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">{order.pickup_slot}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${order.status === 'READY' ? 'bg-green-200 text-green-700' : 'bg-blue-200 text-blue-700'}`}>
                      {order.status === 'READY' ? 'Waiting for Pickup' : 'New Order'}
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-2xl p-4 mb-4 space-y-2">
                    {order.order_items?.map(i => (
                      <div key={i.id} className="flex justify-between items-center text-sm font-bold text-gray-800">
                        <span>{i.quantity} × {i.name}</span>
                        <span className="text-gray-400 font-medium">₹{i.price * i.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* BUTTONS: ACTION + CANCEL */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(order)} 
                      disabled={updating === order.id} 
                      className="flex-[3] bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:translate-y-1 transition-all disabled:opacity-50"
                    >
                      {updating === order.id ? 'Updating...' : ACTION_LABEL[order.status]}
                    </button>

                    {order.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleCancel(order)}
                        disabled={updating === order.id}
                        className="flex-1 bg-red-50 text-red-500 border-2 border-red-100 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-red-100 transition-all flex flex-col items-center justify-center leading-none"
                      >
                        <XCircle className="w-4 h-4 mb-1" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Inventory Section */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b bg-gray-50/50"><h2 className="font-black text-gray-800 uppercase text-xs tracking-wider">Stock Control</h2></div>
            {menuItems.map(item => {
              const isAvailable = !overrides.has(item.id);
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={item.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm grayscale-[0.2]" alt={item.name} />
                    <div><p className="font-bold text-gray-900 text-sm">{item.name}</p><p className={`text-[10px] font-black uppercase ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>{isAvailable ? '● In Stock' : '● Sold Out'}</p></div>
                  </div>
                  <button onClick={() => toggleStock(item.id, isAvailable)} disabled={updating === item.id} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${isAvailable ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                    {updating === item.id ? '...' : isAvailable ? 'Out of Stock' : 'In Stock'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
