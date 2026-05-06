import React from 'react';
import Link from 'next/link';

const getText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.hi || '';
};

async function searchStories(query) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api'}/stories/search?query=${encodeURIComponent(query)}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    // Ensure we return an array to prevent .map errors
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Search fetch error:", error);
    return [];
  }
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params.query || '';
  const stories = query ? await searchStories(query) : [];

  return (
    <main className="max-w-[1200px] mx-auto px-6 pt-24 pb-24">
      <header className="mb-10">
        <h1 className="text-4xl font-black font-gothic text-on-surface tracking-tight mb-2">Search Archives</h1>
        <p className="text-on-surface-variant text-sm">Results for: <span className="text-primary font-bold">{query || '...'}</span></p>
      </header>

      {stories.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl p-12 text-center text-on-surface-variant uppercase tracking-widest text-xs font-bold border border-outline-variant">
          No stories found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => (
            <Link key={story._id} href={`/detail/${story.slug?.en || story.slug?.hi || story.slug}`}>
              <div className="gothic-frame p-6 rounded-3xl border border-outline-variant/20 hover:border-primary transition-all flex flex-col gap-2 min-h-[160px]">
                <h3 className="text-2xl font-gothic text-on-surface leading-tight">{getText(story.title)}</h3>
                <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">{getText(story.content)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
