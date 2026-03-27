import React from 'react'

export default function OrderSuccess({ token, onTrack }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in fade-in duration-700">
      
      {/* THE TICK ANIMATION */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
        <svg 
          className="w-14 h-14 text-green-500 animate-bounce" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="4" 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>

      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Placed!</h1>
      <p className="text-gray-500 mt-2 text-lg">Your meal is now being prepared.</p>

      {/* THE TOKEN CARD */}
      <div className="mt-10 bg-gray-50 border-2 border-dashed border-gray-200 p-10 rounded-[2.5rem] w-full max-w-sm">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Token Number</span>
        <div className="text-7xl font-black text-primary mt-3 tabular-nums">
          #{token || '...'}
        </div>
      </div>

      <div className="mt-12 w-full max-w-sm flex flex-col gap-4">
        <button 
          onClick={onTrack}
          className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all"
        >
          Track My Order
        </button>
        
        <p className="text-gray-400 text-xs px-4">
          A copy of this receipt has been saved to your orders history.
        </p>
      </div>
    </div>
  )
}