// src/components/BottomNav.js
import { UtensilsCrossed, ClipboardList, User } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'canteen-list', label: 'Canteens', Icon: UtensilsCrossed },
  { id: 'orders',       label: 'Orders',   Icon: ClipboardList },
  { id: 'profile',      label: 'Profile',  Icon: User },
]

export default function BottomNav({ currentPage, onNavigate, cartCount = 0 }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50 max-w-screen-sm mx-auto">
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const active = currentPage === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`relative flex flex-col items-center py-1 px-6 transition-colors ${
              active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {id === 'canteen-list' && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{label}</span>
            {active && (
              <span className="absolute bottom-0 w-1 h-1 bg-primary rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
