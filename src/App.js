// src/App.js
import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { getPaytmCallbackResult } from './hooks/usePaytmPayment'

import StudentLogin from './pages/StudentLogin'
import CanteenListPage from './pages/CanteenListPage'
import CanteenMenuPage from './pages/CanteenMenuPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPendingPage from './pages/PaymentPendingPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrdersPage from './pages/OrdersPage'
import CanteenDashboard from './pages/CanteenDashboard'
import ProfilePage from './pages/ProfilePage'

import BottomNav from './components/BottomNav'
import PaymentVerifying from './components/PaymentVerifying'

const SHOW_NAV = ['canteen-list', 'orders', 'profile']
const EMPTY_CART = { items: [], canteen: null }

export default function App() {
  const [page, setPage] = useState('canteen-list')
  const [pageData, setPageData] = useState({})
  const [cart, setCart] = useState(EMPTY_CART)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const userId = session?.user?.id ?? null
  const userRole = session?.user?.user_metadata?.role ?? null

  // ── 1. URL Sync & Hash Listener ───────────────────────────────────────────
  // This listens for redirects like /#/order-success?id=... 
  useEffect(() => {
    const handleUrlSync = () => {
      const hash = window.location.hash;
      if (!hash || !hash.includes('#/')) return;

      const [path, query] = hash.replace('#/', '').split('?');
      const params = new URLSearchParams(query);
      const orderId = params.get('id');

      if (path === 'order-success' && orderId) {
        setPage('order-success');
        setPageData({ orderId }); // Pass the ID from the URL into state
      }
    };

    handleUrlSync(); // Run on mount
    window.addEventListener('hashchange', handleUrlSync);
    return () => window.removeEventListener('hashchange', handleUrlSync);
  }, []);

  // ── 2. Auth Initialization ────────────────────────────────────────────────────
  // useEffect(() => {
  //   let mounted = true
  //   const initAuth = async () => {
  //     const { data: { session: currentSession } } = await supabase.auth.getSession()
  //     if (mounted) {
  //       setSession(currentSession)
  //       setLoading(false)
  //     }
  //   }
  //   initAuth()

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
  //     setSession(nextSession)
  //     setLoading(false)
  //   })

  //   return () => {
  //     mounted = false
  //     subscription.unsubscribe()
  //   }
  // }, [])


  // ── 2. Auth Initialization ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (mounted) {
        setSession(currentSession)
        setLoading(false)
      }
    }
    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
      
      // CRITICAL FIX: Force Realtime to reconnect with the new JWT
      if (event === 'TOKEN_REFRESHED') {
        supabase.removeAllChannels()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ── 3. Hardened Role Guard ───────────────────────────────────────────────────
  // Prevents staff from being kicked to the dashboard during the order flow
  useEffect(() => {
    if (!session) return;

    const isOrderFlow = ['order-success', 'payment-verifying', 'payment-pending'].includes(page);
    
    // Only redirect if they are staff AND not in the middle of a transaction result
    if (userRole === 'canteen_staff' && !isOrderFlow) {
      setPage('canteen');
    }
  }, [userRole, page, session]);

  // ── 4. Paytm Callback Handler ───────────────────────────────────────────────
  useEffect(() => {
    const result = getPaytmCallbackResult()
    if (!result) return
    if (result.payment === 'success' && result.paytmOrderId) {
      navigate('payment-verifying', { orderId: result.paytmOrderId })
    } else if (result.payment === 'failure' || result.payment === 'error') {
      navigate('cart')
    }
  }, [])

  const navigate = (target, data = {}) => {
    setPage(target)
    setPageData(data)
    window.scrollTo(0, 0)
  }

  const addToCart = (item, canteen, clearFirst = false) => {
    setCart(prev => {
      const base = clearFirst ? [] : prev.items
      if (!clearFirst && prev.canteen && prev.canteen.id !== canteen.id) return prev
      const existing = base.find(i => i.id === item.id)
      const updatedItems = existing
        ? base.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...base, { ...item, quantity: 1 }]
      return { canteen, items: updatedItems }
    })
  }

  const clearCart = () => setCart(EMPTY_CART)
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading CampusEats…</p>
      </div>
    )
  }

  // Auth Gate: Allow 'canteen' page or 'order-success' to bypass student login
  const bypassLogin = ['canteen', 'order-success'].includes(page);
  if (!session && !bypassLogin) {
    return <StudentLogin onNavigate={navigate} />
  }

  if (session && !session.user.email_confirmed_at && userRole !== 'canteen_staff') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold">Check your email</h2>
          <p className="text-gray-500 mt-2">Verify your account to continue.</p>
          <button onClick={() => supabase.auth.signOut()} className="mt-4 text-primary font-bold">Back to Login</button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (page) {
      case 'canteen-list': return <CanteenListPage cart={cart} onNavigate={navigate} />
      case 'canteen-menu': return <CanteenMenuPage cart={cart} canteen={pageData.canteen} onAddToCart={addToCart} onNavigate={navigate} />
      case 'payment-verifying': return <PaymentVerifying orderId={pageData.orderId} onNavigate={navigate} />
      case 'cart': return <CartPage cart={cart} onUpdateCart={setCart} onNavigate={navigate} />
      case 'checkout': return <CheckoutPage checkoutData={pageData} onNavigate={navigate} onClearCart={clearCart} />
      // case 'payment-pending': return <PaymentPendingPage pendingData={pageData} onNavigate={navigate} userId={userId} />
      case 'payment-pending': return <PaymentPendingPage pendingData={pageData} onNavigate={navigate} userId={userId} sessionToken={session?.access_token} />
      case 'order-success': return <OrderSuccessPage successData={pageData} onNavigate={navigate} userId={userId} />
      case 'orders': return <OrdersPage onNavigate={navigate} />
      case 'canteen': return <CanteenDashboard onNavigate={navigate} />
      case 'profile': return <ProfilePage onNavigate={navigate} />
      default: return <CanteenListPage cart={cart} onNavigate={navigate} />
    }
  }

  return (
    <div className="App min-h-screen bg-background max-w-screen-sm mx-auto relative">
      {renderPage()}
      {SHOW_NAV.includes(page) && userRole !== 'canteen_staff' && (
        <BottomNav currentPage={page} onNavigate={navigate} cartCount={cartCount} />
      )}
    </div>
  )
}
