"use client";
import React from 'react';
import ThemeToggle from '@/app/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const Navbar = ({ isCollapsed }) => {
  const { user } = useAuth();
  
  return (
    <nav className={`fixed top-0 right-0 h-16 z-40 transition-all duration-500 ease-in-out border-b border-white/5 bg-black/50 backdrop-blur-3xl
      ${isCollapsed ? 'left-20' : 'left-72'}`}
    >
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3 py-1 px-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              <span className="text-[10px] font-black font-mono text-red-500 uppercase tracking-widest">Archive Online</span>
           </div>
           {/* Telemetry Display Placeholder */}
           <div className="hidden lg:flex items-center gap-8 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-xs">database</span>
                 99.9% Sync
              </div>
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-xs">public</span>
                 L/N 404.2
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">{user?.name || 'Chief Curator'}</p>
              <span className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest flex items-center justify-end gap-1">
                 <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                 Administrator Profile
              </span>
            </div>
            
            <Link href="/profile" className="group">
              <div className="w-9 h-9 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-white/5 group-hover:border-primary/50 shadow-2xl relative">
                {user?.avatar && user.avatar !== 'default-avatar.png' ? (
                  <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-container-highest/30 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">account_circle</span>
                  </div>
                )}
                {/* Curator HUD overlay */}
                <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none group-hover:border-primary/20"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
