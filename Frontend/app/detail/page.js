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

const getCoverImage = (story) => {
  if (story?.coverImage) return story.coverImage;
  if (Array.isArray(story?.images) && story.images.length > 0) return story.images[0];
  return '';
};

const CATEGORY_LABELS = {
  'real-horror': 'Real Horror',
  'paranormal': 'Paranormal',
  'haunted-places': 'Haunted Places',
  'urban-legends': 'Urban Legends',
  'general-horror': 'General Horror'
};

export default async function StoryDetail({ searchParams }) {
  const params = await searchParams;
  const slug = params.slug;
  const lang = params.lang || 'en';

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
        <h1 className="text-2xl font-gothic text-on-surface-variant uppercase tracking-widest">Story not found in our archives.</h1>
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
                href={`/detail?slug=${story.slug?.en || slug}&lang=en`}
                className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full border ${lang === 'en' ? 'bg-primary text-white border-primary' : 'bg-surface/40 text-on-surface-variant border-outline-variant'}`}
              >
                English
              </Link>
              <Link
                href={`/detail?slug=${story.slug?.hi || story.slug?.en || slug}&lang=hi`}
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,720px)_1fr] gap-12 px-6 py-20">
        
        {/* Left Sidebar: Engagement (Statically rendered for now) */}
        <aside className="hidden lg:flex flex-col gap-8 sticky top-32 h-fit">
          <div className="flex flex-col items-center gap-4">
            <div className="group flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container border border-outline-variant group-hover:bg-primary-container/20 group-hover:border-primary/40 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">favorite</span>
              </div>
              <span className="text-xs font-bold text-on-surface-variant">{story.likesCount || 0}</span>
            </div>
            <div className="group flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container border border-outline-variant group-hover:bg-tertiary-container/20 group-hover:border-tertiary/40 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-tertiary transition-colors">chat_bubble</span>
              </div>
              <span className="text-xs font-bold text-on-surface-variant">{comments.length || 0}</span>
            </div>
          </div>
        </aside>

        {/* Narrative Content */}
        <div className="space-y-8 font-sans drop-shadow-md pb-24">
          <p className="text-xl md:text-2xl font-light leading-relaxed text-on-surface/90 italic border-l-4 border-primary pl-8 py-2 mb-8">
            {getText(story.content, lang)?.slice(0, 150)}...
          </p>
          <div className="text-lg leading-[1.8] text-on-surface-variant whitespace-pre-wrap">
            {getText(story.content, lang)}
          </div>

          <StoryInteractions
            storyId={story._id}
            initialLikes={story.likesCount || 0}
            initialComments={comments}
          />
          <StoryProgressTracker storyId={story._id} />
        </div>

        {/* Right Sidebar: Promo */}
        <aside className="hidden lg:flex flex-col gap-12 sticky top-32 h-fit">
          <div className="w-full bg-surface-container-high rounded-xl flex flex-col items-center justify-center p-6 text-center border border-outline-variant group shadow-lg">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-6">Join The Circle</span>
            <h4 className="font-gothic font-bold text-lg text-white mb-2 uppercase">Want to publish?</h4>
            <p className="text-xs text-on-surface-variant mb-6">Sign up today and get your voice heard by thousands.</p>
            <Link href="/login" className="w-full py-3 bg-white text-surface font-black text-xs rounded-full hover:bg-primary transition-colors text-center uppercase tracking-widest">Register</Link>
          </div>
        </aside>

      </div>
    </article>
  );
}
