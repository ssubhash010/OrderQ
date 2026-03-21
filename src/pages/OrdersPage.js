import { useEffect, useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const STATUS_LABELS = {
  PENDING:   { label: 'Pending Payment', color: 'text-yellow-700',  bg: 'bg-yellow-100' },
  CONFIRMED: { label: 'Confirmed',       color: 'text-blue-700',    bg: 'bg-blue-100' },
  PREPARING: { label: 'Preparing',       color: 'text-amber-700',   bg: 'bg-amber-100' },
  READY:     { label: '🍱 Ready!',       color: 'text-green-700',   bg: 'bg-green-100' },
  PICKED_UP: { label: 'Completed',       color: 'text-gray-600',    bg: 'bg-gray-100' },
  FAILED:    { label: 'Failed',          color: 'text-red-700',     bg: 'bg-red-100' },
}

export default function OrdersPage({ onNavigate }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    setLoading(true)
    // Use the mock store directly — sorted newest first
    const all = [...(supabase._orders || [])]
    const mine = all
      .filter(o => o.user_id === 'mock-user-123')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setOrders(mine)
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="gradient-hero text-white p-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className="bg-white/20 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-heading text-2xl font-bold flex-1">My Orders</h1>
          <button onClick={loadOrders} className="bg-white/20 p-2 rounded-full">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="font-heading text-xl font-bold text-gray-700">No orders yet</h2>
            <p className="text-gray-400 mt-2">Your order history will appear here</p>
            <button onClick={() => onNavigate('home')}
              className="mt-6 bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button">
              Order Now
            </button>
          </div>
        ) : (
          orders.map(order => {
            const st = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING
            return (
              <div key={order.id}
                className="bg-white rounded-2xl p-4 border border-orange-100 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => order.status !== 'PENDING' && onNavigate('order-success', { order })}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">Token #{order.token_number}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(order.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.bg} ${st.color}`}>
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">Pickup: {order.pickup_slot}</p>
                  <p className="font-bold text-primary">₹{order.total_amount}</p>
                </div>
                {order.status === 'READY' && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-2 text-center">
                    <p className="text-green-700 font-bold text-sm">🍱 Your order is ready! Please collect.</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}



