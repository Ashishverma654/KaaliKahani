import React, { Suspense } from 'react';
import Link from 'next/link';
import StoryInteractions from '@/components/StoryInteractions';
import StoryProgressTracker from '@/components/StoryProgressTracker';

async function getStory(slug, lang) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/stories/${slug}?lang=${lang || 'en'}`, {
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
    <article>
      {/* Immersive Progress Bar */}
      <div className="fixed top-20 left-0 w-full h-[2px] z-[60]">
        <div className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary w-[35%]"></div>
      </div>

      {/* Hero Section */}
      <header className="relative w-full h-[716px] max-h-[85vh] overflow-hidden flex items-end shadow-2xl">
        <img
          alt={getText(story.title)}
          className="absolute inset-0 w-full h-full object-cover"
          src={getCoverImage(story) || "https://images.unsplash.com/photo-1542106311-bfad4bd2e351?q=80&w=2000&auto=format&fit=crop"}
          style={{ filter: "brightness(0.6) contrast(1.1) grayscale(30%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto px-6 pb-16 text-center w-full">
          <nav className="flex justify-center gap-2 mb-6 flex-wrap">
            <span className="px-3 py-1 bg-primary-container/20 text-primary text-[10px] uppercase tracking-widest font-bold rounded-full border border-primary/20">{CATEGORY_LABELS[story.category] || story.category || "General"}</span>
            {story.seriesId && (
              <Link
                href={`/series/${story.seriesId._id}`}
                className="px-3 py-1 bg-surface/40 text-on-surface-variant text-[9px] uppercase tracking-widest font-bold rounded-full border border-outline-variant"
              >
                Series: {story.seriesId.title}
              </Link>
            )}
            <div className="flex items-center gap-2">
              <Link
                href={`/detail/${story.slug?.en || slug}?lang=en`}
                className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full border ${lang === 'en' ? 'bg-primary text-white border-primary' : 'bg-surface/40 text-on-surface-variant border-outline-variant'}`}
              >
                English
              </Link>
              <Link
                href={`/detail/${story.slug?.hi || story.slug?.en || slug}?lang=hi`}
                className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full border ${lang === 'hi' ? 'bg-primary text-white border-primary' : 'bg-surface/40 text-on-surface-variant border-outline-variant'}`}
              >
                Hindi
              </Link>
            </div>
          </nav>
          <h1 className="text-4xl md:text-7xl font-black font-gothic leading-[1.1] mb-8 tracking-tighter text-white drop-shadow-xl">
            {getText(story.title, lang)}
          </h1>
          <div className="flex flex-col items-center justify-center gap-3 text-on-surface-variant font-medium">
            <span className="bg-primary/20 border border-primary/50 text-white rounded-full px-4 py-1 text-xs uppercase tracking-widest font-bold">
              {story.author?.name || "KaaliKahani Writer"}
            </span>
            <p className="text-xs uppercase tracking-widest font-bold text-white/50">{story.readTime || 5} min read • {story.views || 0} reads</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">
              {progressStats.readers} readers • avg {progressStats.avgProgress}% • {progressStats.completed} finished
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <div className="space-y-12 font-sans drop-shadow-md pb-16">
          <div className="text-xl md:text-2xl leading-[1.8] text-on-surface-variant whitespace-pre-wrap">
            {getText(story.content, lang)}
          </div>

          <StoryInteractions
            storyId={story._id}
            initialLikes={story.likesCount || 0}
            initialComments={comments}
          />
          <StoryProgressTracker storyId={story._id} />
        </div>

        <footer className="mt-20 pt-16 border-t border-outline-variant/20">
          <div className="w-full bg-surface-container-high rounded-[32px] p-8 md:p-12 text-center border border-outline-variant shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mb-6 block">Join the Legacy</span>
            <h4 className="font-gothic font-bold text-3xl text-white mb-4 uppercase">Interested in publishing?</h4>
            <p className="text-sm text-on-surface-variant mb-10 max-w-md mx-auto leading-relaxed">
              Sign up today and share your stories with our growing community of horror enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black text-[10px] rounded-full hover:bg-primary hover:text-white transition-all uppercase tracking-widest shadow-xl">
                Register Now
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}
