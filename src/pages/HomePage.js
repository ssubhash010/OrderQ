import { useState } from 'react'
import { ShoppingCart, UtensilsCrossed, Coffee, Cookie, Plus, Search } from 'lucide-react'
import { menuItems, categories } from '../lib/menuData'

const categoryIcons = { UtensilsCrossed, Coffee, Cookie }

export default function HomePage({ cart, onAddToCart, onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const filtered = menuItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="gradient-hero text-white p-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">CampusEats</h1>
              <p className="text-orange-100 text-sm">Zero Platform Fee • Direct UPI</p>
            </div>
            <button
              onClick={() => onNavigate('cart')}
              className="relative bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for food..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="max-w-6xl mx-auto px-4 -mt-4">
        <div className="flex gap-3 overflow-x-auto pb-4">
          {categories.map(cat => {
            const Icon = cat.icon ? categoryIcons[cat.icon] : null
            const active = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
                  active
                    ? 'bg-primary text-white shadow-button'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-6xl mx-auto px-4 mt-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <MenuItemCard key={item.id} item={item} onAdd={() => onAddToCart(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItemCard({ item, onAdd }) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 800)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-orange-100 card-hover shadow-sm">
      <div className="relative h-48 overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow">
          <span className="font-bold text-primary">₹{item.price}</span>
        </div>
        <div className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
          ⏱ {item.prepTime}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
        <button
          onClick={handleAdd}
          className={`w-full rounded-full px-6 py-2.5 font-bold transition-all ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-primary text-white shadow-button active:shadow-none active:translate-y-1 hover:bg-primary/90'
          }`}
        >
          <Plus className="w-5 h-5 inline mr-1" />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}