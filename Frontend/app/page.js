import React, { Suspense } from 'react';
import Link from 'next/link';
import api from '@/utils/api';

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

const getText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.hi || '';
};

const getSlug = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.hi || '';
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
    .slice(0, 3);

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
          <div className="mt-8 relative w-full h-[60vh] min-h-[500px] rounded-[32px] overflow-hidden border border-outline-variant shadow-2xl shadow-black/80 group">
            <img 
              alt={featuredStory.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110 opacity-80" 
              src={getCoverImage(featuredStory) || "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?q=80&w=2000&auto=format&fit=crop&grayscale"} 
              style={{ filter: "contrast(1.2) brightness(0.7) sepia(0.3) hue-rotate(-50deg) saturate(2)" }} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-14">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary text-on-primary-container px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded flex items-center shadow-sm">
                  {CATEGORY_LABELS[featuredStory.category] || featuredStory.category || "HORROR"}
                </span>
                <span className="text-white/70 text-xs font-bold tracking-widest uppercase drop-shadow-md">{featuredStory.readTime || 5} min read • {featuredStory.views || 0} reads</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-gothic text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none max-w-3xl mb-4">
                {getText(featuredStory.title)}
              </h1>
              <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed mb-8 drop-shadow-md font-medium line-clamp-2">
                {getText(featuredStory.content)}
              </p>
              <div className="flex items-center gap-3">
                <Link href={`/detail?slug=${getSlug(featuredStory.slug)}`} className="bg-primary border border-outline-variant text-on-primary-container px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">
                  Read Story
                </Link>
                <button className="w-11 h-11 bg-surface-container-low/80 backdrop-blur-md text-on-surface border border-outline-variant rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors shadow">
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 relative w-full h-[60vh] min-h-[500px] rounded-[32px] overflow-hidden border border-outline-variant shadow-2xl flex items-center justify-center bg-surface-container">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 pb-24">
          <div>
            <h2 className="text-4xl font-gothic text-on-surface mb-6 tracking-wide drop-shadow-sm transition-colors duration-300">Recent Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listStories.length > 0 ? listStories.map((story) => (
                <Link key={story._id} href={`/detail?slug=${getSlug(story.slug)}`} className="gothic-frame p-3 group bg-surface-container-low/60 backdrop-blur-3xl rounded-3xl border border-outline-variant/10 hover:bg-surface-container transition-all duration-300 shadow-xl overflow-hidden flex flex-col h-full">
                  <div className="relative aspect-[16/9] w-full overflow-hidden mb-4 border border-outline-variant shadow-sm rounded-2xl">
                    <img src={getCoverImage(story) || "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800&auto=format&fit=crop"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-100" alt={getText(story.title)}/>
                    <span className="absolute top-3 left-3 bg-surface-container-low/80 backdrop-blur text-on-surface border border-outline-variant/50 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow">{CATEGORY_LABELS[story.category] || story.category || "STORY"}</span>
                  </div>
                  <h3 className="text-2xl font-gothic text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">{getText(story.title)}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">{getText(story.content)}</p>
                  <div className="mt-auto flex items-center justify-between text-[9px] text-on-surface-variant font-bold uppercase tracking-widest border-t border-outline-variant/10 pt-3 transition-colors">
                     <span className="flex items-center gap-2">{story.readTime || 5} MIN • {story.views || 0} VIEWS</span>
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">favorite</span> {story.likesCount || 0}</span>
                  </div>
                </Link>
              )) : (
                <div className="col-span-1 md:col-span-2 py-10 text-center text-on-surface-variant text-sm font-bold tracking-[0.2em] uppercase bg-surface-container-low/40 backdrop-blur-xl rounded-3xl border border-outline-variant/10">
                   No stories found
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-8">
            <div className="gothic-frame p-6 pb-2 bg-surface-container-low/60 backdrop-blur-2xl rounded-3xl border border-outline-variant/10 shadow-2xl">
              <h3 className="text-xl font-gothic text-on-surface mb-4 tracking-wide border-b border-outline-variant/10 pb-2 uppercase text-[10px] font-black tracking-[0.4em]">Trending Now</h3>
              <div className="flex flex-col">
                {trendingStories.length > 0 ? trendingStories.map((story, idx) => (
                  <Link href={`/detail?slug=${getSlug(story.slug)}`} key={story._id} className="group flex gap-4 border-b border-outline-variant/10 py-4 last:border-0 hover:bg-surface-container transition-colors -mx-6 px-6">
                    <span className="text-2xl font-gothic font-bold text-on-surface-variant/40 group-hover:text-primary transition-colors">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="mt-1">
                      <h4 className="font-bold text-sm text-on-surface leading-snug group-hover:text-primary transition-colors mb-1">{getText(story.title)}</h4>
                      <span className="text-[9px] text-on-surface-variant tracking-[0.1em] uppercase font-bold">{story.views || 0} READS</span>
                    </div>
                  </Link>
                )) : (
                  <div className="py-6 text-center text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">No trending data</div>
                )}
              </div>
            </div>

            <div className="gothic-frame p-6 bg-surface-container-low/60 backdrop-blur-2xl rounded-3xl border border-outline-variant/10 shadow-2xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant">Live Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant">Most Liked</span>
                  <span className="text-[9px] font-black text-on-surface">{mostLiked ? `${mostLiked.likesCount || 0}` : '—'}</span>
                </div>
                <div className="text-xs text-on-surface font-bold line-clamp-1">
                  {mostLiked ? getText(mostLiked.title) : 'No stories yet'}
                </div>
              </div>
              <div className="space-y-3 pt-2 border-t border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant">Most Read</span>
                  <span className="text-[9px] font-black text-on-surface">{mostRead ? `${mostRead.views || 0}` : '—'}</span>
                </div>
                <div className="text-xs text-on-surface font-bold line-clamp-1">
                  {mostRead ? getText(mostRead.title) : 'No stories yet'}
                </div>
              </div>
              <div className="pt-2 border-t border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant">Top Category</span>
                  <span className="text-[9px] font-black text-on-surface">{CATEGORY_LABELS[topCategory] || topCategory}</span>
                </div>
              </div>
            </div>
            <div className="aspect-square gothic-frame flex items-center justify-center bg-surface-container-low/40 backdrop-blur-xl rounded-3xl border border-outline-variant/10 border-dashed text-on-surface-variant text-[10px] font-bold tracking-[0.2em] shadow-2xl">
               AD SPACE
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
