import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const STATUS_CONFIG = {
  CONFIRMED:  { icon: '✅', label: 'Order Confirmed',   color: 'text-blue-700',  bg: 'bg-blue-50',   border: 'border-blue-200' },
  PREPARING:  { icon: '👨‍🍳', label: 'Being Prepared',   color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200' },
  READY:      { icon: '🍱', label: 'Ready for Pickup!', color: 'text-green-700', bg: 'bg-green-50',  border: 'border-green-200' },
  PICKED_UP:  { icon: '🎉', label: 'Picked Up',         color: 'text-gray-600',  bg: 'bg-gray-50',   border: 'border-gray-200' },
}

export default function OrderSuccessPage({ successData, onNavigate }) {
  const { order } = successData
  const [status, setStatus] = useState(order.status || 'CONFIRMED')

  // Live status updates from canteen
  useEffect(() => {
    const channel = supabase
      .channel(`order-status-${order.id}`)
      .on('postgres_changes', { filter: `id=eq.${order.id}` }, ({ new: updated }) => {
        setStatus(updated.status)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [order.id])

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CONFIRMED

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Hero */}
      <div className={`${status === 'READY' ? 'gradient-success' : 'gradient-hero'} text-white p-8 text-center transition-all duration-1000`}>
        <div className="text-6xl mb-3">{cfg.icon}</div>
        <h1 className="font-heading text-3xl font-bold mb-1">{cfg.label}</h1>
        <p className="text-white/80 text-sm">
          {status === 'READY' ? 'Please collect at the counter now!' : 'We\'ll notify you when it\'s ready'}
        </p>
      </div>

      <div className="max-w-sm mx-auto px-4 mt-6 space-y-4">
        {/* Token card */}
        <div className="bg-white rounded-2xl p-6 border border-orange-100 text-center">
          <p className="text-gray-500 text-sm mb-2">Your Token Number</p>
          <div className="font-heading text-7xl font-bold text-primary">{order.token_number}</div>
          <p className="text-gray-400 text-xs mt-2">Show this at the counter</p>
        </div>

        {/* Status tracker */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100">
          <h3 className="font-semibold text-gray-700 mb-4">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([s, c]) => {
              const statuses = ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP']
              const currentIdx = statuses.indexOf(status)
              const thisIdx = statuses.indexOf(s)
              const isDone = thisIdx < currentIdx
              const isCurrent = s === status
              return (
                <div key={s} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCurrent ? `${c.bg} ${c.border} border-2` : isDone ? 'opacity-50' : 'opacity-30'
                }`}>
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <p className={`font-semibold text-sm ${isCurrent ? c.color : 'text-gray-600'}`}>{c.label}</p>
                    {isCurrent && <p className="text-xs text-gray-400">Current status</p>}
                  </div>
                  {isCurrent && <div className="ml-auto w-3 h-3 bg-primary rounded-full animate-pulse" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100">
          <h3 className="font-semibold text-gray-700 mb-3">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Order ID</span>
              <span className="font-mono text-xs text-gray-400 max-w-[160px] truncate">{order.id}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Amount Paid</span>
              <span className="font-bold text-primary">₹{order.total_amount}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Pickup Slot</span>
              <span className="font-semibold">{order.pickup_slot}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee</span>
              <span className="text-green-600 font-semibold">₹0 🎉</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('orders')}
            className="border-2 border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-all text-sm">
            My Orders
          </button>
          <button onClick={() => onNavigate('home')}
            className="bg-primary text-white py-3 rounded-xl font-bold shadow-button active:shadow-none active:translate-y-1 transition-all text-sm">
            Order More
          </button>
        </div>
      </div>
    </div>
  )
}