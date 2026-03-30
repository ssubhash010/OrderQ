// src/lib/menuData.js  —  Static multi-canteen menu data
// ─────────────────────────────────────────────────────────────────────────────
// Three canteens: Ball 1, Ball 2, Pencil 1
// upiVpa on each canteen drives the UPI deep-link in useOrderPayment.js
// ─────────────────────────────────────────────────────────────────────────────

export const canteens = [
  {
    id:          'ball_1',
    name:        'Ball 1 Canteen',
    shortName:   'Ball 1',
    description: 'Full meals, beverages & snacks',
    image:       'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&q=80&w=800',
    badge:       '🍛',
    categories:  ['Meals', 'Beverages', 'Snacks'],
  },
  {
    id:          'ball_2',
    name:        'Ball 2 Canteen',
    shortName:   'Ball 2',
    description: 'Quick snacks & hot beverages',
    image:       'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
    badge:       '🥪',
    categories:  ['Snacks', 'Beverages'],
  },
  {
    id:          'pencil_1',
    name:        'Pencil 1 Canteen',
    shortName:   'Pencil 1',
    description: 'Biryanis & rice meals',
    image:       'https://images.unsplash.com/photo-1563379091339-03246963d66a?auto=format&fit=crop&q=80&w=800',
    badge:       '🍚',
    categories:  ['Meals'],
  },
]

export const menuItems = [
  // ── Ball 1 — Meals ─────────────────────────────────────────────────────────
  {
    id: 'b1-meal-1', canteen_id: 'ball_1', category: 'meals',
    name: 'Veg Thali', price: 60,
    description: 'Dal, sabzi, roti, rice, pickle and sweet',
    image: 'https://images.unsplash.com/photo-1680993032090-1ef7ea9b51e5?crop=entropy&cs=srgb&fm=jpg&q=85',
    available: true, prepTime: '10 min',
  },
  {
    id: 'b1-meal-2', canteen_id: 'ball_1', category: 'meals',
    name: 'Non-Veg Thali', price: 90,
    description: 'Chicken curry, dal, roti, rice and raita',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '15 min',
  },
  {
    id: 'b1-meal-3', canteen_id: 'ball_1', category: 'meals',
    name: 'Paneer Butter Masala', price: 80,
    description: 'Rich creamy paneer curry with 4 rotis',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '12 min',
  },
  {
    id: 'b1-meal-4', canteen_id: 'ball_1', category: 'meals',
    name: 'Chole Bhature', price: 50,
    description: 'Spicy chickpea curry with fluffy bhature',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '8 min',
  },
  // ── Ball 1 — Beverages ──────────────────────────────────────────────────────
  {
    id: 'b1-bev-1', canteen_id: 'ball_1', category: 'beverages',
    name: 'Masala Chai', price: 15,
    description: 'Traditional Indian spiced tea',
    image: 'https://images.unsplash.com/photo-1579968337218-0b97c9c4db51?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '3 min',
  },
  {
    id: 'b1-bev-2', canteen_id: 'ball_1', category: 'beverages',
    name: 'Fresh Lime Soda', price: 20,
    description: 'Refreshing lime with soda water',
    image: 'https://images.unsplash.com/photo-1694019835724-c8a1b92e37c7?crop=entropy&cs=srgb&fm=jpg&q=85',
    available: true, prepTime: '2 min',
  },
  {
    id: 'b1-bev-3', canteen_id: 'ball_1', category: 'beverages',
    name: 'Cold Coffee', price: 40,
    description: 'Chilled coffee with ice cream',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '5 min',
  },
  {
    id: 'b1-bev-4', canteen_id: 'ball_1', category: 'beverages',
    name: 'Mango Lassi', price: 35,
    description: 'Sweet mango yogurt drink',
    image: 'https://images.unsplash.com/photo-1575487426366-079595af2247?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '3 min',
  },
  // ── Ball 1 — Snacks ─────────────────────────────────────────────────────────
  {
    id: 'b1-snack-1', canteen_id: 'ball_1', category: 'snacks',
    name: 'Veg Burger', price: 45,
    description: 'Crispy veg patty with cheese and veggies',
    image: 'https://images.unsplash.com/photo-1632898657999-ae6920976661?crop=entropy&cs=srgb&fm=jpg&q=85',
    available: true, prepTime: '7 min',
  },
  {
    id: 'b1-snack-2', canteen_id: 'ball_1', category: 'snacks',
    name: 'Veg Sandwich', price: 30,
    description: 'Grilled sandwich with veggies and cheese',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '6 min',
  },
  {
    id: 'b1-snack-3', canteen_id: 'ball_1', category: 'snacks',
    name: 'French Fries', price: 35,
    description: 'Crispy golden fries with ketchup',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '8 min',
  },
  {
    id: 'b1-snack-4', canteen_id: 'ball_1', category: 'snacks',
    name: 'Pav Bhaji', price: 50,
    description: 'Spicy vegetable curry with butter pav',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '10 min',
  },
  // ── Ball 2 — Snacks ─────────────────────────────────────────────────────────
  {
    id: 'b2-snack-1', canteen_id: 'ball_2', category: 'snacks',
    name: 'Samosa (2 pcs)', price: 18,
    description: 'Classic crispy potato-filled pastry',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '5 min',
  },
  {
    id: 'b2-snack-2', canteen_id: 'ball_2', category: 'snacks',
    name: 'Samosa Chaat', price: 30,
    description: 'Samosa with chole, chutneys and sev',
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '7 min',
  },
  {
    id: 'b2-snack-3', canteen_id: 'ball_2', category: 'snacks',
    name: 'Bread Pakora', price: 25,
    description: 'Stuffed bread fritters with green chutney',
    image: 'https://images.unsplash.com/photo-1601050690117-a9c77ede1f2a?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '6 min',
  },
  // ── Ball 2 — Beverages ──────────────────────────────────────────────────────
  {
    id: 'b2-bev-1', canteen_id: 'ball_2', category: 'beverages',
    name: 'Cutting Chai', price: 12,
    description: 'Small strong Indian tea',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '3 min',
  },
  {
    id: 'b2-bev-2', canteen_id: 'ball_2', category: 'beverages',
    name: 'Nimbu Pani', price: 15,
    description: 'Fresh lemonade with black salt',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '2 min',
  },
  // ── Pencil 1 — Meals ────────────────────────────────────────────────────────
  {
    id: 'p1-meal-1', canteen_id: 'pencil_1', category: 'meals',
    name: 'Veg Biryani', price: 70,
    description: 'Aromatic basmati rice with mixed vegetables',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d66a?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '15 min',
  },
  {
    id: 'p1-meal-2', canteen_id: 'pencil_1', category: 'meals',
    name: 'Chicken Biryani', price: 100,
    description: 'Dum-cooked chicken biryani with boiled egg',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '20 min',
  },
  {
    id: 'p1-meal-3', canteen_id: 'pencil_1', category: 'meals',
    name: 'Egg Biryani', price: 85,
    description: 'Spiced egg biryani with salan and raita',
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '15 min',
  },
  {
    id: 'p1-meal-4', canteen_id: 'pencil_1', category: 'meals',
    name: 'Paneer Biryani', price: 90,
    description: 'Fragrant biryani with marinated paneer cubes',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=800',
    available: true, prepTime: '15 min',
  },
]

export const pickupSlots = [
  { id: 'slot-1', label: '12:00 PM', time: '12:00', session: 'Lunch' },
  { id: 'slot-2', label: '12:15 PM', time: '12:15', session: 'Lunch' },
  { id: 'slot-3', label: '12:30 PM', time: '12:30', session: 'Lunch' },
  { id: 'slot-4', label: '12:45 PM', time: '12:45', session: 'Lunch' },
  { id: 'slot-5', label: '1:00 PM',  time: '13:00', session: 'Lunch' },
  { id: 'slot-6', label: '4:00 PM',  time: '16:00', session: 'Snacks' },
  { id: 'slot-7', label: '4:30 PM',  time: '16:30', session: 'Snacks' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
export const getMenuByCanteen     = (canteenId) => menuItems.filter(i => i.canteen_id === canteenId)
export const getCanteenById       = (id)        => canteens.find(c => c.id === id) ?? null
export const getCategoriesByCanteen = (canteenId) => {
  const items = getMenuByCanteen(canteenId)
  const seen  = new Set()
  const cats  = [{ id: 'all', label: 'All' }]
  for (const item of items) {
    if (!seen.has(item.category)) {
      seen.add(item.category)
      cats.push({ id: item.category, label: item.category.charAt(0).toUpperCase() + item.category.slice(1) })
    }
  }
  return cats
}