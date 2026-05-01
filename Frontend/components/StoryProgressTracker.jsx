"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import storyService from '@/services/storyService';

const StoryProgressTracker = ({ storyId }) => {
  const { isLoggedIn, isSettled } = useAuth();
  const [lastProgress, setLastProgress] = useState(0);
  const debounceRef = useRef(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!isSettled || !isLoggedIn) return;
    const loadProgress = async () => {
      try {
        const data = await storyService.getProgress(storyId);
        if (typeof data?.progress === 'number') {
          setLastProgress(data.progress);
        }
      } catch {
        // Silent fail for progress
      }
    };
    loadProgress();
  }, [storyId, isLoggedIn, isSettled]);

  useEffect(() => {
    if (!isSettled || !isLoggedIn) return;

    const handleScroll = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const scrollHeight = doc.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100)) : 0;

        // Only send if meaningfully changed
        if (Math.abs(progress - lastSentRef.current) >= 5) {
          lastSentRef.current = progress;
          setLastProgress(progress);
          try {
            await storyService.updateProgress(storyId, progress);
          } catch {
            // Silent fail for progress
          }
        }
      }, 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [storyId, isLoggedIn, isSettled]);

  return null;
};

export default StoryProgressTracker;
