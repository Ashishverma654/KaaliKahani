import React from 'react';
import Link from 'next/link';

const getText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.hi || '';
};

async function getSeries(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/series/${id}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    return null;
  }
}

export default async function SeriesPage({ params }) {
  const data = await getSeries(params.id);
  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <h1 className="text-2xl font-gothic text-on-surface-variant uppercase tracking-widest">Series not found.</h1>
      </div>
    );
  }

  const { series, stories } = data;

  return (
    <main className="max-w-[1200px] mx-auto px-6 pt-24 pb-24">
      <header className="mb-10">
        <h1 className="text-4xl font-black font-gothic text-on-surface tracking-tight mb-2">{series.title}</h1>
        <p className="text-on-surface-variant text-sm">{series.description || 'A curated series of narratives.'}</p>
      </header>

      {stories.length === 0 ? (
        <div className="bg-surface-container-low rounded-3xl p-12 text-center text-on-surface-variant uppercase tracking-widest text-xs font-bold border border-outline-variant">
          No published stories in this series yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((story) => (
            <Link key={story._id} href={`/detail?slug=${story.slug?.en || story.slug?.hi || story.slug}`}>
              <div className="gothic-frame p-6 rounded-3xl border border-outline-variant/20 hover:border-primary transition-all">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Part {story.seriesOrder || 1}</div>
                <h3 className="text-2xl font-gothic text-on-surface mb-2">{getText(story.title)}</h3>
                <p className="text-xs text-on-surface-variant line-clamp-3">{getText(story.content)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
