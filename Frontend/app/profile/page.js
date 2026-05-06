"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import storyService from '@/services/storyService';
import authService from '@/services/authService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function UserProfile() {
   const { user, isLoggedIn, isSettled, logout, refreshUser } = useAuth();
   const router = useRouter();
   const [stories, setStories] = useState([]);
   const [drafts, setDrafts] = useState([]);
   const [bookmarks, setBookmarks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [authChecked, setAuthChecked] = useState(false);
   const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'profile' | 'security'
   const [isEditing, setIsEditing] = useState(false);
   const [saving, setSaving] = useState(false);

   // Form states
   const [formData, setFormData] = useState({
      name: '',
      dob: '',
      gender: '',
      avatar: ''
   });

   const [uploading, setUploading] = useState(false);
   const fileInputRef = React.useRef(null);



   const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
   });

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
         if (!isSettled) return;
         if (!isLoggedIn) {
            setLoading(false);
            setAuthChecked(true);
            return;
         }

         try {
            const data = await storyService.getMyStories();
            setStories(data || []);
            const draftData = await storyService.getMyDrafts();
            setDrafts(draftData || []);
            const bookmarkData = await storyService.getMyBookmarks();
            setBookmarks(bookmarkData || []);
         } catch (error) {
            console.error('Failed to fetch stories:', error);
         } finally {
            setLoading(false);
            setAuthChecked(true);
         }
      };
      fetchMyStories();
   }, [isLoggedIn, isSettled]);

   useEffect(() => {
      if (user) {
         setFormData({
            name: user.name || '',
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
            gender: user.gender || 'prefer_not_to_say',
            avatar: user.avatar || ''
         });
      }
   }, [user]);

   const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
         return toast.error('Selection Error: File size exceeds the 5MB limit.');
      }

      const uploadData = new FormData();
      uploadData.append('avatar', file);

      setUploading(true);
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api'}/upload/avatar`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: uploadData
         });

         const result = await response.json();
         if (result.success) {
            setFormData({ ...formData, avatar: result.data.url });
            toast.success('Profile picture updated successfully.');
         } else {
            throw new Error(result.message);
         }
      } catch (error) {
         toast.error('Update Failure: Failed to update profile picture.');
      } finally {
         setUploading(false);
      }
   };

   const handleUpdateProfile = async (e) => {
      e.preventDefault();

      // Date Validation
      const birthYear = new Date(formData.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear < 1900 || birthYear > currentYear) {
         return toast.error(`Birth year must be between 1900 and ${currentYear}`);
      }

      setSaving(true);
      try {
         await authService.updateProfile(formData);
         await refreshUser();
         setIsEditing(false);
         toast.success('Profile updated successfully');
      } catch (error) {
         toast.error(error.message || 'Update failed');
      } finally {
         setSaving(false);
      }
   };

   const handlePasswordChange = async (e) => {
      e.preventDefault();
      if (passwordData.newPassword !== passwordData.confirmPassword) {
         return toast.error('Passwords do not match');
      }

      // Strict complexity regex: Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Symbol
      const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!complexityRegex.test(passwordData.newPassword)) {
         return toast.error('Password must be 8+ characters with uppercase, lowercase, number, and symbol');
      }

      setSaving(true);
      try {
         await authService.changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
         });
         toast.success('Security settings updated. Redirecting to login...');
         setTimeout(() => logout(), 2000);
      } catch (error) {
         toast.error(error.message || 'Verification failed');
      } finally {
         setSaving(false);
      }
   };

   return (
      <ProtectedRoute>
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
                           {(isEditing ? formData.avatar : user?.avatar) ? (
                              <img src={isEditing ? formData.avatar : user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                           ) : (
                              <span className="material-symbols-outlined text-6xl font-light">fluid_meditation</span>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Welcome</p>
                        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-on-surface mb-2 uppercase drop-shadow-xl">{user?.name || 'Anonymous Author'}</h1>
                        <p className="text-xs md:text-sm font-medium text-on-surface-variant tracking-wider flex items-center gap-4">
                           <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">alternate_email</span> {user?.email || 'unreachable@archive.org'}</span>
                           <span className="w-1 h-1 rounded-full bg-outline-variant opacity-40"></span>
                           <span className="flex items-center gap-2 uppercase text-[10px] tracking-widest font-black">
                              Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                           </span>
                        </p>
                     </div>
                  </div>

                  {/* Glassmorphic Stats Panel */}
                  <div className="flex items-center gap-4 bg-surface-container-low/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl shadow-black/40">
                     <div className="px-6 text-center border-r border-outline-variant/20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Stories</p>
                        <p className="text-2xl font-black text-on-surface font-display">{stories.length}</p>
                     </div>
                     <div className="px-6 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Total Likes</p>
                        <p className="text-2xl font-black text-primary font-display">
                           {stories.reduce((acc, s) => acc + (s.likesCount || 0), 0)}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
               {/* Sidebar Navigation */}
               <div className="lg:col-span-1 space-y-4">
                  <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10">
                     <nav className="flex flex-col gap-1">
                        <button
                           onClick={() => setActiveTab('stories')}
                           className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'stories' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container'
                              }`}
                        >
                           <span className="material-symbols-outlined text-sm">history_edu</span>
                           My Stories
                        </button>
                        <button
                           onClick={() => setActiveTab('profile')}
                           className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'profile' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container'
                              }`}
                        >
                           <span className="material-symbols-outlined text-sm">settings_account_box</span>
                           Profile Details
                        </button>
                        <button
                           onClick={() => setActiveTab('bookmarks')}
                           className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'bookmarks' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container'
                              }`}
                        >
                           <span className="material-symbols-outlined text-sm">bookmark</span>
                           My Bookmarks
                        </button>
                        <button
                           onClick={() => setActiveTab('security')}
                           className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'security' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container'
                              }`}
                        >
                           <span className="material-symbols-outlined text-sm">security</span>
                           Change Password
                        </button>
                     </nav>
                  </div>

                  <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                           {(isEditing ? formData.avatar : user?.avatar) ? (
                              <img src={isEditing ? formData.avatar : user.avatar} alt={user.name} className="w-full h-full object-cover" />
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
                        Log Out
                     </button>
                  </div>

                  <div className="p-8 rounded-3xl bg-primary-container/10 border border-primary/10 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full -translate-x-8 -translate-y-8 group-hover:bg-primary/30 transition-colors"></div>
                     <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">User Status</h4>
                     <p className="text-xs text-on-surface font-medium leading-relaxed">"Your stories have reached {stories.reduce((acc, s) => acc + (s.views || 0), 0)} readers. Your collection continues to grow."</p>
                  </div>
               </div>

               {/* Main Content Area */}
               <div className="lg:col-span-3 space-y-12">
                  {activeTab === 'stories' && (
                     <>
                        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
                           <div className="flex flex-col">
                              <h2 className="text-2xl font-black font-display uppercase tracking-widest text-on-surface mb-1">My Stories</h2>
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-60">Manage your published stories and drafts</p>
                           </div>
                           <Link href="/submit" className="bg-surface-container-high hover:bg-primary hover:text-on-primary px-6 py-2.5 rounded-xl border border-outline-variant/30 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                              New Story
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
                                          <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${story.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
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
                                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'N/A'}</span>
                                       </div>
                                    </div>

                                    <Link
                                       href={(story.status === 'approved' || story.status === 'pending') ? `/detail/${story.slug?.en || story.slug}` : '#'}
                                       className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${(story.status === 'approved' || story.status === 'pending')
                                          ? 'bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary'
                                          : 'bg-surface-container-lowest text-outline-variant/40 cursor-not-allowed border border-outline-variant/10'
                                          }`}
                                    >
                                       {story.status === 'pending' ? 'View Story' : 'Access Story'}
                                    </Link>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="bg-surface-container-low rounded-[3rem] p-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant/10">
                              <span className="material-symbols-outlined text-6xl text-outline-variant/20 mb-8">ink_pen</span>
                              <h3 className="text-xl font-black font-display uppercase tracking-widest text-on-surface mb-4">No stories found</h3>
                              <p className="text-on-surface-variant text-sm max-w-sm mb-12">You haven't written any stories yet. Your contributions are welcome.</p>
                              <Link href="/submit" className="bg-primary hover:scale-105 transition-transform text-on-primary px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl">
                                 Begin Your First Story
                              </Link>
                           </div>
                        )}

                        {/* Drafts Section */}
                        <div className="mt-12 border-t border-outline-variant/10 pt-8 space-y-6">
                           <div className="flex items-center justify-between">
                              <div>
                                 <h3 className="text-xl font-black font-display uppercase tracking-widest text-on-surface mb-1">Drafts</h3>
                                 <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-60">Private Space for stories waiting for approval</p>
                              </div>
                              <Link href="/submit" className="bg-surface-container-high hover:bg-primary hover:text-on-primary px-6 py-2.5 rounded-xl border border-outline-variant/30 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                                 New Draft
                              </Link>
                           </div>
                           {drafts.length > 0 ? (
                              <div className="grid grid-cols-1 gap-6">
                                 {drafts.map((draft) => (
                                    <div
                                       key={draft._id}
                                       className="group bg-surface-container-low hover:bg-surface-container transition-all duration-500 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-default border border-outline-variant/5 hover:shadow-2xl hover:shadow-black/20"
                                    >
                                       <div className="flex flex-col gap-3">
                                          <div className="flex items-center gap-3">
                                             <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-primary/10 text-primary border-primary/20">
                                                draft
                                             </span>
                                             <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">ID: {draft._id.slice(-8)}</span>
                                          </div>
                                          <h3 className="text-xl md:text-2xl font-black font-display text-on-surface group-hover:text-primary transition-colors tracking-tight">
                                             {typeof draft.title === 'string' ? draft.title : draft.title?.en}
                                          </h3>
                                          <div className="flex items-center gap-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                                             <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                       </div>
                                       <Link
                                          href={`/submit?draftId=${draft._id}`}
                                          className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary"
                                       >
                                          Continue Draft
                                       </Link>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="bg-surface-container-low rounded-[2rem] p-8 text-center text-on-surface-variant text-sm font-bold tracking-[0.2em] uppercase border border-outline-variant/10">
                                 No drafts yet
                              </div>
                           )}
                        </div>
                     </>
                  )}

                  {activeTab === 'bookmarks' && (
                     <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
                           <div>
                              <h2 className="text-2xl font-black font-display uppercase tracking-widest text-on-surface mb-1">My Bookmarks</h2>
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-60">Your collection of saved stories</p>
                           </div>
                        </div>

                        {bookmarks.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {bookmarks.map((story) => (
                                 <Link key={story._id} href={`/detail/${story.slug?.en || story.slug}`} className="gothic-frame p-4 group bg-surface-container-low/60 backdrop-blur-3xl rounded-3xl border border-outline-variant/10 hover:bg-surface-container transition-all duration-300 shadow-xl overflow-hidden flex flex-col h-full">
                                    <h3 className="text-xl font-bold text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">{typeof story.title === 'string' ? story.title : story.title?.en}</h3>
                                    <div className="mt-auto flex items-center justify-between text-[9px] text-on-surface-variant font-bold uppercase tracking-widest border-t border-outline-variant/10 pt-3">
                                       <span className="flex items-center gap-2">{story.views || 0} VIEWS</span>
                                       <button 
                                         onClick={async (e) => {
                                           e.preventDefault();
                                           e.stopPropagation();
                                           await storyService.bookmarkStory(story._id);
                                           setBookmarks(prev => prev.filter(b => b._id !== story._id));
                                           toast.success('Removed from bookmarks');
                                         }}
                                         className="text-primary hover:text-red-500 transition-colors"
                                       >
                                         Remove
                                       </button>
                                    </div>
                                 </Link>
                              ))}
                           </div>
                        ) : (
                           <div className="bg-surface-container-low rounded-[3rem] p-16 text-center text-on-surface-variant text-sm font-bold tracking-[0.2em] uppercase border border-outline-variant/10">
                              No bookmarks yet
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'profile' && (
                     <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
                           <div>
                              <h2 className="text-2xl font-black font-display uppercase tracking-widest text-on-surface mb-1">Profile Details</h2>
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-60">Manage your account information</p>
                           </div>
                           {!isEditing && (
                              <button
                                 onClick={() => setIsEditing(true)}
                                 className="flex items-center gap-3 px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl border border-primary/20 text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                 <span className="material-symbols-outlined text-sm">edit_note</span>
                                 Edit Profile
                              </button>
                           )}
                        </div>

                        {isEditing ? (
                           <form onSubmit={handleUpdateProfile} className="space-y-12">
                              <div className="space-y-6 mb-10">
                                 <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                                    <label className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Profile Picture</label>
                                    <button
                                       type="button"
                                       onClick={() => fileInputRef.current?.click()}
                                       disabled={uploading}
                                       className="flex items-center gap-2 text-primary hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"
                                    >
                                       <span className="material-symbols-outlined text-[14px]">{uploading ? 'sync' : 'add_photo_alternate'}</span>
                                       {uploading ? 'Uploading...' : 'Upload New Portrait'}
                                    </button>
                                    <input
                                       type="file"
                                       ref={fileInputRef}
                                       onChange={handleFileUpload}
                                       className="hidden"
                                       accept="image/*"
                                    />
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">User Name</label>
                                    <input
                                       type="text"
                                       value={formData.name}
                                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                       className="w-full p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:opacity-30"
                                       placeholder="Enter your name"
                                       required
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">User Email (Permanent)</label>
                                    <div className="p-6 bg-surface-container-low/40 border border-outline-variant/5 rounded-2xl text-on-surface/40 font-black text-xs lowercase tracking-wider cursor-not-allowed">
                                       {user?.email}
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Birth Date (DOB)</label>
                                    <input
                                       type="date"
                                       min="1900-01-01"
                                       max={new Date().toISOString().split('T')[0]}
                                       value={formData.dob}
                                       onChange={(e) => {
                                          const dateVal = e.target.value;
                                          const year = dateVal.split('-')[0];
                                          if (year.length > 4) {
                                             const truncated = year.slice(0, 4) + '-' + dateVal.split('-').slice(1).join('-');
                                             setFormData({ ...formData, dob: truncated });
                                          } else {
                                             setFormData({ ...formData, dob: dateVal });
                                          }
                                       }}
                                       className="w-full p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest focus:border-primary outline-none transition-all"
                                       required
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Gender </label>
                                    <select
                                       value={formData.gender}
                                       onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                       className="w-full p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest focus:border-primary outline-none transition-all"
                                       required
                                    >
                                       <option value="male">Male</option>
                                       <option value="female">Female</option>
                                       <option value="other">Other</option>
                                       <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                 </div>
                              </div>

                              <div className="flex items-center gap-4 py-4">
                                 <button
                                    type="submit"
                                    disabled={saving}
                                    className={`flex-1 md:flex-none px-10 py-5 bg-primary text-on-primary rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${saving ? 'opacity-50' : 'hover:scale-[1.02]'}`}
                                 >
                                    {saving ? (
                                       <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                       <span className="material-symbols-outlined text-sm">security_update_good</span>
                                    )}
                                    Update Profile
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => {
                                       setIsEditing(false);
                                       setFormData({
                                          name: user?.name || '',
                                          dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                                          gender: user?.gender || 'prefer_not_to_say'
                                       });
                                    }}
                                    className="flex-1 md:flex-none px-10 py-5 bg-surface-container-high text-on-surface rounded-full font-black text-[10px] uppercase tracking-widest transition-all hover:bg-surface-container"
                                 >
                                    Discard Changes
                                 </button>
                              </div>
                           </form>
                        ) : (
                           <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">User Name</label>
                                    <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest">
                                       {user?.name}
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">User Email</label>
                                    <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface font-black text-xs lowercase tracking-wider">
                                       {user?.email}
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Birth Date (DOB)</label>
                                    <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest">
                                       {user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not Specified'}
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Gender</label>
                                    <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest">
                                       {user?.gender?.replace(/_/g, ' ') || 'Prefer not to say'}
                                    </div>
                                 </div>
                              </div>

                              <div className="flex flex-col md:flex-row items-center gap-8 py-8 border-t border-outline-variant/10">
                                 <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full md:w-auto px-10 py-5 bg-primary text-on-primary rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                                 >
                                    <span className="material-symbols-outlined text-sm">edit_note</span>
                                    Edit Profile
                                 </button>
                              </div>
                           </>
                        )}
                     </div>
                  )}

                  {activeTab === 'security' && (
                     <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="border-b border-outline-variant/10 pb-6">
                           <h2 className="text-2xl font-black font-display uppercase tracking-widest text-on-surface mb-1">Security</h2>
                           <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-60">Change Password</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <div className="lg:col-span-2 space-y-8">
                              <div className="p-10 bg-surface-container-low border border-outline-variant/10 rounded-[2.5rem] space-y-8">
                                 <div className="flex items-center gap-4 border-b border-outline-variant/5 pb-6">
                                    <span className="material-symbols-outlined text-primary">security</span>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">Change Password</h3>
                                 </div>

                                 <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="space-y-2">
                                       <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Current Password</label>
                                       <input
                                          type="password"
                                          value={passwordData.currentPassword}
                                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                          className="w-full p-5 bg-surface border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs tracking-widest focus:border-primary outline-none transition-all placeholder:opacity-20"
                                          placeholder="••••••••"
                                          required
                                       />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div className="space-y-2">
                                          <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">New Password</label>
                                          <input
                                             type="password"
                                             value={passwordData.newPassword}
                                             onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                             className="w-full p-5 bg-surface border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs tracking-widest focus:border-primary outline-none transition-all placeholder:opacity-20"
                                             placeholder="••••••••"
                                             required
                                          />
                                       </div>
                                       <div className="space-y-2">
                                          <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Confirm Password</label>
                                          <input
                                             type="password"
                                             value={passwordData.confirmPassword}
                                             onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                             className="w-full p-5 bg-surface border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs tracking-widest focus:border-primary outline-none transition-all placeholder:opacity-20"
                                             placeholder="••••••••"
                                             required
                                          />
                                       </div>
                                    </div>

                                    <div className="pt-4">
                                       <button
                                          type="submit"
                                          disabled={saving}
                                          className={`w-full py-5 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${saving ? 'opacity-50' : 'hover:bg-primary/90'}`}
                                       >
                                          {saving ? (
                                             <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                                          ) : (
                                             <span className="material-symbols-outlined text-sm">shield_lock</span>
                                          )}
                                          Change Password
                                       </button>
                                    </div>
                                 </form>
                              </div>

                              <div className="p-8 bg-primary/5 border border-primary/10 rounded-3xl flex items-start gap-4">
                                 <span className="material-symbols-outlined text-primary text-xl mt-1">info</span>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface">Password Reset Notice</p>
                                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-70">"Resetting your password will automatically terminate all other active sessions globally. You will need to re-authenticate on all devices."</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </main>
      </ProtectedRoute>
   );
}
