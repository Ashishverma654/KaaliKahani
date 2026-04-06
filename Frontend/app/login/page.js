"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/utils/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

function AuthenticationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isAdmin, isSettled, loading: authLoading, refreshUser, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', dob: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Identity Guard: Redirect based on clearance and 'from' vector map
  React.useEffect(() => {
    if (isSettled && isLoggedIn) {
      const from = searchParams.get('from') || (isAdmin ? '/admin' : '/');
      
      // Small delay to ensure the session has fully registered in the browser map
      const timer = setTimeout(() => {
        router.push(from);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isAdmin, isSettled, router, searchParams]);

  // Blocking Restoration Pulse map: If the session is settled and user is logged in, hide the form map
  if (isSettled && isLoggedIn) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
          <div className="absolute inset-4 border border-primary/40 rounded-full animate-[ping_2s_linear_infinite]"></div>
          <span className="material-symbols-outlined text- primary text-6xl animate-pulse">lock_person</span>
        </div>
        <h2 className="text-2xl font-display font-black text-white tracking-widest uppercase mb-4">Archival Synchronization</h2>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.4em] opacity-40">Verifying clearance level... Redirecting to appropriate quadrant.</p>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation for matching passwords in registration
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passphrases do not align. Integrity compromised.");
      toast.error('Alignment Error');
      return;
    }

    setLoading(true);
    
    try {
      const from = searchParams.get('from');
      const isAdminLogin = isLogin && from === '/admin';
      const endpoint = isLogin ? (isAdminLogin ? '/auth/admin/login' : '/auth/login') : '/auth/register';
      
      const res = await login({ 
        email: formData.email, 
        password: formData.password,
        name: formData.name, // For registration if needed map map map
        dob: formData.dob,    // For registration if needed map map map
        endpoint
      });
      
      toast.success(isLogin ? `Welcome back, ${res.user.name}` : 'Account curated successfully!');
    } catch (err) {
      if (err.response?.data?.data?.errors) {
        setError(err.response.data.data.errors.join(', '));
      } else {
        setError(err.response?.data?.message || 'Authentication failed. Integrity compromised.');
      }
      toast.error('Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 selection:bg-primary/20 transition-all duration-700 relative overflow-hidden bg-black">
      
      {/* Cinematic Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          key={isLogin ? 'login-bg' : 'register-bg'}
          src={isLogin ? "/assets/loginPage.jpg" : "/assets/registerationPage.jpg"} 
          alt="Auth Background"
          className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
        />
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>
      </div>
      
      {/* Centered Portal Container */}
      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-[850px]'} relative z-10 animate-in fade-in zoom-in-95 duration-1000 transition-all duration-500`}>
        
        {/* Minimalist Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase leading-none drop-shadow-2xl mb-4">
            {isLogin ? 'Welcome Back.' : 'Become a Curator.'}
          </h1>
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">
            {isLogin ? 'Identify yourself' : 'Initiate your registration'}
          </p>
        </div>

        {/* The Authentication Gate */}
        <div className="bg-black/5 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-shake backdrop-blur-md">
               {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className={`grid grid-cols-1 ${!isLogin ? 'md:grid-cols-2' : ''} gap-x-8 gap-y-6`}>
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 opacity-60">Full Identity</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ashish Verma"
                      required
                      className="w-full bg-[#f0f3ff]/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/40 transition-all backdrop-blur-xl shadow-inner font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 opacity-60">Date of Birth</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-[#f0f3ff]/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-red-500/40 transition-all backdrop-blur-xl shadow-inner font-bold [color-scheme:dark]"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 opacity-60">Registry Email</label>
                <input 
                  type="email" 
                  placeholder="curator@kahani.com"
                  required
                  className="w-full bg-[#f0f3ff]/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/40 transition-all backdrop-blur-xl shadow-inner font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 opacity-60">Secret Passphrase</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#f0f3ff]/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/40 transition-all backdrop-blur-xl shadow-inner font-bold"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 opacity-60">Confirm Secret Passphrase</label>
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#f0f3ff]/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/40 transition-all backdrop-blur-xl shadow-inner font-bold border-dashed border-white/10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-white font-bold uppercase text-[9px] tracking-[0.3em] transition-all group opacity-40 hover:opacity-100">
                      <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                      Return to Archive
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 space-y-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#a31d1d] text-white font-black text-[10px] uppercase tracking-[0.4em] py-5 rounded-2xl shadow-2xl hover:bg-[#8b1818] transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? 'Initiating...' : (isLogin ? 'Initiate Access' : 'Register Account')}
              </button>

              {isLogin && (
                <div className="flex justify-center">
                  <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-white font-bold uppercase text-[9px] tracking-[0.3em] transition-all group opacity-40 hover:opacity-100">
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Return to Archive
                  </Link>
                </div>
              )}
            </div>
          </form>

          <div className="pt-6 text-center border-t border-white/5">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
              {isLogin ? "Not yet initiated into the archive? " : "Already held in high regard? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setFormData({ name: '', email: '', password: '', confirmPassword: '', dob: '' });
                }} 
                className="text-[#a31d1d] font-bold hover:text-white transition-colors underline underline-offset-4"
              >
                {isLogin ? 'Register now.' : 'Login now.'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthenticatonPortal() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black tracking-[0.5em] uppercase text-on-surface-variant/40">Synchronizing Identity Registry...</p>
      </div>
    }>
      <AuthenticationContent />
    </Suspense>
  );
}
