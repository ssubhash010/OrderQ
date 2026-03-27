import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function PaymentVerifying({ orderId, onNavigate }) {
  // States: 'verifying' | 'confirmed' | 'failed'
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    if (!orderId) return;

    // 1. Setup Realtime Subscription
    const channel = supabase
      .channel(`v-order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          handleStatusChange(payload.new.status, payload.new);
        }
      )
      .subscribe();

    // 2. Initial Manual Check (handles the "Race Condition")
    const checkStatus = async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (data) handleStatusChange(data.status, data);
    };
    checkStatus();

    return () => supabase.removeChannel(channel);
  }, [orderId]);

  // Central logic to handle transitions
  const handleStatusChange = (newStatus, orderData) => {
    if (newStatus === 'CONFIRMED') {
      setStatus('confirmed');
      // Buffer: Let them feel the success for 2s before moving to receipt
      setTimeout(() => onNavigate('order-success', { order: orderData }), 2000);
    } 
    else if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xs w-full">
        
        {/* --- STATE: VERIFYING --- */}
        {status === 'verifying' && (
          <div className="animate-in fade-in duration-500">
            <div className="relative flex justify-center mb-6">
               <Loader2 className="w-16 h-16 text-primary animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
               </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We're waiting for the bank's confirmation. <br/>
              <strong>Please do not close or refresh.</strong>
            </p>
          </div>
        )}

        {/* --- STATE: CONFIRMED --- */}
        {status === 'confirmed' && (
          <div className="animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 text-sm">Transferring you to your receipt...</p>
          </div>
        )}

        {/* --- STATE: FAILED --- */}
        {status === 'failed' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-8">
              The transaction was not successful or was timed out by the bank.
            </p>
            <button 
              onClick={() => onNavigate('cart')}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-button active:translate-y-1 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Cart
            </button>
          </div>
        )}

      </div>
    </div>
  );
}