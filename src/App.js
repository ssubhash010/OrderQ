// src/App.js
import './App.css'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { getPaytmCallbackResult } from './hooks/usePaytmPayment'
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

// cart shape: { items: [], canteen: null | canteenObject }
const EMPTY_CART = { items: [], canteen: null }

export default function App() {
  const [page, setPage] = useState('canteen-list')
  const [pageData, setPageData] = useState({})
  const [cart, setCart] = useState(EMPTY_CART)
  const [userId, setUserId] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  // ── Anonymous auth on first visit ───────────────────────────────────────────
  // Students are signed in anonymously so they get a real user.id for orders.
  // Canteen staff sign in separately with email+password inside CanteenDashboard.
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUserId(session.user.id)
        setAuthReady(true)
        return
      }

      // First visit — sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) {
        console.error('[Auth] Anonymous sign-in failed:', error.message)
        // Allow app to load anyway; order creation will show a friendly error
      } else {
        setUserId(data?.user?.id ?? null)
      }
      setAuthReady(true)
    }

    initAuth()

    // JWT-1: stay in sync with auth state changes (refresh, sign-out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUserId(session?.user?.id ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  // ── Paytm callback handling ────────────────────────────────────────────────
  // useEffect(() => {
  //   const result = getPaytmCallbackResult()
  //   if (!result) return

  //   if (result.payment === 'success' && result.orderId) {
  //     supabase
  //       .from('orders')
  //       .select('*')
  //       .eq('id', result.orderId)
  //       .single()
  //       .then(({ data: order }) => {
  //         if (order) navigate('order-success', { order })
  //         else navigate('orders')
  //       })
  //   } else if (result.payment === 'failed' || result.payment === 'error') {
  //     navigate('cart')
  //   } else if (result.payment === 'pending') {
  //     // stay on current page
  //   }
  // }, [])

  useEffect(() => {
    const result = getPaytmCallbackResult();
    if (!result) return;
  
    if (result.payment === 'success' && result.paytmOrderId) {
      // ── Navigate to a dedicated verifying page instead of immediate fetch
      navigate('payment-verifying', { 
        orderId: result.paytmOrderId 
      });
    } else if (result.payment === 'failure' || result.payment === 'error') {
      // Show a toast/alert then back to cart
      navigate('cart');
    }
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const navigate = (target, data = {}) => {
    setPage(target)
    setPageData(data)
    window.scrollTo(0, 0)
  }

  // ── Cart management ──────────────────────────────────────────────────────────
  // addToCart is called from CanteenMenuPage with the canteen object.
  // clearFirst=true is passed by the conflict modal after user confirms.
  const addToCart = (item, canteen, clearFirst = false) => {
    setCart(prev => {
      const base = clearFirst ? [] : prev.items

      const itemsToUpdate =
        (!prev.canteen || clearFirst || prev.canteen.id === canteen.id)
          ? base
          : prev.items

      if (!clearFirst && prev.canteen && prev.canteen.id !== canteen.id) {
        return prev
      }

      const existing = itemsToUpdate.find(i => i.id === item.id)
      const updatedItems = existing
        ? itemsToUpdate.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...itemsToUpdate, { ...item, quantity: 1 }]

      return { canteen, items: updatedItems }
    })
  }

  const clearCart = () => setCart(EMPTY_CART)

  const cartCount = cart.items.reduce((s, i) => s + i.quantity, 0)

  // ── Loading screen while Supabase auth initialises ───────────────────────────
  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading CampusEats…</p>
      </div>
    )
  }

  // ── Page renderer ─────────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case 'canteen-list':
        return <CanteenListPage cart={cart} onNavigate={navigate} />

      case 'canteen-menu':
        return (
          <CanteenMenuPage
            cart={cart}
            canteen={pageData.canteen}
            onAddToCart={addToCart}
            onNavigate={navigate}
          />
        )


      case 'payment-verifying':
        return (
          <PaymentVerifying 
            orderId={pageData.orderId} 
            onNavigate={navigate} 
          />
        )

      case 'cart':
        return <CartPage cart={cart} onUpdateCart={setCart} onNavigate={navigate} />

      case 'checkout':
        return (
          <CheckoutPage
            checkoutData={pageData}
            onNavigate={navigate}
            onClearCart={clearCart}
          />
        )

      case 'payment-pending':
        return (
          <PaymentPendingPage
            pendingData={pageData}
            onNavigate={navigate}
            userId={userId}
          />
        )

      case 'order-success':
        return (
          <OrderSuccessPage
            successData={pageData}
            onNavigate={navigate}
            userId={userId}
          />
        )

      case 'orders':
        return <OrdersPage onNavigate={navigate} />

      case 'canteen':
        return <CanteenDashboard onNavigate={navigate} />

      case 'profile':
        return <ProfilePage onNavigate={navigate} />

      default:
        return <CanteenListPage cart={cart} onNavigate={navigate} />
    }
  }

  return (
    <div className="App min-h-screen bg-background max-w-screen-sm mx-auto relative">
      {renderPage()}
      {SHOW_NAV.includes(page) && (
        <BottomNav currentPage={page} onNavigate={navigate} cartCount={cartCount} />
      )}
    </div>
  )
}
