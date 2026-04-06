"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HeaderCategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const categories = [
    { label: 'Real Horror', value: 'real-horror' },
    { label: 'Paranormal', value: 'paranormal' },
    { label: 'Haunted Places', value: 'haunted-places' },
    { label: 'Urban Legends', value: 'urban-legends' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    setIsOpen(false);
    if (category === 'All') {
      router.push('/');
    } else {
      router.push(`/?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 font-sans text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${
          isOpen || currentCategory ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        Categories
        <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-56 bg-surface border border-outline-variant rounded-xl shadow-2xl py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <button 
            onClick={() => handleCategorySelect('All')}
            className="w-full text-left px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary flex items-center justify-between"
          >
            All Stories
          </button>
          <div className="h-px bg-outline-variant/30 my-2 mx-5"></div>
          {categories.map((cat) => (
            <button 
              key={cat.value}
              onClick={() => handleCategorySelect(cat.value)}
              className={`w-full text-left px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase hover:bg-surface-container transition-colors flex items-center justify-between ${
                currentCategory === cat.value ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {cat.label}
              {currentCategory === cat.value && <span className="w-1 h-1 rounded-full bg-primary"></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
