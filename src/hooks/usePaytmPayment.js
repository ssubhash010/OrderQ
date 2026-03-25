/**
 * usePaytmPayment.js
 * ──────────────────
 * Callback-based flow (staging):
 *   1. Calls paytm-initiate Edge Function → gets txnToken
 *   2. Dynamically loads Paytm CheckoutJS SDK
 *   3. Opens Paytm with merchant.redirect = true
 *   4. Paytm redirects browser to paytm-callback Edge Function
 *   5. Edge Function verifies + confirms + redirects back to app with ?payment=success|failed|pending
 *   6. App.js reads URL param on load and navigates accordingly
 *
 * MERCHANT_KEY is never in this file — all checksums are server-side only.
 */

import { useState, useCallback } from 'react'
import { supabase }              from '../lib/supabaseClient'

// ── SDK loader ────────────────────────────────────────────────────────────────
// BUG FIX #1: SDK URL now matches the API host (securestage.paytmpayments.com).
// We also remove any stale SDK script so a fresh one is always loaded.
function loadPaytmSDK(mid) {
  return new Promise((resolve, reject) => {
    // Remove any previously injected Paytm script to avoid stale state
    const old = document.querySelector('script[src*="checkoutjs"]')
    if (old) old.remove()
    delete window.Paytm

    const script       = document.createElement('script')
    // ↓ FIXED: same host as the initiation API
    script.src         = `https://securestage.paytmpayments.com/merchantpgpui/checkoutjs/merchants/${mid}.js`
    script.type        = 'application/javascript'
    script.crossOrigin = 'anonymous'

    // BUG FIX #3: register onLoad INSIDE script.onload so it is always called
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Paytm CheckoutJS SDK'))

    document.head.appendChild(script)
  })
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePaytmPayment() {
  const [state,  setState]  = useState('idle')   // idle | initiating | sdk_loading | open | error
  const [errMsg, setErrMsg] = useState('')

  const initiatePaytmPayment = useCallback(async ({
    orderId,  // Supabase order UUID — Edge Function converts it to Paytm-safe format
    userId,
    amount,
    canteenId,
    onCancel,
  }) => {
    setState('initiating')
    setErrMsg('')

    try {
      // ── Step 1: Call Edge Function to get txnToken ──────────────────────────
      // Edge Function now uses the orderId we pass (not its own ORD_${Date.now()})
      const { data, error } = await supabase.functions.invoke('paytm-initiate', {
        body: { orderId, userId, canteenId, amount },
      })

      if (error) throw new Error(`Edge Function error: ${error.message}`)
      if (!data?.body?.txnToken) {
        throw new Error(data?.body?.resultInfo?.resultMsg || 'No txnToken received')
      }

      const txnToken     = data.body.txnToken
      // BUG FIX #4: use the paytmOrderId returned by the Edge Function.
      // This is the UUID with hyphens stripped — exactly what the token was issued for.
      const paytmOrderId = data.orderId
      const mid          = data.mid

      console.log(`[Paytm] Token: ${txnToken.substring(0, 8)}… | Paytm orderId: ${paytmOrderId} | Supabase orderId: ${data.supabaseId}`)

      // ── Step 2: Load SDK (from the SAME host as the API) ───────────────────
      setState('sdk_loading')
      await loadPaytmSDK(mid)

      // ── Step 3: Init + invoke inside onLoad ────────────────────────────────
      // BUG FIX #2 + #3: register onLoad synchronously right after SDK loads,
      // and use .then() so invoke() only runs after init() fully resolves.
      await new Promise((resolve, reject) => {
        window.Paytm.CheckoutJS.onLoad(function execute() {
          const config = {
            root: '',
            flow: 'DEFAULT',
            data: {
              //orderId:   paytmOrderId,   // MUST match what the token was issued for
              //token:     txnToken,
              orderId: data.orderId, // This is now identical to your DB ID
              token: data.body.txnToken,
              tokenType: 'TXN_TOKEN',
              amount:    String(amount),
            },
            merchant: {
              mid,
              name:     'CampusEats',
              redirect: true,            // full-page redirect after payment
            },
            handler: {
              notifyMerchant(eventName, eventData) {
                console.log('[Paytm event]', eventName, eventData)
                if (eventName === 'APP_CLOSED') {
                  setState('idle'); // Remove loading overlays
                  if (onCancel) onCancel();
                  //resolve()
                }

                if (eventName === 'SESSION_EXPIRED') {
                  reject(new Error('Paytm session expired — please try again'))
                }
              },
            },
          }

          // BUG FIX #2: init() returns a Promise — chain invoke() in .then()
          window.Paytm.CheckoutJS.init(config)
            .then(() => {
              setState('open')
              window.Paytm.CheckoutJS.invoke()
              resolve()
            })
            .catch((initErr) => {
              reject(new Error(`CheckoutJS init failed: ${JSON.stringify(initErr)}`))
            })
        })
      })

    } catch (err) {
      console.error('[Paytm] Error:', err.message)
      setErrMsg(err.message)
      setState('error')
    }
  }, [])

  return {
    initiatePaytmPayment,
    paytmState: state,
    paytmError: errMsg,
    isLoading:  state === 'initiating' || state === 'sdk_loading',
  }
}


// ── Utility: read Paytm callback result from URL params after redirect ─────────
// Call this at app startup (App.js). If present, the URL will have:
//   ?payment=success&order=<paytmOrderId>  OR  ?payment=failure&order=<paytmOrderId>
export function getPaytmCallbackResult() {
  const params  = new URLSearchParams(window.location.search)
  const payment = params.get('payment')
  if (payment) {
    window.history.replaceState({}, '', window.location.pathname)
    return { payment, paytmOrderId: params.get('order') }
  }
  return null
}
