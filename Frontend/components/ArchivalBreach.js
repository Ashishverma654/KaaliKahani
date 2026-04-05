"use client";
import React from 'react';

export default function ArchivalBreach() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
      
      {/* Glitch Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-black to-black animate-pulse"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)] pointer-events-none"></div>
      </div>

      <div className="relative z-10 text-center space-y-8 px-6 animate-in zoom-in duration-500">
        
        {/* Warning Icon */}
        <div className="inline-block relative">
           <div className="absolute inset-0 bg-primary/40 blur-3xl animate-pulse"></div>
           <span className="material-symbols-outlined text-8xl text-primary animate-shake relative">warning</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white uppercase italic">
            ARCHIVAL BREACH DETECTED
          </h1>
          <p className="text-primary font-bold text-xs uppercase tracking-[0.5em] animate-pulse">
            System Integrity: COMPROMISED • Registry: SHIELDED
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-6">
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm mx-auto">
            The master registry has been retracted due to an unauthorized atmospheric fluctuation. Curators are currently purging the anomaly.
          </p>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left font-mono text-[10px] space-y-1">
             <div className="flex gap-2">
                <span className="text-primary font-bold">ERR_CODE:</span>
                <span className="text-on-surface/80 underline text-red-500">PARANORMAL_INTERFERENCE_0x04</span>
             </div>
             <div className="flex gap-2">
                <span className="text-primary font-bold">LOCATION:</span>
                <span className="text-on-surface/80">NULL_SPACE_CORE</span>
             </div>
             <div className="flex gap-2">
                <span className="text-primary font-bold">STATUS:</span>
                <span className="text-on-surface/80 animate-pulse">RECALIBRATING...</span>
             </div>
          </div>
        </div>

        <div className="pt-12 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
           KaaliKahani Editorial Desk • System Lock V1.5.2
        </div>
      </div>

      {/* Grid Scanline */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/30 blur-sm animate-scanline"></div>
    </div>
  );
}
