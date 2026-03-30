// // /**
// //  * CheckoutPage.js — Updated with Paytm Payment Gateway
// //  * ──────────────────────────────────────────────────────
// //  * Supports TWO payment modes:
// //  *   1. Paytm Gateway  — primary, recommended (test mode enabled)
// //  *   2. Direct UPI     — fallback (original flow, unchanged)
// //  *
// //  * Order creation always happens first via createOrderAndPay().
// //  * Paytm flow calls paytm-initiate Edge Function → loads SDK → opens checkout.
// //  * PaymentPendingPage + existing polling/realtime handles confirmation for both.
// //  */

// import { useEffect, useRef, useState } from 'react'
// import { ArrowLeft, Smartphone, Monitor, CreditCard, Zap, AlertCircle } from 'lucide-react'
// import { createOrderAndPay }   from '../hooks/useOrderPayment'
// import { usePaytmPayment }     from '../hooks/usePaytmPayment'
// import { supabase }            from '../lib/supabaseClient'

// export default function CheckoutPage({ checkoutData, onNavigate, onClearCart }) {
//   const { cart, slot, total } = checkoutData

//   const [orderState, setOrderState] = useState('loading') 
//   const [payData,    setPayData]    = useState(null)
//   const [errMsg,     setErrMsg]     = useState('')
//   const [userId,     setUserId]     = useState(null)
  
//   // ── Wait Message State ────────────────────────────────────────────────────
//   const [waitMessage, setWaitMessage] = useState(null)

//   const [payMethod, setPayMethod] = useState('paytm') 
//   const { paytmState, paytmError, initiatePaytmPayment, isLoading: paytmLoading } = usePaytmPayment()
//   const initiated = useRef(false)

//   // ── Step 1: Order Creation ────────────────────────────────────────────────
//   useEffect(() => {
//     if (initiated.current) return
//     initiated.current = true

//     const init = async () => {
//       try {
//         // 1. Get user ID locally (state is too slow for the catch block)
//         const { data: { user }, error: authErr } = await supabase.auth.getUser();
//         if (authErr || !user) throw new Error("Authentication failed.");
        
//         const activeId = user.id; 
//         setUserId(activeId);
    
//         // 2. Attempt order creation
//         const data = await createOrderAndPay(cart.items, slot?.label || '12:15 PM', cart.canteen);
//         setPayData(data);
//         setOrderState('ready');
//         if (onClearCart) onClearCart();
    
//       } catch (err) {
//         console.error('[CheckoutPage] Init failed:', err);
    
//         // ── THE FIX: Robust Duplicate Detection ──
//         const isDuplicate = err.code === '23505' || 
//                             err.message?.includes('idx_single_pending_order_per_user');
    
//         if (isDuplicate) {
//           // FORCE "ready" state immediately so the error screen doesn't show
//           setOrderState('ready'); 
    
//           // Re-fetch the user to ensure we have the ID for the query
//           const { data: { user } } = await supabase.auth.getUser();
          
//           const { data: existing } = await supabase
//             .from('orders')
//             .select('id, created_at')
//             .eq('user_id', user?.id)
//             .eq('status', 'PENDING')
//             .limit(1)
//             .maybeSingle();
    
//           if (existing) {
//             const createdAt = new Date(existing.created_at);
//             const minutesPassed = Math.floor((new Date() - createdAt) / 60000);
//             const remaining = 5 - minutesPassed;
    
//             if (remaining > 0) {
//               setWaitMessage(`You have an active payment attempt. Please wait ${remaining} min or resume your order.`);
//               setPayData({ order: existing }); 
//             } else {
//               // If it's old but the database hasn't cleaned it yet
//               setWaitMessage("A previous order attempt is timing out. Please refresh in a moment.");
//             }
//           } else {
//             // Fallback if we know it's a duplicate but can't fetch the record yet
//             setWaitMessage("You already have a pending order. Please complete it or wait a few minutes.");
//           }
          
//           return; // CRITICAL: Stop here so we don't hit setOrderState('error')!
//         }
    
//         // ── ONLY REACHED IF NOT A DUPLICATE ──
//         setErrMsg(err.message || 'Could not create your order.');
//         setOrderState('error');
//       }
//     };
//     init()
//   }, [userId])


//   const handlePaytm = async () => {
//     if (!payData?.order || !userId || paytmLoading) return;
//     await initiatePaytmPayment({
//         orderId: payData.order.id,
//         userId: userId,
//         amount: total,
//         canteenId: checkoutData.cart.canteen.id,
//         onCancel: async () => {
//             const { error } = await supabase
//                 .from('orders')
//                 .update({ status: 'CANCELLED' })
//                 .eq('id', payData.order.id)
//                 .eq('status', 'PENDING') 
//                 .select();

//             if (error) {
//                 const { data: check } = await supabase.from('orders').select('status').eq('id', payData.order.id).single();
//                 if (check?.status === 'CONFIRMED') onNavigate('payment-pending', { order: payData.order, total });
//             } else {
//                 sessionStorage.removeItem('pending_order_id');
//             }
//         },
//     });
//   };

//   const handleDirectUPI = () => {
//     onNavigate('payment-pending', { order: payData.order, total })
//     if (/Android|iPhone/i.test(navigator.userAgent)) {
//       window.location.href = payData.upiLink
//     }
//   }

//   // --- UI Renders ---
//   if (orderState === 'loading') return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-4">
//       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
//       <p className="text-gray-600 font-medium">Securing your slot…</p>
//     </div>
//   )

//   if (orderState === 'error') return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
//       <div className="text-5xl">⚠️</div>
//       <h2 className="font-heading text-xl font-bold text-gray-800">Something went wrong</h2>
//       <p className="text-gray-500 text-center text-sm">{errMsg}</p>
//       <button onClick={() => onNavigate('cart')} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-button transition-transform active:scale-95">
//         Back to Cart
//       </button>
//     </div>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50 pb-10">
//       <div className="gradient-hero text-white p-6">
//         <div className="max-w-lg mx-auto flex items-center gap-4">
//           <button onClick={() => onNavigate('cart')} className="bg-white/20 p-2 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
//           <div>
//             <h1 className="font-heading text-2xl font-bold">Checkout</h1>
//             <p className="text-orange-100 text-sm">{cart.canteen?.name}</p>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-lg mx-auto px-4 mt-6 space-y-4">
        
//         {/* Wait Message Box */}
//         {waitMessage && (
//           <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex gap-3 animate-in fade-in zoom-in duration-300">
//             <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
//             <p className="text-amber-800 text-xs font-bold leading-relaxed">{waitMessage}</p>
//           </div>
//         )}

//         <div className="bg-white rounded-2xl p-5 border border-orange-100 text-center">
//           <p className="text-gray-500 text-sm mb-1">Amount to Pay</p>
//           <p className="font-heading text-5xl font-bold text-primary">₹{total}</p>
//           <p className="text-gray-500 text-sm mt-1">Pickup: {slot?.label}</p>
//         </div>

//         <div className="bg-white rounded-2xl p-4 border border-orange-100">
//           <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Payment Method</p>
//           <div className="grid grid-cols-2 gap-3">
//             <button onClick={() => setPayMethod('paytm')} className={`p-3 rounded-xl border-2 text-left transition-all ${payMethod === 'paytm' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
//               <div className="flex items-center gap-2 mb-1">
//                 <CreditCard className={`w-5 h-5 ${payMethod === 'paytm' ? 'text-primary' : 'text-gray-400'}`} />
//                 <span className={`font-bold text-sm ${payMethod === 'paytm' ? 'text-primary' : 'text-gray-600'}`}>Paytm</span>
//               </div>
//             </button>
//           </div>
//         </div>

//         {payMethod === 'paytm' && (
//           <div className="bg-white rounded-2xl p-5 border border-orange-100 space-y-4">
//             <button onClick={handlePaytm} disabled={paytmLoading || !!waitMessage} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-button disabled:opacity-50 transition-all">
//               {waitMessage ? 'Payment Locked' : `Pay ₹${total} with Paytm`}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// src/pages/CheckoutPage.js
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, CreditCard, AlertCircle } from 'lucide-react'
import { createOrderAndPay }   from '../hooks/useOrderPayment'
import { usePaytmPayment }     from '../hooks/usePaytmPayment'
import { supabase }            from '../lib/supabaseClient'
import { motion }              from 'framer-motion'

export default function CheckoutPage({ checkoutData, onNavigate, onClearCart }) {
  const { cart, slot, total } = checkoutData

  const [orderState, setOrderState] = useState('loading') 
  const [payData,    setPayData]    = useState(null)
  const [errMsg,     setErrMsg]     = useState('')
  const [userId,     setUserId]     = useState(null)
  const [waitMessage, setWaitMessage] = useState(null)
  const [payMethod, setPayMethod] = useState('paytm') 
  
  const { paytmState, paytmError, initiatePaytmPayment, isLoading: paytmLoading } = usePaytmPayment()
  const initiated = useRef(false)

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    const init = async () => {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error("Authentication failed.");
        
        const activeId = user.id; 
        setUserId(activeId);
    
        const data = await createOrderAndPay(cart.items, slot?.label || '12:15 PM', cart.canteen);
        setPayData(data);
        setOrderState('ready');
        if (onClearCart) onClearCart();
    
      } catch (err) {
        const isDuplicate = err.code === '23505' || 
                            err.message?.includes('idx_single_pending_order_per_user');
    
        if (isDuplicate) {
          setOrderState('ready'); 
    
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
              setWaitMessage("A previous order attempt is timing out. Please refresh in a moment.");
            }
          } else {
            setWaitMessage("You already have a pending order. Please complete it or wait a few minutes.");
          }
          return; 
        }
        
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

  if (orderState === 'loading') return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-6 font-sans">
      <div className="w-12 h-12 border-4 border-[#1c1c1e] border-t-[#f06e28] rounded-full animate-spin shadow-[0_0_15px_rgba(240,110,40,0.5)]" />
      <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Securing Secure Session...</p>
    </div>
  )

  if (orderState === 'error') return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-5 p-6 font-sans text-center">
      <div className="text-5xl drop-shadow-2xl">⚠️</div>
      <h2 className="font-heading text-2xl font-extrabold tracking-wide text-white">Security Halt</h2>
      <p className="text-red-400 font-medium tracking-wider text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">{errMsg}</p>
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('cart')} 
        className="mt-4 bg-[#1c1c1e] text-white px-8 py-3 rounded-full font-bold tracking-widest uppercase text-sm border border-white/10 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_12px_rgba(0,0,0,0.5)]"
      >
        Return to Cart
      </motion.button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#121212] font-sans pb-10">
      <div className="p-5 pb-6 pt-12">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate('cart')} 
            className="bg-[#1c1c1e] p-3 rounded-full border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]"
          >
            <ArrowLeft className="w-5 h-5 text-gray-200" />
          </motion.button>
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-wide text-white">Checkout</h1>
            <p className="text-gray-400 text-xs font-medium tracking-wider mt-1 uppercase">Distraction-free, secure visual feel.</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-6">
        
        {waitMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#1c1c1e] border border-amber-500/30 p-4 rounded-2xl flex gap-3 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_12px_rgba(0,0,0,0.5)]"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-400 text-xs font-bold tracking-wider leading-relaxed">{waitMessage}</p>
          </motion.div>
        )}

        {/* Amount Card */}
        <div className="bg-[#1c1c1e] rounded-[28px] p-6 text-center border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f06e28] to-transparent opacity-20"></div>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">Order Total</p>
          <p className="font-heading text-5xl font-black text-white drop-shadow-lg">₹{total}</p>
          <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mt-3 bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">
            Pickup: {slot?.label}
          </p>
        </div>

        {/* Payment Methods */}
        <div className="bg-[#1c1c1e] rounded-[28px] p-5 border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <p className="text-sm font-bold tracking-wide text-gray-200">Payment Method</p>
          </div>

          <div className="space-y-3">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setPayMethod('paytm')} 
              className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${
                payMethod === 'paytm' 
                  ? 'border-[#f06e28] bg-[#f06e28]/5 shadow-inner' 
                  : 'border-white/5 bg-[#121212]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${payMethod === 'paytm' ? 'bg-[#f06e28]/20' : 'bg-[#1c1c1e]'}`}>
                  <CreditCard className={`w-5 h-5 ${payMethod === 'paytm' ? 'text-[#f06e28]' : 'text-gray-500'}`} />
                </div>
                <span className={`font-bold tracking-wider text-sm ${payMethod === 'paytm' ? 'text-white' : 'text-gray-400'}`}>Paytm Gateway</span>
              </div>
              {payMethod === 'paytm' && <div className="w-3 h-3 rounded-full bg-[#f06e28] border-2 border-[#121212] outline outline-1 outline-[#f06e28]"></div>}
            </motion.button>
          </div>
        </div>

        {/* Action Area */}
        {payMethod === 'paytm' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="pt-4"
          >
            <motion.button 
              whileTap={{ scale: waitMessage || paytmLoading ? 1 : 0.98 }}
              onClick={handlePaytm} 
              disabled={paytmLoading || !!waitMessage} 
              className={`w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 transition-all ${
                waitMessage 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                  : 'bg-[#f06e28] text-white shadow-[0_8px_20px_-4px_rgba(240,110,40,0.4)]'
              }`}
            >
              {waitMessage ? 'Payment Locked' : `Place Order & Pay ₹${total}`}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}