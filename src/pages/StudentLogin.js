// import { useState } from 'react';
// import { supabase } from '../lib/supabaseClient';

// export default function StudentLogin() {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [step, setStep] = useState('email'); // 'email' or 'otp'
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Validation: Batch (22-25) + Specific Domains
//   const validateEmail = (email) => {
//     const pattern = /^(2[2-5])[a-zA-Z0-9._%+-]+@(aec|acet|acoe|aus)\.edu\.in$/;
//     return pattern.test(email.toLowerCase());
//   };

//   // Step 1: Send OTP with Frontend Metadata
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     if (!validateEmail(email)) {
//       setError("Only students from batches 22-25 at AEC, ACET, ACOE, or AUS are eligible.");
//       setLoading(false);
//       return;
//     }

//     const { error: authError } = await supabase.auth.signInWithOtp({
//       email,
//       options: {
//         shouldCreateUser: true,
//         data: {
//           role: 'student', // Assigned here to avoid DB trigger issues
//           batch: email.substring(0, 2)
//         },
//         emailRedirectTo: window.location.origin,
//       }
//     });

//     if (authError) {
//       setError(authError.message);
//     } else {
//       setStep('otp');
//     }
//     setLoading(false);
//   };

//   // Step 2: Verify OTP (The missing function)
//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const { error: verifyError } = await supabase.auth.verifyOtp({
//       email,
//       token: otp,
//       type: 'email'
//     });

//     if (verifyError) {
//       setError(verifyError.message);
//     }
//     // App.js listener handles the state change automatically upon success
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
//       <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md border-t-4 border-primary">
//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">CampusEats</h2>
//           <p className="text-gray-400 text-xs mt-1">Authorized Student Access</p>
//         </div>

//         <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-4">
//           {step === 'email' ? (
//             <div>
//               <label className="text-xs font-semibold text-gray-500 uppercase ml-1">College Email</label>
//               <input
//                 type="email"
//                 placeholder="22a91a61i@aec.edu.in"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full border p-3 rounded-xl focus:outline-primary mt-1"
//               />
//             </div>
//           ) : (
//             <div>
//               <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Verification Code</label>
//               <input
//                 type="text"
//                 placeholder="6-digit OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 required
//                 className="w-full border p-3 rounded-xl tracking-widest text-center text-xl focus:outline-primary mt-1"
//               />
//             </div>
//           )}

//           {error && (
//             <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-100">
//               ⚠️ {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-button disabled:opacity-50 transition-all"
//           >
//             {loading ? 'Processing...' : step === 'email' ? 'Send OTP' : 'Verify & Login'}
//           </button>
//         </form>

//         {step === 'otp' && (
//           <button onClick={() => setStep('email')} className="w-full text-sm text-gray-400 mt-4 underline">
//             Change Email
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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
      const { error: signUpError } = await supabase.auth.signUp({
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
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) setError(loginError.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md border-t-4 border-primary">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">CampusEats</h2>
          <p className="text-gray-400 text-xs mt-1">Student {isSignUp ? 'Registration' : 'Login'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">College Email</label>
            <input
              type="email"
              placeholder="22a91a61i@aec.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border p-3 rounded-xl focus:outline-primary mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border p-3 rounded-xl focus:outline-primary mt-1"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Retype Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border p-3 rounded-xl focus:outline-primary mt-1"
              />
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-100">⚠️ {error}</div>}
          {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-xs border border-green-100">✅ {message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-button disabled:opacity-50 transition-all"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} 
          className="w-full text-sm text-gray-500 mt-6 underline"
        >
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}