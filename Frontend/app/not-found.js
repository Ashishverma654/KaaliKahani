import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-on-surface">
      
      {/* Cinematic "Void" Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-black to-black opacity-60"></div>
        <div className="absolute inset-0 backdrop-blur-[100px]"></div>
        
        {/* Animated Shadow Particles (CSS only) */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse opacity-10" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content Hub */}
      <div className="relative z-10 text-center px-6 max-w-2xl space-y-12 animate-in fade-in zoom-in duration-1000">
        
        {/* 404 Branding */}
        <div className="space-y-4">
          <h2 className="text-[12rem] font-black font-gothic leading-none tracking-tighter opacity-10 select-none">
            404
          </h2>
          <h1 className="text-5xl md:text-7xl font-black font-gothic tracking-[0.2em] uppercase text-white -mt-24 drop-shadow-[0_0_30px_rgba(163,29,29,0.5)]">
            LOST IN THE SHADOWS
          </h1>
        </div>

        <div className="space-y-8">
          <p className="text-sm md:text-base font-medium text-on-surface-variant/80 leading-relaxed max-w-lg mx-auto italic">
            "The story you're looking for has vanished into the dark. It may have been deleted, or perhaps it never existed at all."
          </p>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/" 
              className="group flex items-center gap-4 bg-primary text-on-primary-container px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-2xl active:scale-95"
            >
              <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">home</span>
              Return to Safety
            </Link>
            
            <Link 
              href="/" 
              className="group flex items-center gap-4 bg-white/5 border border-white/10 text-on-surface px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all backdrop-blur-xl active:scale-95"
            >
              <span className="material-symbols-outlined text-sm transition-transform group-hover:scale-110">auto_stories</span>
              Search Stories
            </Link>
          </div>
        </div>

        {/* Page Footer */}
        <div className="pt-12 border-t border-white/5 opacity-40">
           <p className="text-[9px] font-black uppercase tracking-[0.5em]">KaaliKahani • Page Not Found</p>
        </div>
      </div>

      {/* Frame Decals */}
      <div className="absolute top-10 left-10 pointer-events-none opacity-20">
         <div className="w-12 h-12 border-t-2 border-l-2 border-white/20 rounded-tl-3xl"></div>
      </div>
      <div className="absolute bottom-10 right-10 pointer-events-none opacity-20">
         <div className="w-12 h-12 border-b-2 border-r-2 border-white/20 rounded-br-3xl"></div>
      </div>
    </div>
  );
}
