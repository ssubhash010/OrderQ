// // src/pages/ProfilePage.js
// import { ArrowLeft, ChefHat, ShoppingBag, Info } from 'lucide-react'

// export default function ProfilePage({ onNavigate }) {
//   return (
//     <div className="min-h-screen bg-gray-50 pb-24">
//       <div className="gradient-hero text-white p-6">
//         <div className="max-w-lg mx-auto flex items-center gap-4">
//           <button onClick={() => onNavigate('canteen-list')} className="bg-white/20 p-2 rounded-full">
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <h1 className="font-heading text-2xl font-bold">Profile</h1>
//         </div>
//       </div>

//       <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
//         {/* User card */}
//         <div className="bg-white rounded-2xl p-5 border border-orange-100 flex items-center gap-4">
//           <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">🎓</div>
//           <div>
//             <p className="font-bold text-gray-900">Campus Student</p>
//             <p className="text-gray-500 text-sm">Anonymous session</p>
//             <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
//               Signed In
//             </span>
//           </div>
//         </div>

//         {/* Quick actions */}
//         <div className="bg-white rounded-2xl overflow-hidden border border-orange-100">
//           {[
//             {
//               icon:   <ShoppingBag className="w-5 h-5 text-primary" />,
//               label:  'My Orders',
//               sub:    'View your order history',
//               action: 'orders',
//             },
//             {
//               icon:   <ChefHat className="w-5 h-5 text-gray-600" />,
//               label:  'Canteen Dashboard',
//               sub:    'Staff only — manage orders',
//               action: 'canteen',
//             },
//           ].map((item, i) => (
//             <button
//               key={i}
//               onClick={() => onNavigate(item.action)}
//               className={`w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-100' : ''}`}
//             >
//               <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
//                 {item.icon}
//               </div>
//               <div className="flex-1">
//                 <p className="font-semibold text-gray-900">{item.label}</p>
//                 <p className="text-gray-400 text-xs">{item.sub}</p>
//               </div>
//               <span className="text-gray-300">›</span>
//             </button>
//           ))}
//         </div>

//         {/* Zero-fee banner */}
//         <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-5 text-white">
//           <div className="flex items-start gap-3">
//             <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="font-bold mb-1">Why zero fees?</p>
//               <p className="text-white/80 text-sm leading-relaxed">
//               CampusEats uses secure Payment Gateways..
//               </p>
//               <p className="text-yellow-200 text-xs mt-2 font-semibold">
//                 Saves ₹22,500+/day at 500 orders vs marketplace model
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* App info */}
//         <div className="bg-white rounded-2xl p-4 border border-orange-100 text-center">
//           <p className="font-heading text-lg font-bold text-primary">CampusEats</p>
//           <p className="text-gray-400 text-xs mt-1">v2.0.0 · Multi-Canteen Edition</p>
//           <p className="text-gray-400 text-xs">Paytm Gateway</p>
//         </div>
//       </div>
//     </div>
//   )
// }


// src/pages/ProfilePage.js
import { ArrowLeft, ChefHat, ShoppingBag, Info, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilePage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#121212] pb-24 font-sans text-gray-100">
      {/* Header */}
      <div className="p-5 pb-6 pt-12 border-b border-white/5 bg-[#121212]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onNavigate('canteen-list')} className="bg-[#1c1c1e] p-3 rounded-full border border-white/5 shadow-[-2px_-2px_8px_rgba(255,255,255,0.02),4px_4px_8px_rgba(0,0,0,0.5)]">
            <ArrowLeft className="w-5 h-5 text-gray-200" />
          </motion.button>
          <div className="flex-1">
             <h1 className="font-heading text-2xl font-extrabold tracking-wide text-white">Profile</h1>
             <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-0.5">Settings & Info</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">
        {/* User card */}
        <div className="bg-[#1c1c1e] rounded-[32px] p-6 border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] flex items-center gap-5 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#f06e28] opacity-5 rounded-full blur-2xl"></div>
          <div className="w-20 h-20 bg-[#121212] rounded-[24px] flex items-center justify-center text-4xl border border-white/10 shadow-inner">🎓</div>
          <div>
            <p className="font-heading text-xl font-extrabold text-white tracking-wide">Campus Student</p>
            <p className="text-gray-500 text-xs font-medium tracking-wider mt-1 mb-2">Anonymous secure session</p>
            <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-[0_0_10px_rgba(34,197,94,0.1)]">
              Online
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-[#1c1c1e] rounded-[32px] overflow-hidden border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] divide-y divide-white/5">
          {[
            {
              icon:   <ShoppingBag className="w-5 h-5 text-[#f06e28]" />,
              label:  'My Orders',
              sub:    'View your order history',
              action: 'orders',
            },
            {
              icon:   <ChefHat className="w-5 h-5 text-gray-400" />,
              label:  'Staff Portal',
              sub:    'Authorized personnel only',
              action: 'canteen',
            },
          ].map((item, i) => (
            <motion.button
              whileTap={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              key={i}
              onClick={() => onNavigate(item.action)}
              className="w-full flex items-center gap-5 p-5 text-left transition-colors"
            >
              <div className="w-12 h-12 bg-[#121212] border border-white/5 shadow-inner rounded-2xl flex items-center justify-center">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold tracking-wide text-gray-200">{item.label}</p>
                <p className="text-gray-500 text-xs font-medium tracking-wider mt-0.5">{item.sub}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-600" />
            </motion.button>
          ))}
        </div>

        {/* Zero-fee banner */}
        <div className="bg-[#1c1c1e] relative overflow-hidden rounded-[32px] p-6 border border-[#f06e28]/20 shadow-[0_0_20px_rgba(240,110,40,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f06e28]/10 to-transparent"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-[#f06e28]/20 p-2 rounded-xl border border-[#f06e28]/30">
               <Info className="w-5 h-5 text-[#f06e28] flex-shrink-0" />
            </div>
            <div>
              <p className="font-heading font-extrabold text-white tracking-wide mb-1">Why 100% Zero Fees?</p>
              <p className="text-gray-400 text-xs font-medium tracking-wider leading-relaxed">
                CampusEats utilizes a highly optimized Gateway architecture avoiding standard marketplace cuts.
              </p>
              <div className="mt-3 bg-[#121212] border border-white/5 rounded-lg p-2 inline-block">
                <p className="text-green-400 text-[10px] font-black tracking-widest uppercase">
                  Saves ₹22,500+ daily for the campus
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* App info */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 text-center shadow-inner mt-8">
          <p className="font-heading text-lg font-extrabold text-[#f06e28] tracking-widest uppercase opacity-80">CampusEats</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase border border-gray-700 px-2 py-0.5 rounded">v2.0.0</span>
            <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase border border-gray-700 px-2 py-0.5 rounded">Secure</span>
          </div>
        </div>
      </div>
    </div>
  )
}