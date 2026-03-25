/**
 * CheckoutPage.js — Updated with Paytm Payment Gateway
 * ──────────────────────────────────────────────────────
 * Supports TWO payment modes:
 *   1. Paytm Gateway  — primary, recommended (test mode enabled)
 *   2. Direct UPI     — fallback (original flow, unchanged)
 *
 * Order creation always happens first via createOrderAndPay().
 * Paytm flow calls paytm-initiate Edge Function → loads SDK → opens checkout.
 * PaymentPendingPage + existing polling/realtime handles confirmation for both.
 */

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Smartphone, Monitor, CreditCard, Zap } from 'lucide-react'
import { createOrderAndPay }   from '../hooks/useOrderPayment'
import { usePaytmPayment }     from '../hooks/usePaytmPayment'
import { supabase }            from '../lib/supabaseClient'

export default function CheckoutPage({ checkoutData, onNavigate, onClearCart }) {
  const { cart, slot, total } = checkoutData

  // ── Order creation state ──────────────────────────────────────────────────
  const [orderState, setOrderState] = useState('loading')  // loading | ready | error
  const [payData,    setPayData]    = useState(null)
  const [errMsg,     setErrMsg]     = useState('')
  const [userId,     setUserId]     = useState(null)

  // ── Payment method toggle ──────────────────────────────────────────────────
  const [payMethod, setPayMethod] = useState('paytm')   // 'paytm' | 'upi'

  // ── Paytm hook ────────────────────────────────────────────────────────────
  const { paytmState, paytmError, initiatePaytmPayment, isLoading: paytmLoading } = usePaytmPayment()

  // ── Prevent double-invoke in React 18 StrictMode ─────────────────────────
  const initiated = useRef(false)

  // ── Step 1: Create order in Supabase ─────────────────────────────────────
  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    const init = async () => {
      try {
        // Get current user for Paytm initiation later
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id ?? null)

        const data = await createOrderAndPay(cart.items, slot?.label || '12:15 PM', cart.canteen)
        setPayData(data)
        setOrderState('ready')
        if (onClearCart) onClearCart()
      } catch (err) {
        console.error('[CheckoutPage] Order creation failed:', err)
        setErrMsg(err.message || 'Unknown error')
        setOrderState('error')
      }
    }
    init()
  }, [])


  // ... inside CheckoutPage.js
const handlePaytm = async () => {
  if (!payData?.order || !userId || paytmLoading) return;
  console.log(`[CheckoutPage] Initiating payment for ${checkoutData.cart.canteen.name}`);

  await initiatePaytmPayment({
      orderId: payData.order.id,
      userId: userId,
      amount: total,
      canteenId: checkoutData.cart.canteen.id,

      onCancel: async () => {
          console.log('[CheckoutPage] Processing cancellation in DB...');

          // ── Step 1: Attempt to set status to CANCELLED 
          const { error } = await supabase
              .from('orders')
              .update({ status: 'CANCELLED' })
              .eq('id', payData.order.id)
              .eq('status', 'PENDING') // ── Guard: Only cancel if not already confirmed 
              .select();
          // ── Step 2: Handle the result
          if (error) {
              // If update fails, it might be because the order is already CONFIRMED
              const { data: check } = await supabase
                  .from('orders')
                  .select('status')
                  .eq('id', payData.order.id)
                  .single();

              if (check?.status === 'CONFIRMED') {
                  onNavigate('payment-pending', { order: payData.order, total });
              }
          } else {
              // Successfully cancelled
              sessionStorage.removeItem('pending_order_id'); // 
              console.log('[CheckoutPage] Order marked as CANCELLED');
          }
      },
  });
};


  // ── Handle direct UPI pay ─────────────────────────────────────────────────
  const handleDirectUPI = () => {
    onNavigate('payment-pending', { order: payData.order, total })
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = payData.upiLink
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Loading screen
  // ──────────────────────────────────────────────────────────────────────────
  if (orderState === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Creating your order…</p>
    </div>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // Error screen
  // ──────────────────────────────────────────────────────────────────────────
  if (orderState === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-5xl">⚠️</div>
      <h2 className="font-heading text-xl font-bold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500 text-center text-sm">{errMsg || 'Could not create your order.'}</p>
      <button onClick={() => onNavigate('cart')}
        className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button">
        Back to Cart
      </button>
    </div>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // Paytm processing overlay
  // ──────────────────────────────────────────────────────────────────────────
  if (paytmLoading || paytmState === 'open') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="font-heading text-xl font-bold text-gray-800">
        {paytmState === 'initiating'   ? 'Connecting to Paytm…'    : ''}
        {paytmState === 'sdk_loading'  ? 'Loading payment window…'  : ''}
        {paytmState === 'open'         ? 'Paytm payment is open'    : ''}
      </p>
      <p className="text-gray-400 text-sm">Do not close this page</p>
    </div>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // Main checkout UI
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="gradient-hero text-white p-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('cart')} className="bg-white/20 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Choose Payment</h1>
            <p className="text-orange-100 text-sm">{cart.canteen?.name} · Zero fees</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">

        {/* Amount card */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 text-center">
          <p className="text-gray-500 text-sm mb-1">Amount to Pay</p>
          <p className="font-heading text-5xl font-bold text-primary">₹{total}</p>
          <p className="text-gray-500 text-sm mt-1">Pickup: {slot?.label}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700
                          text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
            ₹0 platform fee
          </div>
        </div>

        {/* Payment method selector */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100">
          <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Payment Method
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Paytm option */}
            <button
              onClick={() => setPayMethod('paytm')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                payMethod === 'paytm'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className={`w-5 h-5 ${payMethod === 'paytm' ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${payMethod === 'paytm' ? 'text-primary' : 'text-gray-600'}`}>
                  Paytm
                </span>
                {process.env.REACT_APP_PAYTM_ENV !== 'PRODUCTION' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">
                    TEST
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">Cards, UPI, Wallets</p>
            </button>

            {/* Direct UPI option */}
            <button
              onClick={() => setPayMethod('upi')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                payMethod === 'upi'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className={`w-5 h-5 ${payMethod === 'upi' ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${payMethod === 'upi' ? 'text-primary' : 'text-gray-600'}`}>
                  Direct UPI
                </span>
              </div>
              <p className="text-xs text-gray-400">GPay, PhonePe, BHIM</p>
            </button>
          </div>
        </div>

        {/* ── Paytm payment section ─────────────────────────────────────────── */}
        {payMethod === 'paytm' && (
          <div className="bg-white rounded-2xl p-5 border border-orange-100 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <p className="font-semibold text-gray-700">Pay via Paytm</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-blue-800 text-xs font-semibold mb-1">✅ What you can use:</p>
              <p className="text-blue-700 text-xs">
                All UPI apps (GPay, PhonePe, BHIM) · Credit/Debit cards · Net banking · Paytm wallet
              </p>
            </div>

            {paytmError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm font-semibold">Payment error</p>
                <p className="text-red-600 text-xs mt-1">{paytmError}</p>
              </div>
            )}

            <button
              onClick={handlePaytm}
              disabled={paytmLoading || paytmState === 'open'}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold
                         shadow-button active:shadow-none active:translate-y-1 transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 text-lg"
            >
              <CreditCard className="w-5 h-5" />
              Pay ₹{total} with Paytm
            </button>

            <p className="text-center text-xs text-gray-400">
              Secure payment powered by Paytm
              {process.env.REACT_APP_PAYTM_ENV !== 'PRODUCTION' ? ' (Test Mode)' : ''}
            </p>
          </div>
        )}

        {/* ── Direct UPI section ─────────────────────────────────────────────── */}
        {payMethod === 'upi' && (
          <div className="space-y-4">
            {/* QR code */}
            <div className="bg-white rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-5 h-5 text-gray-500" />
                <p className="font-semibold text-gray-700">Scan QR Code</p>
                <span className="text-xs text-gray-400 ml-auto">Desktop / iOS</span>
              </div>
              <div className="flex justify-center">
                {payData.qrDataUrl
                  ? <img src={payData.qrDataUrl} alt="UPI QR" className="w-52 h-52 rounded-xl border-4 border-gray-100" />
                  : <div className="w-52 h-52 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">QR Loading…</div>
                }
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">
                Open GPay / PhonePe / BHIM → Scan QR
              </p>
              <p className="text-center text-xs text-gray-500 mt-1 font-mono">
                {cart.canteen?.upiVpa}
              </p>
            </div>

            {/* Deep-link button */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <p className="font-semibold text-gray-700">Tap to open UPI app</p>
                <span className="text-xs text-gray-400 ml-auto">Android</span>
              </div>
              <button
                onClick={handleDirectUPI}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold
                           shadow-button active:shadow-none active:translate-y-1 transition-all
                           flex items-center justify-center gap-2"
              >
                <span className="text-xl">₹</span>
                Pay ₹{total} — Open UPI App
              </button>
              <div className="flex justify-center gap-6 mt-3">
                {['GPay', 'PhonePe', 'BHIM', 'Paytm'].map(app => (
                  <span key={app} className="text-xs text-gray-400">{app}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Order reference */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-800 text-xs font-semibold mb-1">ORDER REFERENCE</p>
          <p className="text-amber-900 font-mono text-sm break-all">{payData.order.id}</p>
          <p className="text-amber-700 text-xs mt-1">Keep this for tracking</p>
        </div>

        {/* Already paid fallback */}
        <button
          onClick={() => onNavigate('payment-pending', { order: payData.order, total })}
          className="w-full border-2 border-primary text-primary py-3 rounded-xl
                     font-bold hover:bg-primary/5 transition-all"
        >
          I've completed payment →
        </button>
      </div>
    </div>
  )
}
