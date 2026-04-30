"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ArchivalBreach from '@/components/ArchivalBreach';
import api from '@/utils/api';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  useEffect(() => {
    // Check master registry for maintenance status map
    const checkMaintenance = async () => {
      try {
        const res = await api.get('/settings/public');
        setMaintenanceMode(res.data.data.maintenanceMode);
      } catch (err) {
        // Fallback to operational if registry fetch fails map
        setMaintenanceMode(false);
      }
    };

    // Shield: Do NOT check maintenance on login/register pages
    if (!isAuthPage) {
      checkMaintenance();
    }
  }, [pathname, isAuthPage]);

  // Shield the archive if maintenance mode is active map
  if (maintenanceMode) {
    return <ArchivalBreach />;
  }

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <div className={`${isAuthPage ? '' : 'pt-16'} min-h-screen relative z-10 transition-colors duration-300`}>
        {children}
      </div>

      {!isAuthPage && (
        <footer className="relative w-full bg-surface-container-low mt-8 pt-14 pb-6 overflow-hidden transition-colors duration-300">

          {/* Architectural Brand Watermark */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-[0.03] z-0 w-full text-center">
            <h2 className="text-[15rem] md:text-[20rem] font-black font-gothic tracking-tighter leading-none whitespace-nowrap uppercase">
              KaaliKahani
            </h2>
          </div>

          <div className="relative z-10 max-w-[1440px] mx-auto px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10">

              {/* Brand Colophon */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <div className="text-3xl font-black font-display text-primary tracking-tight mb-4 uppercase">KaaliKahani.</div>
                  <p className="text-on-surface-variant font-sans text-sm leading-relaxed max-w-sm opacity-80 italic">
                    "The digital Platform for stories. Creating the best in storytelling and beyond."
                  </p>
                </div>

                {/* Archive Initiation (Newsletter) */}
                <div className="space-y-2 max-w-sm">
                  <h4 className="text-[12px] font-black text-on-surface uppercase tracking-[0.4em]">Newsletter</h4>
                  <div className="relative group">
                    <input
                      type="email"
                      placeholder="email@example.com"
                      className="w-full bg-surface-container-highest/20 border border-outline-variant/10 rounded-xl px-4 py-3 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 transition-all backdrop-blur-xl"
                    />
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-white text-[12px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-all shadow-lg active:scale-95">
                      Subscribe
                    </button>
                  </div>
                  <p className="text-[12px] text-on-surface-variant font-medium tracking-wide opacity-50 uppercase">Join 12,000+ readers today.</p>
                </div>
              </div>

              {/* Navigation Wings */}
              <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Explore</h4>
                  <ul className="space-y-2">
                    {['Popular', 'Recent', 'Authors', 'Staff Picks'].map((link) => (
                      <li key={link}>
                        <Link href="/" className="text-on-surface-variant hover:text-primary transition-all text-xs font-semibold tracking-wide flex items-center group">
                          <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Editorial</h4>
                  <ul className="space-y-2">
                    {['About', 'Careers', 'Narratives', 'Contact'].map((link) => (
                      <li key={link}>
                        <Link href="/" className="text-on-surface-variant hover:text-primary transition-all text-xs font-semibold tracking-wide flex items-center group">
                          <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Legal</h4>
                  <ul className="space-y-2">
                    {['Privacy', 'Terms of Service', 'Legal Notice'].map((link) => (
                      <li key={link}>
                        <Link href="/" className="text-on-surface-variant hover:text-primary transition-all text-xs font-semibold tracking-wide flex items-center group">
                          <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* Social Channels */}
                  <div className="flex gap-4 pt-4">
                    {['language', 'rss_feed', 'history_edu'].map((icon) => (
                      <span key={icon} className="material-symbols-outlined text-lg text-on-surface-variant hover:text-primary cursor-pointer transition-colors p-2 bg-surface-container-highest/10 rounded-lg border border-outline-variant/10">
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Colophon Base */}
            <div className="mt-8 pt-4 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-[0.4em] opacity-40">
                © 2026 KaaliKahani. All rights reserved.
              </p>
              <div className="flex gap-8 items-center opacity-40">
                <span className="text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">Version 2.0.4 - Premium Edition</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
