"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import storyService from '@/services/storyService';
import authService from '@/services/authService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { user, isLoggedIn, isSettled, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('archive'); // 'archive' | 'registry' | 'integrity'
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

  const avatarPresets = [
    { name: 'Acheron', url: '/assets/avatars/acheron.jpg' },
    { name: 'Lyra', url: '/assets/avatars/lyra.jpg' },
    { name: 'Kaelen', url: '/assets/avatars/kaelen.jpg' }, // Existing or to be created
    { name: 'Nyx', url: '/assets/avatars/nyx.jpg' },
    { name: 'Vesper', url: '/assets/avatars/vesper.jpg' },
    { name: 'Oriole', url: '/assets/avatars/oriole.jpg' }
  ];

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
      return toast.error('Selection Error: File size exceeds the 5MB archival limit.');
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    setUploading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: uploadData
      });

      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, avatar: result.data.url });
        toast.success('Portrait synchronized with the archival stream.');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error('Ingestion Failure: Failed to synchronize personal portrait.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Archival Era Validation
    const birthYear = new Date(formData.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (birthYear < 1900 || birthYear > currentYear) {
      return toast.error(`Birth sequence must be between 1900 and ${currentYear}`);
    }

    setSaving(true);
    try {
      await authService.updateProfile(formData);
      await refreshUser();
      setIsEditing(false);
      toast.success('Identity registry updated successfully');
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
      toast.success('Security protocols upgraded. Redirecting to login...');
      setTimeout(() => logout(), 2000);
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isSettled || (loading && !authChecked)) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
                   {user?.avatar && user.avatar !== 'default-avatar.png' ? (
                     <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="material-symbols-outlined text-6xl font-light">fluid_meditation</span>
                   )}
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Authenticated Curator</p>
                 <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-on-surface mb-2 uppercase drop-shadow-xl">{user?.name || 'Anonymous Curator'}</h1>
                 <p className="text-xs md:text-sm font-medium text-on-surface-variant tracking-wider flex items-center gap-4">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">alternate_email</span> {user?.email || 'unreachable@archive.org'}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant opacity-40"></span>
                    <span className="flex items-center gap-2 italic uppercase text-[10px] tracking-widest font-black">
                       Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'Ancient Era'}
                    </span>
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
                  <button 
                    onClick={() => setActiveTab('archive')}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                      activeTab === 'archive' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                     <span className="material-symbols-outlined text-sm">history_edu</span>
                     Personal Archive
                  </button>
                  <button 
                    onClick={() => setActiveTab('registry')}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                      activeTab === 'registry' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                     <span className="material-symbols-outlined text-sm">settings_account_box</span>
                     Registry Details
                  </button>
                  <button 
                    onClick={() => setActiveTab('integrity')}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                      activeTab === 'integrity' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
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

         {/* Main Content Area map map map */}
         <div className="lg:col-span-3 space-y-12">
            {activeTab === 'archive' && (
              <>
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
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'N/A'}</span>
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
              </>
            )}

            {activeTab === 'registry' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
                   <div>
                      <h2 className="text-2xl font-black font-display uppercase tracking-widest text-on-surface mb-1">Registry Details</h2>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-60">Personal identification within the archival matrix</p>
                   </div>
                   {!isEditing && (
                      <button 
                         onClick={() => setIsEditing(true)}
                         className="flex items-center gap-3 px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl border border-primary/20 text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                         <span className="material-symbols-outlined text-sm">edit_note</span>
                         Modify Identity
                      </button>
                   )}
                </div>

                {isEditing ? (
                   <form onSubmit={handleUpdateProfile} className="space-y-12">
                      {/* Persona Selection Portal */}
                      <div className="space-y-6 mb-10">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Select Curator Persona</label>
                            <button 
                               type="button"
                               onClick={() => fileInputRef.current?.click()}
                               disabled={uploading}
                               className="flex items-center gap-2 text-primary hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5"
                            >
                               <span className="material-symbols-outlined text-[14px]">{uploading ? 'sync' : 'add_photo_alternate'}</span>
                               {uploading ? 'Ingesting...' : 'Upload Custom Portrait'}
                            </button>
                            <input 
                               type="file" 
                               ref={fileInputRef} 
                               onChange={handleFileUpload} 
                               className="hidden" 
                               accept="image/*" 
                            />
                         </div>
                         
                         <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {avatarPresets.map((preset) => (
                               <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setFormData({...formData, avatar: preset.url})}
                                  className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                                     formData.avatar === preset.url 
                                        ? 'border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-[1.05]' 
                                        : 'border-outline-variant/10 hover:border-primary/40'
                                  }`}
                               >
                                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                                  {formData.avatar === preset.url && (
                                     <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-on-primary text-xl font-black drop-shadow-lg">check_circle</span>
                                     </div>
                                  )}
                                  <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-md py-1 text-[7px] font-black uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     {preset.name}
                                  </div>
                               </button>
                            ))}
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Curator Name</label>
                            <input 
                               type="text"
                               value={formData.name}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                               className="w-full p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:opacity-30"
                               placeholder="Enter your name"
                               required
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Archival Email (Permanent)</label>
                            <div className="p-6 bg-surface-container-low/40 border border-outline-variant/5 rounded-2xl text-on-surface/40 font-black text-xs lowercase tracking-wider cursor-not-allowed">
                               {user?.email}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Birth Sequence (DOB)</label>
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
                                     setFormData({...formData, dob: truncated});
                                  } else {
                                     setFormData({...formData, dob: dateVal});
                                  }
                               }}
                               className="w-full p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest focus:border-primary outline-none transition-all"
                               required
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Gender Vector</label>
                            <select 
                               value={formData.gender}
                               onChange={(e) => setFormData({...formData, gender: e.target.value})}
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
                            Save Registry
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
                            Discard
                         </button>
                      </div>
                   </form>
                ) : (
                   <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Curator Name</label>
                            <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest">
                               {user?.name}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Archival Email</label>
                            <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface font-black text-xs lowercase tracking-wider">
                               {user?.email}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Birth Sequence (DOB)</label>
                            <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest">
                               {user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not Specified'}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Gender Vector</label>
                            <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface font-black text-xs uppercase tracking-widest">
                               {user?.gender?.replace(/_/g, ' ') || 'Prefer not to say'}
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-8 py-8 border-t border-outline-variant/10">
                         <div className="flex-1 space-y-2">
                            <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">"Identities are the keys to the archive. Ensure your personal details remain synchronized with the central registry to maintain access integrity."</p>
                         </div>
                         <button 
                            onClick={() => setIsEditing(true)}
                            className="w-full md:w-auto px-10 py-5 bg-primary text-on-primary rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                         >
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            Edit Identity Registry
                         </button>
                      </div>
                   </>
                )}
              </div>
            )}

            {activeTab === 'integrity' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="border-b border-outline-variant/10 pb-6">
                   <h2 className="text-2xl font-black font-display uppercase tracking-widest text-on-surface mb-1">Integrity Panel</h2>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-60">Security protocols and session governance</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                      <div className="p-10 bg-surface-container-low border border-outline-variant/10 rounded-[2.5rem] space-y-8">
                         <div className="flex items-center gap-4 border-b border-outline-variant/5 pb-6">
                            <span className="material-symbols-outlined text-primary">security</span>
                            <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">Credential Rotation</h3>
                         </div>

                         <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Current Archival Key</label>
                               <input 
                                  type="password"
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                  className="w-full p-5 bg-surface border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs tracking-widest focus:border-primary outline-none transition-all placeholder:opacity-20"
                                  placeholder="••••••••"
                                  required
                               />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">New Security Vector</label>
                                  <input 
                                     type="password"
                                     value={passwordData.newPassword}
                                     onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                     className="w-full p-5 bg-surface border border-outline-variant/20 rounded-2xl text-on-surface font-black text-xs tracking-widest focus:border-primary outline-none transition-all placeholder:opacity-20"
                                     placeholder="••••••••"
                                     required
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Confirm Vector</label>
                                  <input 
                                     type="password"
                                     value={passwordData.confirmPassword}
                                     onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
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
                                  Rotate Credentials
                               </button>
                            </div>
                         </form>
                      </div>

                      <div className="p-8 bg-primary/5 border border-primary/10 rounded-3xl flex items-start gap-4">
                         <span className="material-symbols-outlined text-primary text-xl mt-1">info</span>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface">Security Protocol Notice</p>
                            <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic opacity-70">"Rotating your archival key will automatically terminate all other active sessions globally. You will need to re-authenticate on all devices."</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] space-y-4">
                         <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Compliance Status</label>
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Complexity</span>
                               <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded">High</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">MFA Override</span>
                               <span className="text-[9px] font-black text-on-surface-variant uppercase bg-surface-container-high px-2 py-1 rounded">Locked</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Archival Risk</span>
                               <span className="text-[9px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-1 rounded">Nil</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] space-y-4">
                         <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Session Health</label>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin-slow flex items-center justify-center">
                               <span className="text-[8px] font-black text-primary">100%</span>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase text-on-surface">Optimal</p>
                               <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">No anomalies detected</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] space-y-2">
                      <label className="text-[8px] font-black uppercase text-primary tracking-[0.2em] opacity-60">Login Frequency</label>
                      <p className="text-xl font-black text-on-surface uppercase tracking-widest">Standard</p>
                   </div>
                   <div className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] space-y-2">
                      <label className="text-[8px] font-black uppercase text-primary tracking-[0.2em] opacity-60">Identity Risk</label>
                      <p className="text-xl font-black text-on-surface uppercase tracking-widest">Undetected</p>
                   </div>
                   <div className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] space-y-2">
                      <label className="text-[8px] font-black uppercase text-primary tracking-[0.2em] opacity-60">Archive Access</label>
                      <p className="text-xl font-black text-primary uppercase tracking-widest">Verified</p>
                   </div>
                </div>
              </div>
            )}
         </div>
      </div>
    </main>
  );
}
