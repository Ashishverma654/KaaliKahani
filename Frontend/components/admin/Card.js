"use client";
import React from 'react';

const Card = ({ title, icon, children, className = "" }) => {
  return (
    <div className={`bg-black/5 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-2xl transition-all duration-500 hover:border-white/10 relative overflow-hidden group ${className}`}>
      {/* Background architectural glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors duration-700"></div>
      
      {title && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-all duration-500">
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </div>
            )}
            <h4 className="text-[10px] font-black uppercase text-on-surface tracking-[0.4em] opacity-80 group-hover:opacity-100 transition-opacity">
              {title}
            </h4>
          </div>
          {/* Decorative element */}
          <div className="flex gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
             <div className="w-1 h-1 rounded-full bg-white"></div>
             <div className="w-1 h-1 rounded-full bg-white"></div>
             <div className="w-1 h-1 rounded-full bg-white"></div>
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;
