"use client";
import { useTheme } from "../providers";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return (
     <button className="flex items-center justify-center p-2 rounded-full w-10 h-10"></button>
  );

  return (
    <button 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center p-2 hover:bg-surface-container-high rounded-full transition-colors group w-10 h-10"
      aria-label="Toggle Dark Mode"
    >
      <span className="material-symbols-outlined text-outline-variant group-hover:text-on-surface transition-colors">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
