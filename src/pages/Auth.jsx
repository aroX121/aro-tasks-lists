import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  // Detect password recovery token in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccessMsg('Password updated! Redirecting to login...');
      setTimeout(() => {
        setIsRecovery(false);
        setSuccessMsg('');
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await signup(email, password, { first_name: firstName, last_name: lastName });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Password Recovery UI ---
  if (isRecovery) {
    return (
      <div className="flex bg-[#f3f4fb] dark:bg-slate-950 items-center justify-center p-4 h-[100vh]">
        <div className="max-w-[460px] w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Set New Password</h1>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-8">Enter your new password below.</p>
          <form onSubmit={handlePasswordReset} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100">{error}</div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm border border-emerald-100">{successMsg}</div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full pl-5 pr-12 py-3 text-[14px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-emerald-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full py-4 text-[15px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f3f4fb] dark:bg-slate-950 items-center justify-center p-4 h-[100vh]">
      <div className="max-w-[1000px] w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 flex gap-4 md:gap-8 shadow-2xl h-full max-h-[700px] relative overflow-hidden">
        
        {/* Left Side - Image Panel */}
        <div className="hidden md:block w-1/2 relative rounded-[2rem] overflow-hidden">
          <img 
            src="/auth_bg.png" 
            alt="Abstract 3D Background" 
            className="w-full h-full object-cover"
          />
          {/* Logo overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center justify-center text-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="w-full md:w-1/2 flex flex-col pt-8 md:pt-12 px-4 md:px-10 overflow-y-auto custom-scrollbar">
          {!isLogin && (
            <button 
              onClick={() => setIsLogin(true)} 
              className="absolute top-8 right-10 md:static flex mt-[-10px] items-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="mt-8 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-[15px] text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="font-semibold text-slate-900 dark:text-white border-b-2 border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-white pb-0.5 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                  <input 
                    type="text" 
                    placeholder="John" 
                    required={!isLogin}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full px-5 py-3 text-[14px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2 w-1/2">
                  <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe" 
                    required={!isLogin}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full px-5 py-3 text-[14px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input 
                type="email" 
                placeholder="hello@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full px-5 py-3 text-[14px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full pl-5 pr-12 py-3 text-[14px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-center gap-3 mt-2">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input type="checkbox" required className="w-full h-full appearance-none border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white transition-colors cursor-pointer z-10" />
                  <svg className="absolute w-3 h-3 text-white dark:text-black pointer-events-none z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <label className="text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                  {`I agree to the `}
                  <a href="#" className="font-bold text-slate-900 dark:text-white border-b border-slate-900 dark:border-white pb-0.5">Terms & Condition</a>
                </label>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="mt-6 w-full bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full py-4 text-[15px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
