"use client";
import React, { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import storyService from '@/services/storyService';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/utils/api';

export default function StoriesModeration() {
  const [activeTab, setActiveTab] = useState('Pending');
  
  // Resolve archival media URI map
  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const origin = API_BASE_URL.replace('/api', '');
    return `${origin}${path}`;
  };

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [editData, setEditData] = useState({ title: '', content: '', category: '', images: [] });
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'delete' | 'review'
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const data = await storyService.getStories(activeTab);
      setStories(data || []);
    } catch (error) {
      toast.error('Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [activeTab]);

  const handleAIReview = async () => {
    if (!editData.content) return;
    setIsAiAnalyzing(true);
    try {
      const res = await api.post('/stories/analyze', { content: editData.content, lang: 'en' });
      const suggestions = res.data.data;
      setEditData({
        title: suggestions.suggestedTitle.en,
        content: suggestions.enhancedContent.en,
        category: suggestions.suggestedCategory || editData.category
      });
      toast.success('AI Oracle has enhanced the narrative.');
    } catch (err) {
      toast.error('AI Oracle is silent. Check system frequency.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleAction = async () => {
    if (!selectedStory || !actionType) return;
    
    try {
      if (actionType === 'review') {
        await storyService.updateStory(selectedStory._id, { 
          title: editData.title,
          content: editData.content, 
          category: editData.category,
          images: editData.images, // Synchronize the visual atmosphere map map map
          status: 'approved' 
        });
        toast.success('Narrative synchronized and published.');
      } else if (actionType === 'approve') {
        await storyService.approveStory(selectedStory._id);
        toast.success('Story approved and published');
      } else if (actionType === 'reject') {
        await storyService.rejectStory(selectedStory._id);
        toast.success('Story rejected');
      } else if (actionType === 'delete') {
        await storyService.deleteStory(selectedStory._id);
        toast.success('Story deleted');
      }
      fetchStories(); // Refresh list
    } catch (error) {
      toast.error(`Action failed: ${error.response?.data?.message || 'Unknown error'}`);
    } finally {
      setSelectedStory(null);
      setActionType(null);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-end text-white">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-black font-gothic tracking-[0.2em] uppercase pt-12 pb-2 leading-relaxed">Narrative Curation</h1>
          <div className="flex items-center justify-between gap-8">
             <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-on-surface-variant/40">Gatekeeper Protocol & Review Queue</p>
             <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 px-6 py-2.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                   {stories.length} Narratives in {activeTab} Vector
                </span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
           {['Pending', 'Approved', 'Rejected'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group
                 ${activeTab === tab 
                   ? 'bg-primary text-white shadow-[0_0_20px_rgba(163,29,29,0.3)]' 
                   : 'bg-surface-bright/5 text-on-surface-variant/40 hover:text-white hover:bg-surface-bright/10 border border-white/5'
                 }`}
             >
               {tab} Queue
             </button>
           ))}
        </div>

        <div className="bg-black/20 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <Table 
            headers={['#', 'Narrative', 'Author', 'Category', 'Timestamp', 'Actions']}
            loading={loading}
            data={stories}
            renderRow={(story, i) => (
              <>
                <td className="py-6 pl-8 text-[11px] font-black text-on-surface-variant/40 font-mono">
                   {String(i + 1).padStart(2, '0')}
                </td>
                <td className="py-6 px-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-white group-hover:text-primary transition-colors">{story.title?.en || story.title}</span>
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter opacity-40">ID: {story._id.slice(-8)}</span>
                   </div>
                </td>
                <td className="py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{story.author?.name || 'Anonymous'}</td>
                <td className="py-6 text-white text-xs">
                   <span className="bg-white/5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#9ca3af] border border-white/5">
                      {story.category || 'General'}
                   </span>
                </td>
                <td className="py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
                   {new Date(story.createdAt).toLocaleDateString()}
                </td>
                <td className="py-6 pr-8">
                   <div className="flex items-center gap-3">
                      {activeTab === 'Pending' && (
                        <>
                          <button 
                            onClick={() => { 
                              setSelectedStory(story); 
                              setEditData({ 
                                title: story.title?.en || story.title, 
                                content: story.content?.en || story.content, 
                                category: story.category,
                                images: story.images || []
                              });
                              setActionType('review'); 
                            }}
                            className="w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-primary/20 group/btn"
                          >
                             <span className="material-symbols-outlined text-sm group-hover/btn:scale-110">visibility</span>
                          </button>
                          <button 
                            onClick={() => { setSelectedStory(story); setActionType('approve'); }}
                            className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center border border-green-500/20 group/btn"
                          >
                             <span className="material-symbols-outlined text-sm group-hover/btn:scale-110">done</span>
                          </button>
                          <button 
                            onClick={() => { setSelectedStory(story); setActionType('reject'); }}
                            className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center border border-amber-500/20 group/btn"
                          >
                             <span className="material-symbols-outlined text-sm group-hover/btn:scale-110">close</span>
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => { setSelectedStory(story); setActionType('delete'); }}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20 group/btn"
                      >
                         <span className="material-symbols-outlined text-sm group-hover/btn:scale-110">delete</span>
                      </button>
                   </div>
                </td>
              </>
            )}
          />
        </div>
      </div>

      {selectedStory && (
        <Modal 
          isOpen={!!selectedStory} 
          onClose={() => { setSelectedStory(null); setActionType(null); }}
          title={actionType === 'review' ? 'Administrative Narrative Workspace' : `Confirm ${actionType}`}
          onConfirm={handleAction}
          confirmText={actionType === 'review' ? 'Update & Approve' : `Confirm ${actionType}`}
          maxWidth={actionType === 'review' ? 'max-w-none' : 'max-w-md'}
          fullPage={actionType === 'review'}
        >
          {actionType === 'review' ? (
            <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   <div className="space-y-3">
                     <label className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">Narrative Title</label>
                     <input 
                       type="text" 
                       value={editData.title}
                       onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-lg text-white focus:border-primary focus:outline-none transition-all placeholder:text-white/20"
                       placeholder="Enter atmospheric title..."
                     />
                   </div>
                   <div className="space-y-3">
                     <label className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">Archival Category</label>
                     <select 
                       value={editData.category}
                       onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                       className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-8 py-5 text-sm text-white focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                     >
                        <option value="Real Horror">Real Horror</option>
                        <option value="Paranormal">Paranormal</option>
                        <option value="Haunted Places">Haunted Places</option>
                        <option value="Urban Legends">Urban Legends</option>
                        <option value="General Horror">General Horror</option>
                     </select>
                   </div>
                   <div className="flex flex-col justify-end">
                      <button 
                        onClick={handleAIReview}
                        disabled={isAiAnalyzing}
                        className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-black uppercase tracking-[0.3em] border border-primary/20 group/ai"
                      >
                         <span className={`material-symbols-outlined text-sm ${isAiAnalyzing ? 'animate-spin' : ''}`}>
                           {isAiAnalyzing ? 'sync' : 'auto_fix'}
                         </span>
                         {isAiAnalyzing ? 'Synthesizing Narrative...' : 'Invoke AI Oracle Assist'}
                      </button>
                   </div>
                </div>

                {/* Triple Asset Management Grid map map map */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">Visual Atmosphere (3 Slots Max)</label>
                      <span className="text-[9px] font-bold uppercase text-on-surface-variant/40 tracking-widest">Archival Media Registry</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[0, 1, 2].map((idx) => {
                        const img = editData.images?.[idx];
                        return (
                          <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-white/5 group ring-1 ring-white/5 hover:ring-primary/20 transition-all">
                             {img ? (
                               <>
                                 <img 
                                   src={resolveImageUrl(img)} 
                                   alt={`Atmos Slot ${idx + 1}`} 
                                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                 <button 
                                   onClick={() => {
                                     const newImages = [...editData.images];
                                     newImages.splice(idx, 1);
                                     setEditData({ ...editData, images: newImages });
                                   }}
                                   className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-xl"
                                 >
                                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                                 </button>
                                 <div className="absolute bottom-6 left-8 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-sm">Slot 0{idx + 1} Calibrated</span>
                                 </div>
                               </>
                             ) : (
                               <label className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all group/upload">
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      const uploadData = new FormData();
                                      uploadData.append('image', file);
                                      try {
                                        toast.loading(`Fielding Asset 0${idx + 1}...`, { id: `upload-${idx}` });
                                        const res = await api.post('/stories/upload', uploadData, {
                                          headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        const newImages = [...(editData.images || [])];
                                        if (idx < newImages.length) {
                                          newImages[idx] = res.data.data.imageUrl;
                                        } else {
                                          newImages.push(res.data.data.imageUrl);
                                        }
                                        setEditData({ ...editData, images: newImages });
                                        toast.success(`Asset 0${idx + 1} Synchronized.`, { id: `upload-${idx}` });
                                      } catch (err) {
                                        toast.error(`Uplink 0${idx + 1} Failure.`, { id: `upload-${idx}` });
                                      }
                                    }}
                                  />
                                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover/upload:bg-primary/20 transition-all">
                                     <span className="material-symbols-outlined text-on-surface-variant/40 group-hover/upload:text-primary">upload_file</span>
                                  </div>
                                  <div className="text-center space-y-1">
                                     <p className="text-[9px] font-black uppercase tracking-[.3em] text-on-surface-variant/40 group-hover/upload:text-primary/60 transition-colors">Inject Visual Data</p>
                                     <p className="text-[7px] font-bold uppercase tracking-widest text-on-surface-variant/20 italic">Slot 0{idx + 1} Available</p>
                                  </div>
                               </label>
                             )}
                          </div>
                        );
                      })}
                   </div>
                   {(!editData.images || editData.images.length === 0) && (
                     <div className="p-6 flex items-center gap-4 bg-red-400/5 border border-red-400/10 rounded-2xl animate-pulse">
                        <span className="material-symbols-outlined text-red-400">warning_amber</span>
                        <div className="space-y-0.5">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Visual Atmosphere Unstable</p>
                           <p className="text-[8px] font-bold uppercase tracking-widest text-red-400/60">No high-authority media assets detected for this narrative.</p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">High-Authority Narrative Logic</label>
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-green-500/60">Logic Online</span>
                         </div>
                         <span className="text-[9px] font-bold uppercase text-on-surface-variant/40 tracking-widest">{editData.content?.length || 0} ARCHIVAL CHARACTERS</span>
                      </div>
                   </div>
                   <textarea 
                     value={editData.content}
                     onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                     className="w-full h-[600px] bg-white/[0.03] border border-white/5 rounded-[3rem] p-12 text-lg text-on-surface-variant leading-relaxed focus:border-primary/40 focus:bg-white/[0.05] focus:outline-none transition-all resize-none shadow-inner custom-scrollbar font-medium"
                     placeholder="Enter narrative characters..."
                   />
                </div>
            </div>
          ) : (
            <div className="p-8">
               <p className="text-sm text-on-surface-variant leading-loose">
                  Are you certain you wish to <span className="text-white font-black uppercase underline">{actionType}</span> the following narrative?
               </p>
               <div className="mt-6 p-6 rounded-[2rem] bg-white/5 border border-white/5">
                  <p className="text-xs font-black text-white mb-2">{selectedStory.title?.en || selectedStory.title}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Author: {selectedStory.author?.name}</p>
               </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
