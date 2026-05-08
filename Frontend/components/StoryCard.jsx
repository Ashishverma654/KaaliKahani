'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getText, getSlug, getCoverImage, CATEGORY_LABELS } from '@/utils/story';
import storyService from '@/services/storyService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function StoryCard({ story }) {
  const { isLoggedIn, isSettled } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (isLoggedIn && story?._id) {
        try {
          const data = await storyService.checkBookmarkStatus(story._id);
          setIsSaved(data.isBookmarked);
        } catch (error) {}
        try {
          const likeData = await storyService.checkLikeStatus(story._id);
          setIsLiked(likeData.isLiked);
        } catch (error) {}
      }
    };
    if (isSettled) fetchStatus();
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
      toast.error('Failed to save story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link 
      href={`/detail/${getSlug(story.slug)}`} 
      className="gothic-frame p-3 group bg-surface-container-low/60 backdrop-blur-3xl rounded-3xl border border-outline-variant/10 hover:bg-surface-container transition-all duration-300 shadow-xl overflow-hidden flex flex-col h-full relative"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden mb-4 border border-outline-variant shadow-sm rounded-2xl">
        <img 
          src={getCoverImage(story) || "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800&auto=format&fit=crop"} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-100" 
          alt={getText(story.title)}
        />
        <span className="absolute top-3 left-3 bg-surface-container-low/80 backdrop-blur text-on-surface border border-outline-variant/50 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow">
          {CATEGORY_LABELS[story.category] || story.category || "STORY"}
        </span>
        
        {isLoggedIn && (
          <button 
            onClick={handleSave}
            disabled={loading}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md border border-outline-variant/30 flex items-center justify-center transition-all shadow-lg ${
              isSaved ? 'bg-primary text-white border-primary' : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${isSaved ? 'fill-1' : ''}`}>
              {isSaved ? 'bookmark_added' : 'bookmark'}
            </span>
          </button>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">{getText(story.title)}</h3>
      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">{getText(story.content)}</p>
      
      <div className="mt-auto flex items-center justify-between text-[9px] text-on-surface-variant font-bold uppercase tracking-widest border-t border-outline-variant/10 pt-3 transition-colors">
         <span className="flex items-center gap-2">{story.views || 0} VIEWS</span>
         <span className="flex items-center gap-1">
           <span 
             className={`material-symbols-outlined text-[10px] ${isLiked ? 'text-red-600' : ''}`}
             style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
           >
             favorite
           </span> 
           {story.likesCount || 0}
         </span>
      </div>
    </Link>
  );
}
