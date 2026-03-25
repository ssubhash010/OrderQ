// src/pages/PaymentPendingPage.js
// ─────────────────────────────────────────────────────────────────────────────
// Listens for the order status to change from PENDING → CONFIRMED (or FAILED).
// Uses Supabase postgres_changes filtered by order id.
// Polling every 3 s as a fallback in case Realtime drops.
// sessionStorage keeps order data alive across page refreshes.
// ─────────────────────────────────────────────────────────────────────────────
// src/pages/PaymentPendingPage.js
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const DEV_MODE    = false
const STORAGE_KEY = 'campuseats_pending_order'
console.log(DEV_MODE)

export default function PaymentPendingPage({ pendingData, onNavigate }) {
  const { order, total } = pendingData

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ order, total })) } catch {}
  }, [order, total])

  const [status,   setStatus]   = useState('waiting')
  const [timeLeft, setTimeLeft] = useState(600)
  const navigateRef = useRef(onNavigate)
  useEffect(() => { navigateRef.current = onNavigate }, [onNavigate])

  // ── Realtime + polling — both watch the REAL database ────────────────────
  // In dev mode: simulate_payment() RPC updates the DB after 4 s.
  // Polling detects it within 3 s → sets status → navigates to success.
  // This is the same code path production uses — no special dev branching.
  useEffect(() => {
    let cleared = false

    // 1. Realtime (instant when Supabase broadcasts the row update)
    const channel = supabase
      .channel(`order-confirm-${order.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `id=eq.${order.id}`,
      }, ({ new: row }) => {
        if (cleared) return
        if (row.status === 'CONFIRMED') setStatus('confirmed')
        if (row.status === 'FAILED')    setStatus('failed')
      })
      .subscribe()

    // 2. Polling fallback (catches Realtime gaps, fires every 3 s)
    const poll = setInterval(async () => {
      if (cleared) return
      const { data } = await supabase
        .from('orders').select('status').eq('id', order.id).single()
      if (data?.status === 'CONFIRMED') { setStatus('confirmed'); clearInterval(poll) }
      if (data?.status === 'FAILED')    { setStatus('failed');    clearInterval(poll) }
    }, 3000)

    return () => {
      cleared = true
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [order.id])

  // ── Countdown ─────────────────────────────────────────────────────────────
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

  // ── Navigate to success ───────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'confirmed') return
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    const t = setTimeout(() =>
      navigateRef.current('order-success', { order: { ...order, status: 'CONFIRMED' } })
    , 800)
    return () => clearTimeout(t)
  }, [status, order])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const pct  = ((600 - timeLeft) / 600) * 100

  // ── Confirmed ─────────────────────────────────────────────────────────────
  if (status === 'confirmed') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-green-50 p-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl animate-bounce">✅</div>
      <h2 className="font-heading text-2xl font-bold text-green-800">Payment Confirmed!</h2>
      <p className="text-green-600 text-sm">Redirecting to your order…</p>
    </div>
  )

  // ── Failed / timed out ────────────────────────────────────────────────────
  if (status === 'failed') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-5xl">⏰</div>
      <h2 className="font-heading text-2xl font-bold text-gray-800">Payment Timed Out</h2>
      <p className="text-gray-500 text-center text-sm">No money was deducted.</p>
      <button onClick={() => onNavigate('cart')}
        className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button mt-2">
        Try Again
      </button>
    </div>
  )

  // ── Waiting ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-5">

        {/* Spinner ring */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#fee2e2" strokeWidth="8" />
              <circle cx="48" cy="48" r="40" fill="none" stroke="#ff5f1f" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">⏳</div>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl font-bold text-gray-800">Waiting for Payment</p>
            <p className="text-gray-500 text-sm mt-1">
              {DEV_MODE
                ? '🔧 Dev mode — DB will auto-confirm in ~4 s'
                : 'Complete UPI payment to confirm your order'}
            </p>
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
            <p className="text-gray-500 text-sm">Expires in</p>
            <p className={`font-heading text-3xl font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-800'}`}>
              {mins}:{secs}
            </p>
          </div>
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

        {/* Status steps */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100 space-y-2.5 text-sm">
          {[
            { icon: '✅', text: 'Order created in database',              done: true  },
            { icon: DEV_MODE ? '🔧' : '⏳',
              text: DEV_MODE ? 'simulate_payment RPC fires after 4 s' : 'Waiting for UPI confirmation',
              done: false },
            { icon: '🔄', text: 'Polling DB every 3 s for status change', done: false },
            { icon: '🍱', text: 'Canteen notified → starts preparing',    done: false },
          ].map((s, i) => (
            <div key={i} className={`flex items-center gap-3 ${s.done ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
              <span>{s.icon}</span><span>{s.text}</span>
            </div>
          ))}
        </div>

        <button onClick={() => onNavigate('canteen-list')}
          className="w-full text-gray-400 text-sm underline text-center pt-2">
          Cancel and go back
        </button>
      </div>
    </div>
  )
}
