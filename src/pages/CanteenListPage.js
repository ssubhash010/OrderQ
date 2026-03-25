// src/pages/CanteenListPage.js
import { ShoppingCart } from 'lucide-react'
import { canteens }     from '../lib/menuData'

export default function CanteenListPage({ cart, onNavigate }) {
  const cartCount   = cart.items.reduce((s, i) => s + i.quantity, 0)
  const cartCanteen = cart.canteen

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-hero text-white p-6 pb-10">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="font-heading text-3xl font-bold">CampusEats 🍱</h1>
              <p className="text-orange-100 text-sm mt-1">Zero Platform Fee · Direct UPI</p>
            </div>
            {/* Cart button — only visible when cart has items */}
            {cartCount > 0 && (
              <button
                onClick={() => onNavigate('cart')}
                className="relative bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            )}
          </div>
          <p className="text-orange-100/80 text-sm">Choose a canteen to order from</p>
        </div>
      </div>

      {/* Active cart banner */}
      {cartCanteen && cartCount > 0 && (
        <div
          className="mx-4 -mt-5 mb-2 bg-white border-2 border-primary rounded-2xl p-3 flex items-center justify-between cursor-pointer shadow-md"
          onClick={() => onNavigate('cart')}
        >
          <div>
            <p className="text-xs text-gray-500 font-medium">Cart · {cartCanteen.shortName}</p>
            <p className="font-bold text-gray-900">
              {cartCount} item{cartCount > 1 ? 's' : ''} in cart
            </p>
          </div>
          <span className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full">
            View →
          </span>
        </div>
      )}

      {/* Canteen cards */}
      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {canteens.map(canteen => {
          const isCartCanteen = cartCanteen?.id === canteen.id
          return (
            <button
              key={canteen.id}
              onClick={() => onNavigate('canteen-menu', { canteen })}
              className="w-full bg-white rounded-2xl overflow-hidden border-2 border-orange-100 text-left card-hover shadow-sm active:scale-[0.98] transition-all"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={canteen.image}
                  alt={canteen.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="font-heading text-xl font-bold">{canteen.name}</p>
                  <p className="text-white/80 text-sm">{canteen.description}</p>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 text-2xl w-10 h-10 rounded-full flex items-center justify-center shadow">
                  {canteen.badge}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {canteen.categories.map(cat => (
                    <span key={cat} className="text-xs bg-orange-50 text-orange-700 font-semibold px-2.5 py-1 rounded-full border border-orange-200">
                      {cat}
                    </span>
                  ))}
                </div>
                {isCartCanteen && cartCount > 0 ? (
                  <span className="text-xs bg-primary text-white font-bold px-3 py-1.5 rounded-full">
                    {cartCount} in cart
                  </span>
                ) : (
                  <span className="text-sm font-bold text-primary">Order →</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Zero-fee badge */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-2xl">💸</span>
          <div>
            <p className="font-semibold text-green-800 text-sm">₹0 Platform Fee — Always</p>
            <p className="text-green-600 text-xs">Your money goes directly to the canteen via UPI</p>
          </div>
        </div>
      </div>
    </div>
  )
}

