// app/admin/comments/page.js
"use client";
import React, { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import adminService from '@/services/adminService';

const MOCK_COMMENTS = [
  { _id: 'c1', storyTitle: "The Whispering Pines", user: "jules_v", content: "This gave me literal chills. The ending was unexpected.", status: "Approved", createdAt: '2024-03-22T09:00:00Z' },
  { _id: 'c2', storyTitle: "The Mirror's Edge", user: "ghost_facer", content: "I've seen better, but the atmosphere is decent.", status: "Pending", createdAt: '2024-03-23T10:30:00Z' },
  { _id: 'c3', storyTitle: "Pressure Below 9,000m", user: "troll_master", content: "This is just a ripoff of that other story. Boring!!", status: "Flagged", createdAt: '2024-03-24T14:45:00Z' },
];

export default function CommentModeration() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating loading
    setTimeout(() => {
      setComments(MOCK_COMMENTS);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black font-gothic text-on-surface tracking-tighter mb-2">Community Echo</h1>
        <p className="text-on-surface-variant font-medium text-sm">Review community feedback and moderate narrative discourse.</p>
      </header>

      <Table 
        headers={['Narrative', 'Curator', 'Content', 'Status', 'Actions']}
        data={comments}
        loading={loading}
        renderRow={(comment) => (
          <>
            <td className="px-6 py-5">
               <span className="text-sm font-bold text-on-surface">{comment.storyTitle}</span>
            </td>
            <td className="px-6 py-5">
               <span className="text-xs font-medium text-primary">@{comment.user}</span>
            </td>
            <td className="px-6 py-5 max-w-xs">
               <p className="text-xs text-on-surface-variant line-clamp-2 italic">{comment.content}</p>
            </td>
            <td className="px-6 py-5">
               <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                 comment.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                 comment.status === 'Pending' ? 'bg-primary/10 text-primary border-primary/20' : 
                 'bg-red-500/10 text-red-500 border-red-500/20'
               }`}>
                  {comment.status}
               </span>
            </td>
            <td className="px-6 py-5 text-right">
               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </button>
                  <button className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
               </div>
            </td>
          </>
        )}
      />
    </div>
  );
}
