"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function PublishCTA() {
  const { isLoggedIn, isSettled } = useAuth();

  if (!isSettled || isLoggedIn) {
    return null;
  }

  return (
    <footer className="mt-3 pt-3 border-t border-outline-variant/20">
      <div className="w-full bg-surface-container-high rounded-2xl p-6 md:p-8 text-center border border-outline-variant shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-22 h-22 bg-primary/5 rounded-full blur-3xl -mr-1 -mt-18" />
        <span className="text-sm text-primary font-black uppercase tracking-[0.3em] mb-2 block">Join the Legacy</span>
        <h4 className="font-bold text-5xl text-black mb-2 uppercase">Interested in publishing?</h4>
        <p className="text-base md:text-lg text-on-surface-variant mb-5 max-w-md mx-auto leading-relaxed">
          Sign up today and share your stories with our growing community of horror enthusiasts.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="w-full sm:w-auto px-8 py-2.5 bg-white text-black font-black text-sm rounded-full hover:bg-primary hover:text-white transition-all uppercase tracking-widest shadow-xl font-sans">
            Register Now
          </Link>
        </div>
      </div>
    </footer>
  );
}
