// src/pages/ProfilePage.js
import { ArrowLeft, ChefHat, ShoppingBag, Info } from 'lucide-react'

export default function ProfilePage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="gradient-hero text-white p-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('canteen-list')} className="bg-white/20 p-2 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-heading text-2xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* User card */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">🎓</div>
          <div>
            <p className="font-bold text-gray-900">Campus Student</p>
            <p className="text-gray-500 text-sm">Anonymous session</p>
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
              Signed In
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl overflow-hidden border border-orange-100">
          {[
            {
              icon:   <ShoppingBag className="w-5 h-5 text-primary" />,
              label:  'My Orders',
              sub:    'View your order history',
              action: 'orders',
            },
            {
              icon:   <ChefHat className="w-5 h-5 text-gray-600" />,
              label:  'Canteen Dashboard',
              sub:    'Staff only — manage orders',
              action: 'canteen',
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate(item.action)}
              className={`w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.sub}</p>
              </div>
              <span className="text-gray-300">›</span>
            </button>
          ))}
        </div>

        {/* Zero-fee banner */}
        <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Why zero fees?</p>
              <p className="text-white/80 text-sm leading-relaxed">
                CampusEats uses Merchant UPI (P2M). Unlike Swiggy / Zomato charging 15–25%
                commission, your money goes directly to the canteen — ₹0 extra per order.
              </p>
              <p className="text-yellow-200 text-xs mt-2 font-semibold">
                Saves ₹22,500+/day at 500 orders vs marketplace model
              </p>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100 text-center">
          <p className="font-heading text-lg font-bold text-primary">CampusEats</p>
          <p className="text-gray-400 text-xs mt-1">v2.0.0 · Multi-Canteen Edition</p>
          <p className="text-gray-400 text-xs">Supabase + Direct UPI · Zero Platform Fee</p>
        </div>
      </div>
    </div>
  )
}
