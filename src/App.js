import './App.css'
import { useState } from 'react'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPendingPage from './pages/PaymentPendingPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrdersPage from './pages/OrdersPage'
import CanteenDashboard from './pages/CanteenDashboard'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'

// Pages that show bottom nav
const SHOW_NAV = ['home', 'orders', 'profile']
// Pages that don't need any extra data
const SIMPLE_PAGES = ['home', 'cart', 'orders', 'profile', 'canteen']

export default function App() {
  const [page, setPage] = useState('home')
  const [pageData, setPageData] = useState({})
  const [cart, setCart] = useState([])

  const navigate = (target, data = {}) => {
    setPage(target)
    setPageData(data)
    window.scrollTo(0, 0)
  }

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage cart={cart} onAddToCart={addToCart} onNavigate={navigate} />
      case 'cart':
        return <CartPage cart={cart} onUpdateCart={setCart} onNavigate={navigate} />
      case 'checkout':
        return <CheckoutPage checkoutData={pageData} onNavigate={navigate} />
      case 'payment-pending':
        return <PaymentPendingPage pendingData={pageData} onNavigate={navigate} />
      case 'order-success':
        return <OrderSuccessPage successData={pageData} onNavigate={navigate} />
      case 'orders':
        return <OrdersPage onNavigate={navigate} />
      case 'canteen':
        return <CanteenDashboard onNavigate={navigate} />
      case 'profile':
        return <ProfilePage onNavigate={navigate} />
      default:
        return <HomePage cart={cart} onAddToCart={addToCart} onNavigate={navigate} />
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