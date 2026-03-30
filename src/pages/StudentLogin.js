// import { useState } from 'react';
// import { supabase } from '../lib/supabaseClient';

// export default function StudentAuth() {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState(null);

//   // Validation: Batch (22-25) + Specific Domains
//   const validateEmail = (email) => {
//     const pattern = /^(2[2-5])[a-zA-Z0-9._%+-]+@(aec|acet|acoe|aus)\.edu\.in$/;
//     return pattern.test(email.toLowerCase());
//   };

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setMessage(null);

//     // 1. Common Validation
//     if (!validateEmail(email)) {
//       setError("Only students from batches 22-25 at AEC, ACET, ACOE, or AUS are eligible.");
//       setLoading(false);
//       return;
//     }

//     if (isSignUp) {
//       // 2. Sign Up Specific Validation
//       if (password !== confirmPassword) {
//         setError("Passwords do not match.");
//         setLoading(false);
//         return;
//       }
//       if (password.length < 6) {
//         setError("Password must be at least 6 characters.");
//         setLoading(false);
//         return;
//       }

//       // 3. Supabase Sign Up
//       const { data, error: signUpError } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             role: 'student',
//             batch: email.substring(0, 2)
//           }
//         }
//       });

//       if (signUpError) setError(signUpError.message);
//       else setMessage("Check your email for a verification link!");
      
//     } else {
//       // 4. Supabase Login
//       const { data, error: loginError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (loginError) setError(loginError.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
//       <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md border-t-4 border-primary">
//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">CampusEats</h2>
//           <p className="text-gray-400 text-xs mt-1">Student {isSignUp ? 'Registration' : 'Login'}</p>
//         </div>

//         <form onSubmit={handleAuth} className="space-y-4">
//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase ml-1">College Email</label>
//             <input
//               type="email"
//               placeholder="22a91a61i@aec.edu.in"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full border p-3 rounded-xl focus:outline-primary mt-1"
//             />
//           </div>

//           <div>
//             <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Password</label>
//             <input
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="w-full border p-3 rounded-xl focus:outline-primary mt-1"
//             />
//           </div>

//           {isSignUp && (
//             <div>
//               <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Retype Password</label>
//               <input
//                 type="password"
//                 placeholder="••••••••"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 required
//                 className="w-full border p-3 rounded-xl focus:outline-primary mt-1"
//               />
//             </div>
//           )}

//           {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-100">⚠️ {error}</div>}
//           {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-xs border border-green-100">✅ {message}</div>}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-button disabled:opacity-50 transition-all"
//           >
//             {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
//           </button>
//         </form>

//         <button 
//           onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} 
//           className="w-full text-sm text-gray-500 mt-6 underline"
//         >
//           {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
//         </button>
//       </div>
//     </div>
//   );
// }

// src/pages/StudentAuth.js
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Validation: Batch (22-25) + Specific Domains
  const validateEmail = (email) => {
    const pattern = /^(2[2-5])[a-zA-Z0-9._%+-]+@(aec|acet|acoe|aus)\.edu\.in$/;
    return pattern.test(email.toLowerCase());
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // 1. Common Validation
    if (!validateEmail(email)) {
      setError("Only students from batches 22-25 at AEC, ACET, ACOE, or AUS are eligible.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      // 2. Sign Up Specific Validation
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      // 3. Supabase Sign Up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'student',
            batch: email.substring(0, 2)
          }
        }
      });

      if (signUpError) setError(signUpError.message);
      else setMessage("Check your email for a verification link!");
      
    } else {
      // 4. Supabase Login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) setError(loginError.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-6 font-sans selection:bg-[#f06e28] selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#1c1c1e] p-8 rounded-[32px] border border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.02),4px_4px_15px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f06e28] to-transparent opacity-50"></div>

        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl font-extrabold text-white tracking-wide">CampusEats</h2>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mt-2">
            Student {isSignUp ? 'Registration' : 'Secure Login'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1 mb-1 block">College Email</label>
            <input
              type="email"
              placeholder="22a91a61i@aec.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#121212] border border-white/10 text-white placeholder-gray-600 p-4 rounded-2xl focus:border-[#f06e28] focus:outline-none focus:ring-1 focus:ring-[#f06e28] transition-all font-medium tracking-wide shadow-inner"
            />
          </div>

          <div>
            <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#121212] border border-white/10 text-white placeholder-gray-600 p-4 rounded-2xl focus:border-[#f06e28] focus:outline-none focus:ring-1 focus:ring-[#f06e28] transition-all font-medium tracking-wide shadow-inner"
            />
          </div>

          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-1">
                  <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1 mb-1 block">Retype Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#121212] border border-white/10 text-white placeholder-gray-600 p-4 rounded-2xl focus:border-[#f06e28] focus:outline-none focus:ring-1 focus:ring-[#f06e28] transition-all font-medium tracking-wide shadow-inner"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs font-bold tracking-wider border border-red-500/20 text-center">
                ⚠️ {error}
              </motion.div>
            )}
            {message && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="bg-green-500/10 text-green-400 p-3 rounded-xl text-xs font-bold tracking-wider border border-green-500/20 text-center">
                ✅ {message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#f06e28] text-white py-4 mt-2 rounded-2xl font-bold tracking-widest uppercase text-sm shadow-[0_8px_20px_-4px_rgba(240,110,40,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isSignUp ? 'Create Account' : 'Secure Sign In'
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} 
            className="text-[11px] font-bold tracking-widest uppercase text-gray-500 hover:text-[#f06e28] transition-colors"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}