// app/admin/stories/[id]/page.js
"use client";
import React, { useState, useEffect } from 'react';
import adminService from '@/services/adminService';
import Link from 'next/link';

const getText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.hi || '';
};

const CATEGORY_LABELS = {
  'real-horror': 'Real Horror',
  'paranormal': 'Paranormal',
  'haunted-places': 'Haunted Places',
  'urban-legends': 'Urban Legends',
  'general-horror': 'General Horror'
};

export default function StoryPreview({ params }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStory = async () => {
      try {
        const data = await adminService.getStoryById(params.id);
        setStory(data);
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, [params]);

  if (loading || !story) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link href="/admin/stories" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
           </Link>
           <div>
              <h1 className="text-3xl font-black font-gothic text-on-surface tracking-tighter">Content Moderation</h1>
              <p className="text-on-surface-variant font-medium text-xs uppercase tracking-widest mt-1">Reviewing Story ID: #{story._id}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="bg-red-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
              Reject Submission
           </button>
           <button className="bg-green-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
              Approve & Publish
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
        
        {/* Main Content Area */}
        <div className="flex flex-col gap-8">
           <div className="relative aspect-[21/9] w-full rounded-[32px] overflow-hidden border border-outline-variant shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1542106311-bfad4bd2e351?q=80&w=2000&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover brightness-75"
                alt="Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-10">
                 <span className="bg-primary text-on-primary px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{CATEGORY_LABELS[story.category] || story.category}</span>
                 <h2 className="text-4xl md:text-5xl font-black font-gothic text-white drop-shadow-xl">{getText(story.title)}</h2>
              </div>
           </div>

           <div className="bg-surface-container border border-outline-variant rounded-[32px] p-10 md:p-16">
              <div className="prose prose-invert max-w-none text-on-surface-variant font-medium text-lg leading-relaxed">
                 <p className="mb-6">{getText(story.content)}</p>
              </div>
           </div>
        </div>

        {/* Story Metadata Sidebar */}
        <aside className="flex flex-col gap-6">
           <div className="bg-surface-container border border-outline-variant rounded-[32px] p-8">
              <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-6 border-b border-outline-variant pb-4">Metadata Analysis</h3>
              <div className="flex flex-col gap-6">
                 <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Original Author</p>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                          <span className="material-symbols-outlined text-sm">person</span>
                       </div>
                       <div>
                          <p className="text-xs font-bold text-on-surface">@{story.author?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">Level 4 Writer</p>
                       </div>
                    </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Language Protocol</p>
                    <p className="text-xs font-bold text-on-surface uppercase tracking-[0.2em]">{Array.isArray(story.language) ? story.language.join(', ') : story.language}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Content Safety Rating</p>
                    <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">Safe for Archive</span>
                 </div>
                 <div className="h-px bg-outline-variant my-2"></div>
                 <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                    View Complete Revision History
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                 </button>
              </div>
           </div>

           <div className="bg-surface-container-high border border-outline-variant rounded-[32px] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-2xl -translate-y-12 translate-x-12"></div>
              <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4">Moderator Note</h3>
              <textarea 
                className="w-full h-32 bg-surface-container border border-outline-variant rounded-xl p-4 text-xs font-medium text-on-surface-variant focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Add private note for the archive logs..."
              ></textarea>
              <button className="mt-4 w-full bg-surface-container-high border border-outline-variant py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container transition-colors">
                 Save Note
              </button>
           </div>
        </aside>

      </div>
    </div>
  );
}
