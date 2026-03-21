import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Smartphone, Monitor } from 'lucide-react'
import { createOrderAndPay } from '../hooks/useOrderPayment'

// FIX: Accept onClearCart prop so cart empties once order is placed
export default function CheckoutPage({ checkoutData, onNavigate, onClearCart }) {
  const { cart, slot, total } = checkoutData
  const [state, setState]     = useState('loading')
  const [payData, setPayData] = useState(null)

  // FIX: useRef prevents double-invocation in React 18 StrictMode
  const initiated = useRef(false)

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    createOrderAndPay(cart, slot?.label || '12:15 PM')
      .then(data => {
        setPayData(data)
        setState('ready')
        if (onClearCart) onClearCart() // FIX: clear cart after order is committed
      })
      .catch(err => {
        console.error('Order creation failed:', err)
        setState('error')
      })
  }, [])

  const handlePayAndNavigate = () => {
    onNavigate('payment-pending', { order: payData.order, total })
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = payData.upiLink
    }
  }

  if (state === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Preparing your order...</p>
    </div>
  )

  if (state === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-5xl">⚠️</div>
      <h2 className="font-heading text-xl font-bold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500 text-center text-sm">Could not create your order. Please try again.</p>
      <button onClick={() => onNavigate('cart')} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button">
        Go Back to Cart
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="gradient-hero text-white p-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('cart')} className="bg-white/20 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Pay via UPI</h1>
            <p className="text-orange-100 text-sm">Zero fees • Instant confirmation</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-orange-100 text-center">
          <p className="text-gray-500 text-sm mb-1">Amount to Pay</p>
          <p className="font-heading text-5xl font-bold text-primary">₹{total}</p>
          <p className="text-gray-500 text-sm mt-1">Pickup: {slot?.label}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
            ₹0 platform fee
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-gray-500" />
            <p className="font-semibold text-gray-700">Scan QR Code</p>
            <span className="text-xs text-gray-400 ml-auto">Desktop / iOS</span>
          </div>
          <div className="flex justify-center">
            {payData.qrDataUrl ? (
              <img src={payData.qrDataUrl} alt="UPI QR Code" className="w-52 h-52 rounded-xl border-4 border-gray-100" />
            ) : (
              <div className="w-52 h-52 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                QR Loading...
              </div>
            )}
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            Open GPay / PhonePe / BHIM → Scan QR
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <p className="font-semibold text-gray-700">Or tap to open UPI app</p>
            <span className="text-xs text-gray-400 ml-auto">Android</span>
          </div>
          <button
            onClick={handlePayAndNavigate}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-button active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">₹</span>
            Pay ₹{total} — Open UPI App
          </button>
          <div className="flex justify-center gap-6 mt-4">
            {['GPay', 'PhonePe', 'BHIM', 'Paytm'].map(app => (
              <span key={app} className="text-xs text-gray-400">{app}</span>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-800 text-xs font-semibold mb-1">ORDER REFERENCE</p>
          <p className="text-amber-900 font-mono text-sm break-all">{payData.order.id}</p>
          <p className="text-amber-700 text-xs mt-1">Keep this for tracking your order</p>
        </div>

        <button
          onClick={() => onNavigate('payment-pending', { order: payData.order, total })}
          className="w-full border-2 border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-all"
        >
          I've completed payment →
        </button>
      </div>
    </div>
  )
}
