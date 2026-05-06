import React, { Suspense } from 'react';
import Link from 'next/link';
import StoryInteractions from '@/components/StoryInteractions';
import StoryProgressTracker from '@/components/StoryProgressTracker';

async function getStory(slug, lang) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api'}/stories/${slug}?lang=${lang || 'en'}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error("Failed to fetch story on server:", error);
    return null;
  }
}

const getText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.en || value.hi || '';
};

import { resolveImageUrl } from '@/utils/image';

const getCoverImage = (story) => {
  const url = story?.coverImage
    ? resolveImageUrl(story.coverImage)
    : (Array.isArray(story?.images) && story.images.length > 0)
      ? resolveImageUrl(story.images[0])
      : '';
  console.log('Resolved Cover Image:', url);
  return url;
};

const CATEGORY_LABELS = {
  'real-horror': 'Real Horror',
  'paranormal': 'Paranormal',
  'haunted-places': 'Haunted Places',
  'urban-legends': 'Urban Legends',
  'general-horror': 'General Horror'
};

export default async function StoryDetail({ params, searchParams }) {
  const { slug } = await params;
  const { lang = 'en' } = await searchParams;

  if (!slug) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <h1 className="text-2xl font-gothic text-on-surface-variant uppercase tracking-widest">Invalid Story Reference</h1>
      </div>
    );
  }

  const data = await getStory(slug, lang);
  const story = data?.story || null;
  const comments = data?.comments || [];
  const progressStats = data?.progressStats || { readers: 0, avgProgress: 0, completed: 0 };

  if (!story) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <h1 className="text-2xl font-gothic text-on-surface-variant uppercase tracking-widest">Story not found.</h1>
      </div>
    );
  }

  return (
    <article className="relative">
      {/* Cinematic Background Image Layer (Synchronized with Homepage) */}
      <div className="fixed inset-0 z-[-20] overflow-hidden bg-surface">
        <img 
          src="/assets/homePage.jpg" 
          alt="Atmospheric Background"
          className="w-full h-full object-cover opacity-10 dark:opacity-40 transition-opacity duration-1000 grayscale-[0.9] dark:grayscale-[0.5] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/40 to-surface opacity-100"></div>
      </div>

      {/* Decorative Ambience Blobs (Synchronized with Homepage) */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 opacity-30 animate-pulse" />
      <div className="fixed bottom-0 right-[10%] w-[800px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none -z-10 opacity-20" />


      {/* Hero Section */}
      <header className="relative w-full pt-4 md:pt-6 pb-4">
        <div className="relative w-full px-6 md:px-12 lg:px-24 z-10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-white px-2 py-0.5 text-[10px] font-black tracking-widest uppercase rounded flex items-center shadow-lg">
              {CATEGORY_LABELS[story.category] || story.category || "STORY"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight text-on-surface max-w-5xl">
            {getText(story.title, lang)}
          </h1>
          <div className="flex items-center gap-4 text-on-surface-variant font-bold tracking-[0.2em] uppercase mt-2">
            <span className="text-xs md:text-sm text-on-surface">
              {story.author?.name || "KaaliKahani Writer"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(158,27,27,0.3)]"></span>
            <span className="text-[10px] md:text-xs">
              {story.views || 0} reads
            </span>
          </div>
        </div>
      </header>
 
      {/* Main Content Area */}
      <div className="w-full px-6 md:px-12 lg:px-24 pt-0 pb-8">
        <div className="space-y-8 font-sans drop-shadow-md pb-8">
          <div className="text-lg md:text-xl lg:text-2xl leading-[1.8] text-on-surface-variant whitespace-pre-wrap text-justify">
            {getText(story.content, lang)}
          </div>

          {/* User Uploaded Images Gallery */}
          {(() => {
            const bodyImages = story.images || [];
            if (bodyImages.length === 0) return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-12">
                {bodyImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-outline-variant/10 group">
                    <img 
                      src={resolveImageUrl(img)} 
                      alt={`Story visual ${idx + 1}`} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          <StoryInteractions
            storyId={story._id}
            initialLikes={story.likesCount || 0}
            initialComments={comments}
            initialCommentsCount={story.commentsCount || 0}
          >
            <StoryProgressTracker storyId={story._id} />
          </StoryInteractions>
        </div>

        <footer className="mt-3 pt-3 border-t border-outline-variant/20">
          <div className="w-full bg-surface-container-high rounded-2xl p-6 md:p-8 text-center border border-outline-variant shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-22 h-22 bg-primary/5 rounded-full blur-3xl -mr-1 -mt-18" />
            <span className="text-sm text-primary font-black uppercase tracking-[0.3em] mb-2 block">Join the Legacy</span>
            <h4 className="font-bold text-5xl text-black mb-2 uppercase">Interested in publishing?</h4>
            <p className="text-base md:text-lg text-on-surface-variant mb-5 max-w-md mx-auto leading-relaxed">
              Sign up today and share your stories with our growing community of horror enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-2.5 bg-white text-black font-black text-sm rounded-full hover:bg-primary hover:text-white transition-all uppercase tracking-widest shadow-xl font-sans">
                Register Now
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}
