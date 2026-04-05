// app/admin/layout.js
"use client";
import React, { useState, Suspense } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Navbar from '@/components/admin/Navbar';

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface transition-colors duration-500 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 min-h-screen transition-all duration-500 ease-in-out bg-surface ${
          isCollapsed ? 'pl-20' : 'pl-72'
        }`}
      >
        <Navbar isCollapsed={isCollapsed} />

        <main className="pt-16 p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-surface transition-colors">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>

        {/* Admin Footer */}
        <footer className="p-6 text-center border-t border-outline-variant bg-surface-container-low/30">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
            © 2024 KaaliKahani curator console • v1.0.4-stable
          </p>
        </footer>
      </div>
    </div>
  );
}
