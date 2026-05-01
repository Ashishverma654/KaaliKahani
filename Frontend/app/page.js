import React, { Suspense } from 'react';
import Link from 'next/link';
import HeroCard from '@/components/HeroCard';
import StoryCard from '@/components/StoryCard';
import { getText, getSlug, getCoverImage, CATEGORY_LABELS } from '@/utils/story';

// This is a Server Component by default in Next.js App Router
async function getStories(category) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/stories${category ? `?category=${encodeURIComponent(category)}` : ''}`, {
      cache: 'no-store' // Ensure we get fresh stories on every request
    });
    const data = await res.json();
    return data.data || {};
  } catch (error) {
    console.error("Failed to fetch stories on server:", error);
    return {};
  }
}

async function getFeaturedStory() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/stories/featured`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    return null;
  }
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const category = params.category;
  const data = await getStories(category);
  const stories = data.stories || [];
  const featuredFromSettings = await getFeaturedStory();

  const featuredStory = featuredFromSettings || (stories.length > 0 ? stories[0] : null);
  const listStories = stories.filter((s) => s._id !== featuredStory?._id).slice(0, 10);
  const trendingStories = [...stories]
    .filter((s) => s._id !== featuredStory?._id)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const mostLiked = [...stories].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))[0] || null;
  const mostRead = [...stories].sort((a, b) => (b.views || 0) - (a.views || 0))[0] || null;
  const categoryCounts = stories.reduce((acc, s) => {
    const key = s.category || 'general-horror';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0] || 'general-horror';

  return (
    <main className="font-sans relative">
      {/* Cinematic Background Image Layer */}
      <div className="fixed inset-0 z-[-20] overflow-hidden bg-surface">
        <img 
          src="/assets/homePage.jpg" 
          alt="Home Background"
          className="w-full h-full object-cover opacity-10 dark:opacity-40 transition-opacity duration-1000 grayscale-[0.9] dark:grayscale-[0.5] contrast-[1.1] scale-105"
        />
        {/* Atmospheric Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/40 to-surface opacity-100"></div>
      </div>

      {/* Decorative Ambience Blobs */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 opacity-30 animate-pulse" />
      <div className="fixed bottom-0 right-[10%] w-[800px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none -z-10 opacity-20" />
      
      {/* Top Banner */}
      <div className="w-full flex justify-center py-4 text-[8px] uppercase tracking-[0.3em] font-bold text-on-surface-variant border-b border-outline-variant">
        ADVERTISEMENT
      </div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 w-full">
        {/* Hero Section */}
        {featuredStory ? (
          <HeroCard story={featuredStory} />
        ) : (
          <div className="mt-8 relative w-full h-[70vh] min-h-[500px] rounded-[32px] overflow-hidden border border-outline-variant shadow-2xl flex items-center justify-center bg-surface-container">
             <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">No verified stories published yet.</span>
          </div>
        )}

        {/* Categories Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto py-10 scrollbar-hide">
          <Link 
            href="/"
            className={`px-6 py-2.5 text-[9px] font-black tracking-[0.3em] uppercase rounded-full border transition-all shadow-lg ${
              !category 
                ? 'bg-primary text-white border-primary/30' 
                : 'bg-surface-container text-on-surface border-outline-variant/50 hover:border-primary/40 hover:text-primary'
            }`}
          >
            All Stories
          </Link>
          {[
            { label: 'Real Horror', value: 'real-horror' },
            { label: 'Paranormal', value: 'paranormal' },
            { label: 'Haunted Places', value: 'haunted-places' },
            { label: 'Urban Legends', value: 'urban-legends' }
          ].map((cat) => (
            <Link 
              key={cat.value}
              href={`/?category=${encodeURIComponent(cat.value)}`}
              className={`px-6 py-2.5 text-[9px] font-black tracking-[0.3em] uppercase rounded-full border whitespace-nowrap transition-all shadow-lg ${
                category === cat.value 
                  ? 'bg-primary text-white border-primary/30' 
                  : 'bg-surface-container text-on-surface border-outline-variant/50 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Main Content Flow */}
        <div className="flex flex-col gap-16 pb-24">
          <div>
            <h2 className="text-4xl font-black text-on-surface mb-8 tracking-wide drop-shadow-sm transition-colors duration-300">Recent Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listStories.length > 0 ? listStories.map((story) => (
                <StoryCard key={story._id} story={story} />
              )) : (
                <div className="col-span-full py-10 text-center text-on-surface-variant text-sm font-bold tracking-[0.2em] uppercase bg-surface-container-low/40 backdrop-blur-xl rounded-3xl border border-outline-variant/10">
                   No stories found
                </div>
              )}
            </div>
          </div>

          {/* Trending & Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="gothic-frame p-8 bg-surface-container-low/60 backdrop-blur-2xl rounded-3xl border border-outline-variant/10 shadow-2xl">
              <h3 className="text-xl font-black text-on-surface mb-6 tracking-wide border-b border-outline-variant/10 pb-4 uppercase text-[11px] tracking-[0.5em]">Trending Now</h3>
              <div className="grid grid-cols-1">
                {trendingStories.length > 0 ? trendingStories.map((story, idx) => (
                  <Link href={`/detail/${getSlug(story.slug)}`} key={story._id} className="group flex items-center gap-6 border-b border-outline-variant/10 py-5 last:border-0 hover:bg-surface-container transition-colors -mx-4 px-4 rounded-xl">
                    <span className="text-4xl font-gothic font-bold text-on-surface-variant/20 group-hover:text-primary transition-colors min-w-[40px] text-center">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-base text-on-surface leading-tight group-hover:text-primary transition-colors mb-1">{getText(story.title)}</h4>
                      <span className="text-[10px] text-on-surface-variant tracking-[0.1em] uppercase font-bold">{story.views || 0} READS</span>
                    </div>
                  </Link>
                )) : (
                  <div className="py-6 text-center text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">No trending data</div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="gothic-frame p-8 bg-surface-container-low/60 backdrop-blur-2xl rounded-3xl border border-outline-variant/10 shadow-2xl space-y-6 h-full">
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-on-surface-variant border-b border-outline-variant/10 pb-4">Live Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Most Liked</span>
                        <span className="text-[10px] font-black text-primary">{mostLiked ? `${mostLiked.likesCount || 0}` : '—'}</span>
                      </div>
                      <div className="text-sm text-on-surface font-bold bg-surface-container/30 p-2 rounded-lg border border-outline-variant/5 leading-snug">
                        {mostLiked ? getText(mostLiked.title) : 'No stories yet'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Most Read</span>
                        <span className="text-[10px] font-black text-primary">{mostRead ? `${mostRead.views || 0}` : '—'}</span>
                      </div>
                      <div className="text-sm text-on-surface font-bold bg-surface-container/30 p-2 rounded-lg border border-outline-variant/5 leading-snug">
                        {mostRead ? getText(mostRead.title) : 'No stories yet'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-32 gothic-frame flex items-center justify-center bg-surface-container-low/40 backdrop-blur-xl rounded-3xl border border-outline-variant/10 border-dashed text-on-surface-variant text-[10px] font-bold tracking-[0.2em] shadow-2xl">
             AD SPACE
          </div>
        </div>
      </div>
    </main>
  );
}
