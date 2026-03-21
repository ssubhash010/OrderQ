import { useEffect, useState } from 'react'
import { ArrowLeft, RefreshCw, ChefHat, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const NEXT_STATUS = { CONFIRMED: 'PREPARING', PREPARING: 'READY', READY: 'PICKED_UP' }
const ACTION_LABEL = { CONFIRMED: '👨‍🍳 Start Preparing', PREPARING: '🍱 Mark Ready', READY: '✅ Mark Picked Up' }
const STATUS_COLOR = {
  CONFIRMED: 'border-blue-300 bg-blue-50',
  PREPARING: 'border-amber-300 bg-amber-50',
  READY:     'border-green-300 bg-green-100',
  PICKED_UP: 'border-gray-200 bg-gray-50 opacity-60',
}

export default function CanteenDashboard({ onNavigate }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    const allOrders = [...(supabase._orders || [])]
    setOrders(
      allOrders
        .filter(o => ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'].includes(o.status))
        .sort((a, b) => a.token_number - b.token_number)
    )
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
    // Realtime: re-fetch on any order change
    const interval = setInterval(loadOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setUpdating(order.id)
    await supabase.from('orders').update({ status: next }).eq('id', order.id)
    await loadOrders()
    setUpdating(null)
  }

  const active = orders.filter(o => o.status !== 'PICKED_UP')
  const done   = orders.filter(o => o.status === 'PICKED_UP')

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <div className="bg-gray-900 text-white p-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className="bg-white/10 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-orange-400" />
              <h1 className="font-heading text-xl font-bold">Canteen Dashboard</h1>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              {active.length} active order{active.length !== 1 ? 's' : ''} •
              Updates every 3s
            </p>
          </div>
          <button onClick={loadOrders} className="bg-white/10 p-2 rounded-full">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-2xl mx-auto px-5 py-3 flex gap-6">
          {[
            { label: 'Confirmed', count: orders.filter(o => o.status === 'CONFIRMED').length, color: 'text-blue-400' },
            { label: 'Preparing', count: orders.filter(o => o.status === 'PREPARING').length, color: 'text-amber-400' },
            { label: 'Ready',     count: orders.filter(o => o.status === 'READY').length,     color: 'text-green-400' },
          ].map(s => (
            <div key={s.label}>
              <p className={`font-heading text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : active.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-3" />
            <h2 className="font-heading text-xl font-bold text-gray-700">All caught up!</h2>
            <p className="text-gray-400">No pending orders right now</p>
          </div>
        ) : (
          active.map(order => (
            <div key={order.id} className={`rounded-2xl border-2 p-4 transition-all ${STATUS_COLOR[order.status]}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-heading text-2xl font-bold ${
                    order.status === 'READY' ? 'bg-green-500 text-white' :
                    order.status === 'PREPARING' ? 'bg-amber-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    #{order.token_number}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{order.status}</p>
                    <p className="text-gray-500 text-sm">Pickup: {order.pickup_slot}</p>
                    <p className="text-gray-400 text-xs">₹{order.total_amount}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  order.status === 'READY' ? 'bg-green-200 text-green-800' :
                  order.status === 'PREPARING' ? 'bg-amber-200 text-amber-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </div>
              {order.status !== 'PICKED_UP' && (
                <button
                  onClick={() => updateStatus(order)}
                  disabled={updating === order.id}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                    order.status === 'READY' ? 'bg-green-500 hover:bg-green-600' :
                    order.status === 'PREPARING' ? 'bg-amber-500 hover:bg-amber-600' :
                    'bg-blue-500 hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {updating === order.id ? '...' : ACTION_LABEL[order.status]}
                </button>
              )}
            </div>
          ))
        )}

        {/* Completed today */}
        {done.length > 0 && (
          <div className="mt-6">
            <p className="text-gray-500 text-sm font-semibold mb-2 px-1">Completed Today ({done.length})</p>
            {done.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-3 border border-gray-200 opacity-60 flex justify-between items-center mb-2">
                <span className="font-mono text-gray-500 text-sm">Token #{order.token_number}</span>
                <span className="text-green-600 font-bold text-sm">✅ Picked Up</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


