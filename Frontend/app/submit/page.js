"use client";
import React, { Suspense } from 'react';
import SubmitStoryContent from './SubmitStoryContent';

export default function SubmitStory() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black tracking-[0.5em] uppercase text-on-surface-variant/40">Loading Story Atmos...</p>
      </div>
    }>
      <SubmitStoryContent />
    </Suspense>
  );
}
