"use client";
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import storyService from '@/services/storyService';
import toast from 'react-hot-toast';
import Link from 'next/link';

const StoryInteractions = ({ storyId, initialLikes = 0, initialComments = [], isLoggedIn = false }) => {
  const { isLoggedIn: authLoggedIn } = useAuth();
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await storyService.likeStory(storyId);
      console.log('Like response:', res);
      setLikesCount((prev) => prev + 1);
      toast.success('Story liked');
    } catch (error) {
      console.error('Like failed:', error);
      const msg = error.response?.data?.message || 'Unable to like story';
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
    <div className="mt-12 space-y-10">
      <div className="flex items-center gap-6 border-y border-outline-variant/10 py-6">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 group transition-all"
          disabled={isLiking}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-outline-variant group-hover:bg-primary/10 group-hover:border-primary/40 transition-all">
            <span className="material-symbols-outlined text-sm group-hover:text-primary">favorite</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface">{likesCount} Likes</span>
        </button>
        
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-outline-variant">
            <span className="material-symbols-outlined text-sm">chat_bubble</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">{comments.length} Comments</span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-widest text-on-surface">Community Echo</h3>
        {comments.length === 0 ? (
          <div className="text-xs text-on-surface-variant uppercase tracking-widest">No approved comments yet.</div>
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

      <form onSubmit={handleComment} className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Add Comment</h4>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full min-h-[140px] bg-surface-container-low border border-outline-variant rounded-2xl p-4 text-on-surface text-sm focus:outline-none focus:border-primary"
          placeholder="Share your thoughts… (comments are reviewed before publishing)"
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Comment'}
          </button>
          {!canInteract && (
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-4">
              Login Required
            </Link>
          )}
        </div>
      </form>
    </div>
  );
};

export default StoryInteractions;
