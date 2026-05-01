'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getText, getSlug, getCoverImage, CATEGORY_LABELS } from '@/utils/story';
import storyService from '@/services/storyService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function HeroCard({ story }) {
  const { isLoggedIn, isSettled } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (isLoggedIn && story?._id) {
        try {
          const data = await storyService.checkBookmarkStatus(story._id);
          setIsSaved(data.isBookmarked);
        } catch (error) {
          console.error("Failed to check bookmark status:", error);
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    };

    if (isSettled) {
      fetchBookmarkStatus();
    }
  }, [isLoggedIn, isSettled, story?._id]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error('Please login to save stories');
      return;
    }

    try {
      setLoading(true);
      const result = await storyService.bookmarkStory(story._id);
      setIsSaved(result.action === 'saved');
      toast.success(result.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 relative w-full h-[70vh] min-h-[500px] rounded-[32px] overflow-hidden border border-outline-variant shadow-2xl shadow-black/80 group bg-black">
      {/* Blurred Background Layer */}
      <img 
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110"
        src={getCoverImage(story) || "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=2000&auto=format&fit=crop"}
      />
      {/* Main Visible Image */}
      <img 
        alt={getText(story.title)}
        className="relative w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" 
        src={getCoverImage(story) || "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=2000&auto=format&fit=crop"} 
        style={{ filter: "contrast(1.1) brightness(0.9)" }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
      
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-primary text-on-primary-container px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded flex items-center shadow-sm">
            {CATEGORY_LABELS[story.category] || story.category || "HORROR"}
          </span>
          <span className="text-white/70 text-xs font-bold tracking-widest uppercase drop-shadow-md">{story.views || 0} reads</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none max-w-3xl mb-4">
          {getText(story.title)}
        </h1>
        
        <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed mb-8 drop-shadow-md font-medium line-clamp-2">
          {getText(story.content)}
        </p>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/detail/${getSlug(story.slug)}`} 
            className="bg-primary border border-outline-variant text-on-primary-container px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg"
          >
            Read Story
          </Link>
          
          {isLoggedIn && !checking && (
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`w-11 h-11 backdrop-blur-md border border-outline-variant rounded-lg flex items-center justify-center transition-all shadow group/save ${
                isSaved 
                  ? 'bg-primary text-on-primary-container' 
                  : 'bg-surface-container-low/80 text-on-surface hover:bg-surface-container'
              }`}
              title={isSaved ? "Saved to Bookmarks" : "Save Story"}
            >
              <span className={`material-symbols-outlined text-sm transition-all ${isSaved ? 'fill-1' : 'group-hover/save:scale-110'}`}>
                {isSaved ? 'bookmark_added' : 'bookmark'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
