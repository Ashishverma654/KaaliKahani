"use client";
import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll percentage
      const totalScrollable = documentHeight - windowHeight;
      const progress = totalScrollable > 0 ? (scrollY / totalScrollable) * 100 : 0;
      setScrollProgress(progress);

      // Show button after 100px of scroll
      setIsVisible(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG ring properties
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div 
      className={`fixed bottom-8 right-8 z-[70] transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToTop}
        className="relative flex items-center justify-center w-14 h-14 bg-surface-container/80 backdrop-blur-md rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        aria-label="Scroll to top"
      >
        {/* Progress SVG Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            className="text-outline-variant/30"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: dashOffset,
              strokeLinecap: 'round',
              transition: 'stroke-dashoffset 0.1s ease-out'
            }}
            className="text-primary"
          />
        </svg>

        {/* Icon - Perfectly Centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-2xl font-bold translate-y-[1px]">
            keyboard_arrow_up
          </span>
        </div>
      </button>
    </div>
  );
};

export default ScrollToTop;
