export const categories = [
    { id: 'all', label: 'All', icon: null },
    { id: 'meals', label: 'Meals', icon: 'UtensilsCrossed' },
    { id: 'beverages', label: 'Beverages', icon: 'Coffee' },
    { id: 'snacks', label: 'Snacks', icon: 'Cookie' },
  ]
  
  export const menuItems = [
    {
      id: 'meal-1', category: 'meals', name: 'Veg Thali', price: 60,
      description: 'Complete meal with dal, sabzi, roti, rice, and sweet',
      image: 'https://images.unsplash.com/photo-1680993032090-1ef7ea9b51e5?crop=entropy&cs=srgb&fm=jpg&q=85',
      available: true, prepTime: '10 min'
    },
    {
      id: 'meal-2', category: 'meals', name: 'Non-Veg Thali', price: 90,
      description: 'Chicken curry, dal, roti, rice, and raita',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '15 min'
    },
    {
      id: 'meal-3', category: 'meals', name: 'Paneer Butter Masala', price: 80,
      description: 'Rich paneer curry with 4 rotis',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '12 min'
    },
    {
      id: 'meal-4', category: 'meals', name: 'Chole Bhature', price: 50,
      description: 'Spicy chickpea curry with fluffy bhature',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '8 min'
    },
    {
      id: 'bev-1', category: 'beverages', name: 'Masala Chai', price: 15,
      description: 'Traditional Indian spiced tea',
      image: 'https://images.unsplash.com/photo-1579968337218-0b97c9c4db51?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '3 min'
    },
    {
      id: 'bev-2', category: 'beverages', name: 'Fresh Lime Soda', price: 20,
      description: 'Refreshing lime with soda water',
      image: 'https://images.unsplash.com/photo-1694019835724-c8a1b92e37c7?crop=entropy&cs=srgb&fm=jpg&q=85',
      available: true, prepTime: '2 min'
    },
    {
      id: 'bev-3', category: 'beverages', name: 'Cold Coffee', price: 40,
      description: 'Chilled coffee with ice cream',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '5 min'
    },
    {
      id: 'bev-4', category: 'beverages', name: 'Mango Lassi', price: 35,
      description: 'Sweet mango yogurt drink',
      image: 'https://images.unsplash.com/photo-1575487426366-079595af2247?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '3 min'
    },
    {
      id: 'snack-1', category: 'snacks', name: 'Veg Burger', price: 45,
      description: 'Crispy veg patty with cheese and veggies',
      image: 'https://images.unsplash.com/photo-1632898657999-ae6920976661?crop=entropy&cs=srgb&fm=jpg&q=85',
      available: true, prepTime: '7 min'
    },
    {
      id: 'snack-2', category: 'snacks', name: 'Samosa (2 pcs)', price: 20,
      description: 'Classic potato-filled pastry',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '5 min'
    },
    {
      id: 'snack-3', category: 'snacks', name: 'Veg Sandwich', price: 30,
      description: 'Grilled sandwich with veggies and cheese',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '6 min'
    },
    {
      id: 'snack-4', category: 'snacks', name: 'French Fries', price: 35,
      description: 'Crispy golden fries with ketchup',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '8 min'
    },
    {
      id: 'snack-5', category: 'snacks', name: 'Pav Bhaji', price: 50,
      description: 'Spicy vegetable curry with butter pav',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800',
      available: true, prepTime: '10 min'
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