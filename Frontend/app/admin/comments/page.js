// app/admin/comments/page.js
"use client";
import React, { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import { commentService } from '@/services/userService';
import toast from 'react-hot-toast';

export default function CommentModeration() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await commentService.getComments();
        setComments(data || []);
      } catch (error) {
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, []);

  const pendingComments = comments.filter((c) => c.status === 'pending');
  const filteredComments = comments.filter((c) => statusFilter === 'all' || c.status === statusFilter);

  const handleBulkApprove = async () => {
    try {
      await commentService.bulkApprove(pendingComments.map((c) => c._id));
      setComments((prev) => prev.map((c) => (c.status === 'pending' ? { ...c, status: 'approved' } : c)));
      toast.success('All pending comments approved');
    } catch (error) {
      toast.error('Bulk approval failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      const updated = await commentService.approveComment(id);
      setComments((prev) => prev.map((c) => (c._id === id ? updated : c)));
      toast.success('Comment approved');
    } catch (error) {
      toast.error('Failed to approve comment');
    }
  };

  const handleReject = async (id) => {
    try {
      const updated = await commentService.rejectComment(id);
      setComments((prev) => prev.map((c) => (c._id === id ? updated : c)));
      toast.success('Comment rejected');
    } catch (error) {
      toast.error('Failed to reject comment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await commentService.deleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black font-gothic text-on-surface tracking-tighter mb-2">Community Echo</h1>
        <p className="text-on-surface-variant font-medium text-sm">Review community feedback and moderate narrative discourse.</p>
      </header>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                statusFilter === s
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:text-on-surface'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={handleBulkApprove}
          disabled={pendingComments.length === 0}
          className="px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all disabled:opacity-40"
        >
          Approve All Pending ({pendingComments.length})
        </button>
      </div>

      <Table 
        headers={['Narrative', 'Curator', 'Content', 'Status', 'Actions']}
        data={filteredComments}
        loading={loading}
        renderRow={(comment) => (
          <>
            <td className="px-6 py-4 align-middle">
               <span className="text-sm font-bold text-on-surface">{comment.storyId?.title?.en || comment.storyId?.title || 'Unknown Story'}</span>
            </td>
            <td className="px-6 py-4 align-middle">
               <span className="text-xs font-medium text-primary">@{comment.userId?.name || 'Unknown'}</span>
            </td>
            <td className="px-6 py-4 align-middle max-w-xs">
               <p className="text-xs text-on-surface-variant line-clamp-2 italic">{comment.content}</p>
            </td>
            <td className="px-6 py-4 align-middle">
               <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                 comment.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                 comment.status === 'pending' ? 'bg-primary/10 text-primary border-primary/20' : 
                 'bg-red-500/10 text-red-500 border-red-500/20'
               }`}>
                  {comment.status || 'pending'}
               </span>
            </td>
            <td className="px-6 py-4 align-middle text-right">
               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleApprove(comment._id)}
                    className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                    title="Approve"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                  </button>
                  <button
                    onClick={() => handleReject(comment._id)}
                    className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                    title="Reject"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(comment._id)}
                    className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Delete"
                  >
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
