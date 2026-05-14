"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import adminService from '@/services/adminService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [storiesData, statsData] = await Promise.all([
          adminService.getAllStories(),
          adminService.getStats()
        ]);
        setStories(storiesData || []);
        setStats(statsData || null);
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateStoryStatus(id, status);
      toast.success(`Story ${status} successfully`);
      setStories(stories.map(s => s._id === id ? { ...s, status: status === 'approved' ? 'approved' : status } : s));
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await adminService.deleteStory(id);
      toast.success('Story deleted');
      setStories(stories.filter(s => s._id !== id));
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Admin Grid...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black pt-24 pb-12 px-6">
        <div className="max-w-[1400px] mx-auto space-y-12">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
            <div>
              <h1 className="text-5xl font-black font-display uppercase tracking-tighter text-white mb-2">Editorial Hub</h1>
              <p className="text-on-surface-variant text-sm font-bold uppercase tracking-[0.4em] opacity-60">Global Story Moderation & Analytics</p>
            </div>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total Stories</p>
                  <p className="text-2xl font-black text-white">{stats.totalStories}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Pending</p>
                  <p className="text-2xl font-black text-white">{stats.pendingStories}</p>
                </div>
              </div>
            )}
          </header>

          <section className="space-y-6">
            <h2 className="text-xl font-black font-display uppercase tracking-widest text-white">Pending Moderation</h2>
            <div className="grid grid-cols-1 gap-4">
              {stories.length > 0 ? (
                stories.map((story) => (
                  <div key={story._id} className="bg-surface-container-low border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                          story.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          story.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {story.status}
                        </span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Author: {story.author?.name}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{typeof story.title === 'string' ? story.title : story.title?.en}</h3>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {story.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(story._id, 'approved')} className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-green-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-green-400 transition-colors">Approve</button>
                          <button onClick={() => handleUpdateStatus(story._id, 'rejected')} className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-red-500/20 text-red-500 border border-red-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">Reject</button>
                        </>
                      )}
                      <button onClick={() => handleDeleteStory(story._id)} className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-white/5 text-white/40 border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-white/20 font-bold uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
                  No stories in moderation queue
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
