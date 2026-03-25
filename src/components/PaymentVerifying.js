import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PaymentVerifying({ orderId, onNavigate }) {
  useEffect(() => {
    // 1. Subscribe to Realtime changes for THIS specific order
    const channel = supabase
      .channel(`order-update-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          if (payload.new.status === 'CONFIRMED') {
            onNavigate('order-success', { order: payload.new });
          }
          else if (payload.new.status === 'FAILED' || payload.new.status === 'CANCELLED') {
            // ── ADD THIS: Don't leave them spinning if it fails
            alert("Payment verification failed.");
            onNavigate('cart');
          }
        }
      )
      .subscribe();

    // 2. Manual fallback check (in case they land AFTER the webhook finished)
    const checkInitialStatus = async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (data?.status === 'CONFIRMED') {
        onNavigate('order-success', { order: data });
      }
    };

    checkInitialStatus();
    return () => supabase.removeChannel(channel);
  }, [orderId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <h2 className="mt-4 font-bold text-xl">Verifying Payment...</h2>
      <p className="text-gray-500">Please don't close this page.</p>
    </div>
  );
}