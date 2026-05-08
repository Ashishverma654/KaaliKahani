"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import storyService from '@/services/storyService';
import toast from 'react-hot-toast';
import Link from 'next/link';

const StoryInteractions = ({ storyId, initialLikes = 0, initialComments = [], initialCommentsCount = 0, isLoggedIn = false, children }) => {
  const { isLoggedIn: authLoggedIn, isSettled } = useAuth();
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if ((authLoggedIn || isLoggedIn) && storyId) {
        try {
          const data = await storyService.checkLikeStatus(storyId);
          setHasLiked(data.isLiked);
        } catch (error) {}
      }
    };
    if (isSettled) fetchLikeStatus();
  }, [authLoggedIn, isLoggedIn, isSettled, storyId]);

  const canInteract = authLoggedIn || isLoggedIn;

  const handleLike = async () => {
    console.log('Like attempt:', { storyId, canInteract, authLoggedIn, isLoggedIn });
    if (!canInteract) {
      toast.error('Please login to like a story.');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      console.log('Sending like request to backend...');
      const data = await storyService.likeStory(storyId);
      console.log('Like response:', data);
      
      if (data.action === 'liked') {
        setLikesCount((prev) => prev + 1);
        setHasLiked(true);
        toast.success('Story liked');
      } else {
        setLikesCount((prev) => Math.max(0, prev - 1));
        setHasLiked(false);
        toast.success('Like removed');
      }
    } catch (error) {
      console.error('Like failed:', error);
      const msg = error.response?.data?.message || 'Unable to update like';
      toast.error(msg);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    console.log('Comment attempt:', { storyId, canInteract, commentText });
    if (!canInteract) {
      toast.error('Please login to comment.');
      return;
    }
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      console.log('Sending comment request to backend...');
      await storyService.addComment(storyId, commentText.trim());
      setCommentText('');
      toast.success('Comment submitted for review');
      // Comments are moderated now; do not inject into public list.
    } catch (error) {
      console.error('Comment failed:', error);
      const msg = error.response?.data?.message || 'Unable to submit comment';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 border-y border-outline-variant/10 py-1">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 group transition-all"
          disabled={isLiking}
        >
          <span 
            className={`material-symbols-outlined text-sm transition-all duration-300 ${hasLiked ? 'text-red-600 scale-110' : 'group-hover:text-primary'}`}
            style={hasLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            favorite
          </span>
          <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${hasLiked ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
            {likesCount} Likes
          </span>
        </button>

        <div className="flex items-center gap-2 group cursor-default">
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
            {Math.max(comments.length, initialCommentsCount || 0)} Comments
          </span>
        </div>
      </div>

      <div className="space-y-3 pl-2">
        <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">Comments</h3>
        {comments.length === 0 ? (
          <div className="text-xs text-on-surface-variant uppercase tracking-widest">No comments.</div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c._id} className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary text-xs font-black">
                    {c.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-on-surface">
                    {c.userId?.name || 'Anonymous'}
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
 
      <form onSubmit={handleComment} className="space-y-2 pl-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Add Comment</h4>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full min-h-[80px] bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface text-xs focus:outline-none focus:border-primary"
          placeholder="Share your thoughts…"
        />
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Comment'}
            </button>
            {!canInteract && (
              <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-4">
                Login Required
              </Link>
            )}
            {children}
          </div>
        </div>
      </form>
    </div>
  );
};

export default StoryInteractions;
