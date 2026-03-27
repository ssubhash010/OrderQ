// /**
//  * CheckoutPage.js — Updated with Paytm Payment Gateway
//  * ──────────────────────────────────────────────────────
//  * Supports TWO payment modes:
//  *   1. Paytm Gateway  — primary, recommended (test mode enabled)
//  *   2. Direct UPI     — fallback (original flow, unchanged)
//  *
//  * Order creation always happens first via createOrderAndPay().
//  * Paytm flow calls paytm-initiate Edge Function → loads SDK → opens checkout.
//  * PaymentPendingPage + existing polling/realtime handles confirmation for both.
//  */

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Smartphone, Monitor, CreditCard, Zap, AlertCircle } from 'lucide-react'
import { createOrderAndPay }   from '../hooks/useOrderPayment'
import { usePaytmPayment }     from '../hooks/usePaytmPayment'
import { supabase }            from '../lib/supabaseClient'

export default function CheckoutPage({ checkoutData, onNavigate, onClearCart }) {
  const { cart, slot, total } = checkoutData

  const [orderState, setOrderState] = useState('loading') 
  const [payData,    setPayData]    = useState(null)
  const [errMsg,     setErrMsg]     = useState('')
  const [userId,     setUserId]     = useState(null)
  
  // ── Wait Message State ────────────────────────────────────────────────────
  const [waitMessage, setWaitMessage] = useState(null)

  const [payMethod, setPayMethod] = useState('paytm') 
  const { paytmState, paytmError, initiatePaytmPayment, isLoading: paytmLoading } = usePaytmPayment()
  const initiated = useRef(false)

  // ── Step 1: Order Creation ────────────────────────────────────────────────
  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    const init = async () => {
      try {
        // 1. Get user ID locally (state is too slow for the catch block)
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error("Authentication failed.");
        
        const activeId = user.id; 
        setUserId(activeId);
    
        // 2. Attempt order creation
        const data = await createOrderAndPay(cart.items, slot?.label || '12:15 PM', cart.canteen);
        setPayData(data);
        setOrderState('ready');
        if (onClearCart) onClearCart();
    
      } catch (err) {
        console.error('[CheckoutPage] Init failed:', err);
    
        // ── THE FIX: Robust Duplicate Detection ──
        const isDuplicate = err.code === '23505' || 
                            err.message?.includes('idx_single_pending_order_per_user');
    
        if (isDuplicate) {
          // FORCE "ready" state immediately so the error screen doesn't show
          setOrderState('ready'); 
    
          // Re-fetch the user to ensure we have the ID for the query
          const { data: { user } } = await supabase.auth.getUser();
          
          const { data: existing } = await supabase
            .from('orders')
            .select('id, created_at')
            .eq('user_id', user?.id)
            .eq('status', 'PENDING')
            .limit(1)
            .maybeSingle();
    
          if (existing) {
            const createdAt = new Date(existing.created_at);
            const minutesPassed = Math.floor((new Date() - createdAt) / 60000);
            const remaining = 5 - minutesPassed;
    
            if (remaining > 0) {
              setWaitMessage(`You have an active payment attempt. Please wait ${remaining} min or resume your order.`);
              setPayData({ order: existing }); 
            } else {
              // If it's old but the database hasn't cleaned it yet
              setWaitMessage("A previous order attempt is timing out. Please refresh in a moment.");
            }
          } else {
            // Fallback if we know it's a duplicate but can't fetch the record yet
            setWaitMessage("You already have a pending order. Please complete it or wait a few minutes.");
          }
          
          return; // CRITICAL: Stop here so we don't hit setOrderState('error')!
        }
    
        // ── ONLY REACHED IF NOT A DUPLICATE ──
        setErrMsg(err.message || 'Could not create your order.');
        setOrderState('error');
      }
    };
    init()
  }, [userId])


  const handlePaytm = async () => {
    if (!payData?.order || !userId || paytmLoading) return;
    await initiatePaytmPayment({
        orderId: payData.order.id,
        userId: userId,
        amount: total,
        canteenId: checkoutData.cart.canteen.id,
        onCancel: async () => {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'CANCELLED' })
                .eq('id', payData.order.id)
                .eq('status', 'PENDING') 
                .select();

            if (error) {
                const { data: check } = await supabase.from('orders').select('status').eq('id', payData.order.id).single();
                if (check?.status === 'CONFIRMED') onNavigate('payment-pending', { order: payData.order, total });
            } else {
                sessionStorage.removeItem('pending_order_id');
            }
        },
    });
  };

  const handleDirectUPI = () => {
    onNavigate('payment-pending', { order: payData.order, total })
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = payData.upiLink
    }
  }

  // --- UI Renders ---
  if (orderState === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Securing your slot…</p>
    </div>
  )

  if (orderState === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <div className="text-5xl">⚠️</div>
      <h2 className="font-heading text-xl font-bold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500 text-center text-sm">{errMsg}</p>
      <button onClick={() => onNavigate('cart')} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button transition-transform active:scale-95">
        Back to Cart
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="gradient-hero text-white p-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('cart')} className="bg-white/20 p-2 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Checkout</h1>
            <p className="text-orange-100 text-sm">{cart.canteen?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        
        {/* Wait Message Box */}
        {waitMessage && (
          <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex gap-3 animate-in fade-in zoom-in duration-300">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-amber-800 text-xs font-bold leading-relaxed">{waitMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-orange-100 text-center">
          <p className="text-gray-500 text-sm mb-1">Amount to Pay</p>
          <p className="font-heading text-5xl font-bold text-primary">₹{total}</p>
          <p className="text-gray-500 text-sm mt-1">Pickup: {slot?.label}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-orange-100">
          <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPayMethod('paytm')} className={`p-3 rounded-xl border-2 text-left transition-all ${payMethod === 'paytm' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className={`w-5 h-5 ${payMethod === 'paytm' ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${payMethod === 'paytm' ? 'text-primary' : 'text-gray-600'}`}>Paytm</span>
              </div>
            </button>
            <button onClick={() => setPayMethod('upi')} className={`p-3 rounded-xl border-2 text-left transition-all ${payMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className={`w-5 h-5 ${payMethod === 'upi' ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${payMethod === 'upi' ? 'text-primary' : 'text-gray-600'}`}>Direct UPI</span>
              </div>
            </button>
          </div>
        </div>

        {payMethod === 'paytm' && (
          <div className="bg-white rounded-2xl p-5 border border-orange-100 space-y-4">
            <button onClick={handlePaytm} disabled={paytmLoading || !!waitMessage} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-button disabled:opacity-50 transition-all">
              {waitMessage ? 'Payment Locked' : `Pay ₹${total} with Paytm`}
            </button>
          </div>
        )}

        {payMethod === 'upi' && (
           <div className="bg-white rounded-2xl p-5 border border-orange-100 space-y-4 text-center">
             <img src={payData?.qrDataUrl} alt="QR" className="mx-auto w-48 h-48 mb-2 border-2 border-gray-50 p-1 rounded-lg" />
             <button onClick={handleDirectUPI} disabled={!!waitMessage} className="w-full bg-primary text-white py-4 rounded-xl font-bold disabled:opacity-50 transition-all">
               Open UPI App
             </button>
           </div>
        )}

        <button onClick={() => onNavigate('payment-pending', { order: payData.order, total })} className="w-full border-2 border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-all">
          I've already paid →
        </button>
      </div>
    </div>
  )
}