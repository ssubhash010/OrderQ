import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PaymentPendingPage({ pendingData, onNavigate }) {
  const { order, total } = pendingData
  const [status, setStatus]     = useState('waiting') // waiting | confirmed | failed
  const [timeLeft, setTimeLeft] = useState(600)        // 10 minutes

  // FIX: useRef to avoid stale closure in the navigate effect
  const navigateRef = useRef(onNavigate)
  useEffect(() => { navigateRef.current = onNavigate }, [onNavigate])

  // Realtime subscription + polling fallback
  useEffect(() => {
    const channel = supabase
      .channel(`order-${order.id}`)
      .on('postgres_changes', { filter: `id=eq.${order.id}` }, ({ new: updated }) => {
        if (updated.status === 'CONFIRMED') setStatus('confirmed')
        if (updated.status === 'FAILED')    setStatus('failed')
      })
      .subscribe()

    // FIX: polling fallback — check every 3s instead of 5s for snappier UX
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('orders')
        .select('status')
        .eq('id', order.id)
        .single()
      if (data?.status === 'CONFIRMED') { setStatus('confirmed'); clearInterval(poll) }
      if (data?.status === 'FAILED')    { setStatus('failed');    clearInterval(poll) }
    }, 3000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [order.id])

  // Countdown timer
  useEffect(() => {
    if (status !== 'waiting') return
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { clearInterval(t); setStatus('failed'); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status])

  // Navigate to success once confirmed
  // FIX: use navigateRef to avoid stale closure warning
  useEffect(() => {
    if (status === 'confirmed') {
      const timer = setTimeout(() => navigateRef.current('order-success', { order }), 800)
      return () => clearTimeout(timer)
    }
  }, [status, order])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const pct  = ((600 - timeLeft) / 600) * 100

  if (status === 'confirmed') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-green-50 p-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl animate-bounce">✅</div>
      <h2 className="font-heading text-2xl font-bold text-green-800">Payment Confirmed!</h2>
      <p className="text-green-600">Redirecting to your order...</p>
    </div>
  )

  if (status === 'failed') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-5xl">⏰</div>
      <h2 className="font-heading text-2xl font-bold text-gray-800">Payment Timed Out</h2>
      <p className="text-gray-500 text-center">Your order was not confirmed. No money was deducted.</p>
      <button onClick={() => onNavigate('cart')} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button">
        Try Again
      </button>
      <button onClick={() => onNavigate('home')} className="text-gray-500 underline text-sm mt-2">
        Back to Menu
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">

        {/* Progress ring */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#fee2e2" strokeWidth="8" />
              <circle
                cx="48" cy="48" r="40"
                fill="none" stroke="#ff5f1f" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl">⏳</div>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl font-bold text-gray-800">Waiting for Payment</p>
            <p className="text-gray-500 text-sm mt-1">Complete UPI payment to confirm order</p>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 text-center">
          <p className="text-gray-500 text-sm">Amount</p>
          <p className="font-heading text-4xl font-bold text-primary">₹{total}</p>
          <p className="text-gray-400 text-xs mt-1 font-mono break-all">{order.id}</p>
        </div>

        {/* Countdown */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Order expires in</p>
            <p className={`font-heading text-3xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-800'}`}>
              {mins}:{secs}
            </p>
          </div>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100 space-y-3">
          <p className="font-semibold text-gray-700 text-sm">What's happening?</p>
          {[
            { icon: '✅', text: 'Order created successfully',   done: true  },
            { icon: '⏳', text: 'Waiting for UPI payment',      done: false },
            { icon: '🔔', text: "You'll get notified instantly", done: false },
            { icon: '🍱', text: 'Canteen starts preparing',      done: false },
          ].map((step, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm ${step.done ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
              <span>{step.icon}</span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="w-full text-gray-400 text-sm underline text-center"
        >
          Cancel and go back
        </button>
      </div>
    </div>
  )
}
