// ─────────────────────────────────────────────────────────────────────────────
// supabaseClient.js  —  MOCK MODE (no real Supabase needed for testing)
//
// TO GO LIVE, replace the mock export with:
//   import { createClient } from '@supabase/supabase-js'
//   export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
//
// and fill in your .env:
//   REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
//   REACT_APP_SUPABASE_ANON_KEY=eyJ...
//   REACT_APP_MERCHANT_UPI=canteen@kotak
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// src/lib/supabaseClient.js  —  REAL CLIENT (replaces mock)
//
// Copy .env.example → .env  and fill in your Supabase project credentials.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY
console.log(process.env.REACT_APP_SUPABASE_URL);
console.log(process.env.REACT_APP_SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[CampusEats] Missing env vars — copy .env.example → .env'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,   // student session survives refresh
    autoRefreshToken:   true,   // JWT-1: auto-refresh before expiry
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})

// ── DEV-ONLY helper ───────────────────────────────────────────────────────────
// Simulates bank webhook by directly updating the order in DB after 4 s.
// In production, the upi-webhook Edge Function does this via HMAC + confirm_order()
export async function simulatePayment(orderId) {
  if (process.env.REACT_APP_DEV_MODE !== 'true') return
  console.log('[DEV] Simulating payment confirmation in 4 s for:', orderId)
  setTimeout(async () => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'CONFIRMED' })
      .eq('id', orderId)
      .eq('status', 'PENDING')
    if (error) console.warn('[DEV] simulatePayment error:', error.message)
    else       console.log('[DEV] Order confirmed ✅', orderId)
  }, 4000)
}
