"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const { status, isLoggedIn, isSettled } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isSettled && !isLoggedIn) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoggedIn, isSettled, router, pathname]);

  if (!isSettled) {
    return (
       <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
          <div className="relative w-24 h-24">
             <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"></div>
             <div className="absolute inset-4 border border-primary/20 rounded-full animate-pulse"></div>
          </div>
          <div className="text-center space-y-3">
             <h2 className="text-xl font-black font-display tracking-[0.4em] uppercase text-white drop-shadow-2xl">Identity Verification</h2>
             <p className="text-[10px] font-black tracking-[0.6em] uppercase text-on-surface-variant/40 animate-pulse">Synchronizing Identity...</p>
          </div>
       </div>
    );
  }

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return null;
};

export default ProtectedRoute;
