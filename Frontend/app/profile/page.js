"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import storyService from '@/services/storyService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  useEffect(() => {
    const fetchMyStories = async () => {
      if (!isLoggedIn) return;
      try {
        const data = await storyService.getMyStories();
        setStories(data || []);
      } catch (error) {
        console.error('Failed to fetch stories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyStories();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
     return (
        <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
           <span className="material-symbols-outlined text-6xl text-outline-variant mb-6">lock_person</span>
           <h2 className="text-2xl font-black font-display uppercase tracking-widest text-on-surface mb-4">Registry Required</h2>
           <p className="text-on-surface-variant max-w-md mb-8 italic">Access to personal archives is restricted to registered curators. Please login to view your narrative portfolio.</p>
           <Link href="/login" className="bg-primary text-on-primary px-8 py-3 rounded-full font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl">
              Identify Yourself
           </Link>
        </main>
     );
  }

  return (
    <main className="min-h-screen bg-surface selection:bg-primary/20 transition-all duration-700">
      {/* Cinematic Hero Section */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        {/* Deep Tonal Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-container/20 to-surface"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#131313_100%)] opacity-80"></div>
        
        {/* Floating Profile Context */}
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 pb-12 flex flex-col md:flex-row items-end justify-between gap-8 max-w-[1440px] mx-auto left-1/2 -translate-x-1/2">
           <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              {/* Ghost Border Avatar */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-tertiary rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-primary overflow-hidden shadow-2xl">
                   {user?.avatar ? (
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="material-symbols-outlined text-6xl font-light">fluid_meditation</span>
                   )}
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Authenticated Curator</p>
                 <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-on-surface mb-2 uppercase drop-shadow-xl">{user?.name}</h1>
                 <p className="text-xs md:text-sm font-medium text-on-surface-variant tracking-wider flex items-center gap-4">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">alternate_email</span> {user?.email}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant opacity-40"></span>
                    <span className="flex items-center gap-2 italic uppercase text-[10px] tracking-widest font-black">Member since {new Date(user?.createdAt).getFullYear()}</span>
                 </p>
              </div>
           </div>

           {/* Glassmorphic Stats Panel */}
           <div className="flex items-center gap-4 bg-surface-container-low/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl shadow-black/40">
              <div className="px-6 text-center border-r border-outline-variant/20">
                 <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Narratives</p>
                 <p className="text-2xl font-black text-on-surface font-display">{stories.length}</p>
              </div>
              <div className="px-6 text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Accolades</p>
                 <p className="text-2xl font-black text-primary font-display">
                    {stories.reduce((acc, s) => acc + (s.likesCount || 0), 0)}
                 </p>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
         {/* Sidebar Navigation (Tonal, No-Line Policy) */}
         <div className="lg:col-span-1 space-y-4">
            <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10">
               <nav className="flex flex-col gap-1">
                  <button className="flex items-center gap-4 px-5 py-4 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all">
                     <span className="material-symbols-outlined text-sm">history_edu</span>
                     Personal Archive
                  </button>
                  <button className="flex items-center gap-4 px-5 py-4 text-on-surface-variant hover:bg-surface-container rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                     <span className="material-symbols-outlined text-sm">settings_account_box</span>
                     Registry Details
                  </button>
                  <button className="flex items-center gap-4 px-5 py-4 text-on-surface-variant hover:bg-surface-container rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                     <span className="material-symbols-outlined text-sm">security</span>
                     Integrity Panel
                  </button>
               </nav>
            </div>

            <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                     {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                     ) : (
                        <span className="material-symbols-outlined text-sm">person</span>
                     )}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-on-surface uppercase tracking-widest truncate max-w-[120px]">{user?.name}</span>
                     <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 truncate max-w-[120px]">{user?.email}</span>
                  </div>
               </div>
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 text-primary bg-primary/5 hover:bg-primary/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-primary/10"
               >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Terminate Session
               </button>
            </div>

            <div className="p-8 rounded-3xl bg-primary-container/10 border border-primary/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full -translate-x-8 -translate-y-8 group-hover:bg-primary/30 transition-colors"></div>
               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Curator Status</h4>
               <p className="text-xs text-on-surface font-medium leading-relaxed italic">"Your narratives have reached {stories.reduce((acc, s) => acc + (s.views || 0), 0)} souls. The archive continues to grow."</p>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="lg:col-span-3 space-y-12">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
               <div className="flex flex-col">
                  <h2 className="text-2xl font-black font-display uppercase tracking-widest text-on-surface mb-1">Narrative Collection</h2>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-60">Chronological history of curated works</p>
               </div>
               <Link href="/submit" className="bg-surface-container-high hover:bg-primary hover:text-on-primary px-6 py-2.5 rounded-xl border border-outline-variant/30 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                  New Narrative
               </Link>
            </div>

            {loading ? (
               <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-surface-container-low rounded-3xl animate-pulse opacity-40"></div>
                  ))}
               </div>
            ) : stories.length > 0 ? (
               <div className="grid grid-cols-1 gap-6">
                  {stories.map((story) => (
                    <div 
                      key={story._id}
                      className="group bg-surface-container-low hover:bg-surface-container transition-all duration-500 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-default border border-outline-variant/5 hover:shadow-2xl hover:shadow-black/20"
                    >
                      <div className="flex flex-col gap-3">
                         <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                               story.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                               story.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                               'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                               {story.status}
                            </span>
                            <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">ID: {story._id.slice(-8)}</span>
                         </div>
                         <h3 className="text-xl md:text-2xl font-black font-display text-on-surface group-hover:text-primary transition-colors tracking-tight">
                            {typeof story.title === 'string' ? story.title : story.title?.en}
                         </h3>
                         <div className="flex items-center gap-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">visibility</span> {story.views || 0}</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">favorite</span> {story.likesCount || 0}</span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {new Date(story.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                      
                      <Link 
                        href={story.status === 'approved' ? `/detail/${story.slug?.en || story.slug}` : '#'}
                        className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          story.status === 'approved'
                            ? 'bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary'
                            : 'bg-surface-container-lowest text-outline-variant/40 cursor-not-allowed border border-outline-variant/10'
                        }`}
                      >
                         Access Story
                      </Link>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="bg-surface-container-low rounded-[3rem] p-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant/10">
                  <span className="material-symbols-outlined text-6xl text-outline-variant/20 mb-8">ink_pen</span>
                  <h3 className="text-xl font-black font-display uppercase tracking-widest text-on-surface mb-4">Archive Empty</h3>
                  <p className="text-on-surface-variant text-sm max-w-sm mb-12 italic">You haven't curated any narratives yet. Your contribution to the archive is vital.</p>
                  <Link href="/submit" className="bg-primary hover:scale-105 transition-transform text-on-primary px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl">
                     Begin Your First Narrative
                  </Link>
               </div>
            )}
         </div>
      </div>
    </main>
  );
}
