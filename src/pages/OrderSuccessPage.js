import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// 1. Configuration for the Tracking UI
const STATUS_CONFIG = {
  CONFIRMED: { icon: '✅', label: 'Order Confirmed', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  READY:     { icon: '🍱', label: 'Waiting for Pickup', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  PICKED_UP: { icon: '🎉', label: 'Picked Up', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
}

const STATUS_ORDER = ['CONFIRMED', 'READY', 'PICKED_UP']

export default function OrderSuccessPage({ successData, onNavigate }) {
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('verifying') // verifying | confirmed | ready | picked_up
  const [loading, setLoading] = useState(true)

  // Determine Order ID safely from various possible prop names
  const orderId = successData?.orderId || successData?.id || successData?.order?.id

  // ── STEP 1: Initial Sync & Payment Verification ───────────────────────────
  useEffect(() => {
    if (!orderId) return

    const initOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Fetch error:', error.message)
        return
      }

      setOrder(data)
      
      if (data.status !== 'PENDING') {
        // If already paid, jump straight to the tracking UI
        setStatus(data.status)
        setLoading(false)
      } else {
        // If still pending, we wait for the Broadcast from Edge Function
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

  // ── STEP 2: Live Progress Updates (CONFIRMED -> READY -> PICKED_UP) ────────
  useEffect(() => {
    if (!order?.id || status === 'verifying') return

    const channel = supabase
      .channel(`live-progress-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        ({ new: updated }) => {
          if (STATUS_CONFIG[updated.status]) {
            setStatus(updated.status)
            setOrder(updated)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [order?.id, status])

  // ── VIEW A: Verifying Spinner ──────────────────────────────────────────────
  if (status === 'verifying' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
        <p className="text-gray-400 text-sm mt-2">Order ID: {orderId?.split('-')[0]}...</p>
      </div>
    )
  }

  // ── VIEW B: Tracking Dashboard ─────────────────────────────────────────────
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CONFIRMED
  const currentIndex = STATUS_ORDER.indexOf(status)

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Dynamic Hero Header */}
      <div className={`p-8 text-center transition-all duration-700 ${status === 'READY' ? 'bg-green-600' : 'bg-orange-500'} text-white shadow-lg`}>
        <div className="text-6xl mb-3 animate-bounce">{cfg.icon}</div>
        <h1 className="font-heading text-3xl font-bold mb-1">{cfg.label}</h1>
        <p className="text-white/80 text-sm italic">
          {status === 'READY' ? 'Please collect at the counter now!' : "We'll notify you the moment it's ready"}
        </p>
      </div>

      <div className="max-w-sm mx-auto px-4 mt-6 space-y-4">
        {/* Token Card */}
        <div className="bg-white rounded-3xl p-8 border-2 border-orange-100 text-center shadow-xl transform -mt-12 relative z-10">
          <p className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-2">Token Number</p>
          <div className="font-heading text-8xl font-black text-primary animate-pulse">
            {order.token_number || '...'}
          </div>
          <p className="text-gray-400 text-[10px] mt-4">Show this to the canteen staff to collect your order</p>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            Order Progress
          </h3>
          <div className="space-y-3">
            {STATUS_ORDER.map((s, idx) => {
              const c = STATUS_CONFIG[s]
              const isCurr = s === status
              const isDone = idx < currentIndex
              return (
                <div key={s} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCurr ? `${c.bg} ${c.border} border-2 scale-105 shadow-sm` : isDone ? 'opacity-50' : 'opacity-20'}`}>
                  <span className="text-2xl">{c.icon}</span>
                  <div className="flex-1 text-left">
                    <p className={`font-bold text-sm ${isCurr ? c.color : 'text-gray-600'}`}>{c.label}</p>
                    {isCurr && <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Live Status</p>}
                  </div>
                  {isCurr && <div className="w-2 h-2 bg-primary rounded-full animate-ping" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Paid Amount</span>
              <span className="font-bold text-primary text-lg">₹{order.total_amount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Pickup Slot</span>
              <span className="font-bold text-gray-700">{order.pickup_slot}</span>
            </div>
        </div>

        {/* Navigation Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button onClick={() => onNavigate('orders')} className="border-2 border-gray-200 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm">
            My Orders
          </button>
          <button onClick={() => onNavigate('canteen-list')} className="bg-primary text-white py-4 rounded-2xl font-bold shadow-button active:translate-y-1 transition-all text-sm">
            Order More
          </button>
        </div>
      </div>
    </div>
  )
}