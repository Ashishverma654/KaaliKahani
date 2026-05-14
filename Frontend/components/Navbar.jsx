"use client";
import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/app/components/ThemeToggle';
import HeaderCategoryDropdown from '@/app/components/HeaderCategoryDropdown';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '@/utils/image';

const Navbar = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [searchQuery, setSearchQuery] = useState('');

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${isAuthPage ? 'bg-transparent border-transparent' : 'bg-surface/90 backdrop-blur-md border-b border-outline-variant'}`}>
      <div className="flex justify-between items-center px-4 md:px-12 h-16 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 md:gap-12">
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-on-surface hover:text-primary transition-colors flex items-center justify-center w-10 h-10 -ml-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span className="material-symbols-outlined text-2xl">{showMobileMenu ? 'close' : 'menu'}</span>
          </button>

          <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-gothic text-primary tracking-normal sm:tracking-wider drop-shadow-sm">
            KaaliKahani
          </Link>
          {/* Removed Category Dropdown as per user request */}
        </div>
        
        {/* Search Bar & Actions */}
        <div className="flex items-center gap-4">
          {!isAuthPage && (
            <div className="hidden lg:flex items-center bg-surface-container px-4 py-1.5 rounded-full border border-outline-variant w-56 transition-colors duration-300">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2 flex items-center justify-center">search</span>
              <input 
                className="bg-transparent border-none focus:outline-none text-xs w-full placeholder:text-on-surface-variant flex items-center h-full outline-none text-on-surface" 
                placeholder="Search stories..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
              />
            </div>
          )}

            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              {isLoggedIn ? (
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3">

                    <Link 
                      href="/submit" 
                      className="bg-surface-container text-on-surface-variant border border-outline-variant/30 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center h-8"
                    >
                      New Story
                    </Link>
                  </div>
                  
                  {/* User Profile Dropdown */}
                  <div className="relative pl-4 border-l border-white/10" ref={userMenuRef}>
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="group relative flex items-center"
                      title={`User: ${user?.name}`}
                    >
                      <div className="w-9 h-9 rounded-full ring-2 ring-outline-variant/30 ring-offset-2 ring-offset-surface transition-all group-hover:ring-primary/50 overflow-hidden bg-surface-container-high backdrop-blur-xl flex items-center justify-center">
                        {user?.avatar ? (
                          <img src={resolveImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                        ) : (
                          <span className="material-symbols-outlined text-lg text-on-surface-variant group-hover:text-primary transition-colors">account_circle</span>
                        )}
                      </div>
                      {/* Status Indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
                    </button>

                    {/* User Menu */}
                    {showUserMenu && (
                      <div className="absolute top-12 right-0 w-48 bg-surface-container-high backdrop-blur-3xl border border-outline-variant/30 rounded-2xl shadow-2xl py-3 animate-in fade-in slide-in-from-top-2 duration-300 z-50 overflow-hidden">
                        <div className="px-5 py-2 border-b border-outline-variant/10 mb-2">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Logged In As</p>
                          <p className="text-xs text-on-surface font-bold truncate max-w-full">{user?.name}</p>
                        </div>
                        
                        <Link 
                          href="/profile" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all group"
                        >
                          <span className="material-symbols-outlined text-sm group-hover:text-primary transition-colors">person</span>
                          Profile
                        </Link>

                        {user?.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all group"
                          >
                            <span className="material-symbols-outlined text-sm group-hover:text-primary transition-colors">dashboard_customize</span>
                            Admin Hub
                          </Link>
                        )}
                        
                        <button 
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 transition-all border-t border-outline-variant/10 group"
                        >
                          <span className="material-symbols-outlined text-sm group-hover:animate-pulse">logout</span>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-surface-container text-on-surface border border-outline-variant/30 px-4 md:px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-2xl backdrop-blur-xl flex items-center justify-center h-8 whitespace-nowrap"
                >
                  <span className="md:hidden">Login</span>
                  <span className="hidden md:block">Login / Sign Up</span>
                </Link>
              )}
            </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-surface/95 backdrop-blur-xl border-b border-outline-variant shadow-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="p-6 flex flex-col gap-6">
            {!isAuthPage && (
              <div className="flex items-center bg-surface-container px-4 py-3 rounded-2xl border border-outline-variant transition-colors duration-300">
                <span className="material-symbols-outlined text-on-surface-variant text-lg mr-3">search</span>
                <input 
                  className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-on-surface-variant flex items-center h-full outline-none text-on-surface" 
                  placeholder="Search stories..." 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setShowMobileMenu(false);
                      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                />
              </div>
            )}
            
            <div className="flex flex-col gap-4 font-sans text-xs font-black tracking-widest uppercase border-t border-outline-variant/30 pt-6">
               <Link href="/" className="text-on-surface hover:text-primary transition-colors py-2" onClick={() => setShowMobileMenu(false)}>Home</Link>
               {/* Mobile Categories Removed */}
            </div>
            
            {isLoggedIn && (
              <div className="border-t border-outline-variant/30 pt-6 mt-2">
                <Link 
                  href="/submit" 
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full bg-primary text-on-primary-container px-4 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span className="material-symbols-outlined text-sm">edit_document</span>
                  Write New Story
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
