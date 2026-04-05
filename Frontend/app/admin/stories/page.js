"use client";
import React, { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import storyService from '@/services/storyService';
import toast from 'react-hot-toast';

export default function StoriesModeration() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'delete'

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

  const handleAction = async () => {
    if (!selectedStory || !actionType) return;
    
    try {
      if (actionType === 'approve') {
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
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black font-gothic tracking-[0.2em] uppercase text-on-surface pt-8 pb-2 leading-relaxed overflow-visible">Narrative Curation</h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant">Gatekeeper Protocol & Review Queue</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
           {['Pending', 'Approved', 'Rejected'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
               }`}
             >
               {tab} Queue
             </button>
           ))}
        </div>

        <div className="bg-surface border border-outline-variant rounded-3xl overflow-hidden shadow-sm">
          <Table 
            headers={['Narrative', 'Author', 'Category', 'Timestamp', 'Actions']}
            loading={loading}
            data={stories}
            renderRow={(story) => (
              <>
                <td className="py-5 px-6">
                   <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-on-surface group-hover:text-primary transition-colors">{story.title}</span>
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter">ID: {story._id.slice(-8)}</span>
                   </div>
                </td>
                <td className="py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{story.author?.name || 'Anonymous'}</td>
                <td className="py-5">
                   <span className="bg-surface-container-high px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-on-surface-variant border border-outline-variant">
                      {story.category || 'General'}
                   </span>
                </td>
                <td className="py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                   {new Date(story.createdAt).toLocaleDateString()}
                </td>
                <td className="py-5 pr-6">
                   <div className="flex items-center gap-2">
                      {activeTab === 'Pending' && (
                        <>
                          <button 
                            onClick={() => { setSelectedStory(story); setActionType('approve'); }}
                            className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center"
                          >
                             <span className="material-symbols-outlined text-sm">done</span>
                          </button>
                          <button 
                            onClick={() => { setSelectedStory(story); setActionType('reject'); }}
                            className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center"
                          >
                             <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => { setSelectedStory(story); setActionType('delete'); }}
                        className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                      >
                         <span className="material-symbols-outlined text-sm">delete</span>
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
          onClose={() => setSelectedStory(null)}
          title={`Confirm ${actionType}`}
          onConfirm={handleAction}
        >
          <div className="p-6">
             <p className="text-sm text-on-surface-variant leading-loose">
                Are you certain you wish to <span className="text-on-surface font-black uppercase underline">{actionType}</span> the following narrative?
             </p>
             <div className="mt-4 p-4 rounded-2xl bg-surface-container-high border border-outline-variant">
                <p className="text-xs font-black text-on-surface mb-1">{selectedStory.title}</p>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Author: {selectedStory.author?.name}</p>
             </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
