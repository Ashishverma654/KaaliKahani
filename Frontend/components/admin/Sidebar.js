"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Mission Control', icon: 'dashboard', path: '/admin' },
    { label: 'Story Registry', icon: 'auto_stories', path: '/admin/stories' },
    { label: 'Curator Directory', icon: 'group', path: '/admin/users' },
    { label: 'Archival Settings', icon: 'settings', path: '/admin/settings' },
    { label: 'Return to Archive', icon: 'arrow_back', path: '/' },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen z-50 transition-all duration-500 ease-in-out border-r border-white/5 
      ${isCollapsed ? 'w-20' : 'w-72'} 
      bg-black/40 backdrop-blur-3xl shadow-2xl flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
        {!isCollapsed && (
          <h2 className="text-xl font-black font-gothic text-primary tracking-widest uppercase truncate animate-in fade-in duration-500">
            Control
          </h2>
        )}
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-on-surface-variant/60"
        >
          <span className="material-symbols-outlined text-sm">
            {isCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-8 space-y-2 px-3 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.label}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                ${isActive 
                  ? 'bg-primary/10 text-primary shadow-xl shadow-primary/5 border border-primary/20' 
                  : 'text-on-surface-variant/40 hover:text-white hover:bg-white/5'
                }`}
            >
              {/* Active Marker */}
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"></div>
              )}
              
              <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 
                ${isActive ? 'text-primary' : 'opacity-60 group-hover:opacity-100'}`}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap animate-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}

              {/* Tooltip for Collapsed State */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-white text-[8px] font-black uppercase tracking-widest whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-white/5">
        <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''}`}>
           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
              A
           </div>
           {!isCollapsed && (
             <div className="animate-in fade-in duration-500 overflow-hidden">
                <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">Admin Unit</p>
                <p className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest truncate">Authorized Access</p>
             </div>
           )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
