"use client";
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import storyService from '@/services/storyService';
import seriesService from '@/services/seriesService';

function SubmitStoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', content: '', category: 'general-horror' });
  const [draftId, setDraftId] = useState(null);
  const [images, setImages] = useState([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState([null, null, null]);
  const [uploadingSlot, setUploadingSlot] = useState(null); // Track specific slot being uploaded map
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [seriesId, setSeriesId] = useState('');
  const [seriesOrder, setSeriesOrder] = useState(1);
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);

  React.useEffect(() => {
    const loadSeries = async () => {
      try {
        const data = await seriesService.getMySeries();
        setSeriesList(data || []);
      } catch (e) {
        // Silent fail; series is optional
      }
    };
    loadSeries();
  }, []);

  React.useEffect(() => {
    const draftParam = searchParams.get('draftId');
    if (!draftParam) return;
    const loadDraft = async () => {
      try {
        const draft = await storyService.getDraftById(draftParam);
        setDraftId(draft._id);
        setFormData({
          title: typeof draft.title === 'string' ? draft.title : draft.title?.en || '',
          content: typeof draft.content === 'string' ? draft.content : draft.content?.en || '',
          category: draft.category || 'general-horror'
        });
        setSeriesId(draft.seriesId || '');
        setSeriesOrder(draft.seriesOrder || 1);
        if (Array.isArray(draft.images)) {
          const imgs = [draft.images[0] || null, draft.images[1] || null, draft.images[2] || null];
          setImages(imgs);
          setImagePreviews(imgs);
        }
      } catch (e) {
        setError('Unable to load draft.');
      }
    };
    loadDraft();
  }, [searchParams]);

  // Handle Image Uplink for a specific slot map
  const handleImageChange = async (slotIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local Preview Update map
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...imagePreviews];
      newPreviews[slotIndex] = reader.result;
      setImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);

    // Immediate Upload to Registry map
    setUploadingSlot(slotIndex);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/stories/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newImages = [...images];
      newImages[slotIndex] = res.data.data.imageUrl;
      setImages(newImages);
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Please try a different frequency.';
      setError(`Slot ${slotIndex + 1} Uplink Failed: ${serverMessage}`);
    } finally {
      setUploadingSlot(null);
    }
  };

  // Perform AI Narrative Analysis
  const handleAIAnalyze = async () => {
    if (!formData.content) {
       setError("Please provide story content before using the AI analysis.");
       return;
    }
    
    setIsAnalyzing(true);
    try {
      const res = await api.post('/stories/analyze', { 
        content: formData.content,
        lang: 'en'
      });
      setAiSuggestions(res.data.data);
    } catch (err) {
      setError("AI Analysis Unreachable: System is currently unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiSuggestions) return;
    setFormData({
      ...formData,
      title: aiSuggestions.suggestedTitle.en,
      content: aiSuggestions.enhancedContent.en,
      category: aiSuggestions.suggestedCategory || formData.category
    });
    setAiSuggestions(null);
  };

  const handleSaveDraft = async () => {
    // Industry Standard: Prevent saving empty or extremely short drafts map map
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setError('A draft requires a title (minimum 3 characters) to be identified.');
      return;
    }
    if (!formData.content.trim() || formData.content.trim().length < 10) {
      setError('Please add some narrative content (minimum 10 characters) before saving as draft.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        language: 'en',
        category: formData.category,
        images: images.filter(Boolean),
        seriesId: seriesId || null,
        seriesOrder: seriesOrder || 1
      };
      if (draftId) {
        const updated = await storyService.updateDraft(draftId, payload);
        setDraftId(updated._id);
      } else {
        const draft = await storyService.saveDraft(payload);
        setDraftId(draft._id);
      }
      alert('Draft saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeries = async () => {
    if (!newSeriesTitle.trim()) return;
    setIsCreatingSeries(true);
    try {
      const created = await seriesService.createSeries({
        title: newSeriesTitle.trim(),
        description: newSeriesDescription.trim()
      });
      setSeriesList((prev) => [created, ...prev]);
      setSeriesId(created._id);
      setNewSeriesTitle('');
      setNewSeriesDescription('');
    } catch (e) {
      setError('Failed to create series.');
    } finally {
      setIsCreatingSeries(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/stories', {
        title: formData.title,
        content: formData.content,
        language: 'en',
        category: formData.category,
        images: images.filter(Boolean), // Filter only successfully uploaded URLs map
        seriesId: seriesId || null,
        seriesOrder: seriesOrder || 1
      });
      alert('Story submitted successfully! It will be live once approved by our editorial team.');
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission Failed: Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadBlock = (index, isHero = false) => {
    const isUploading = uploadingSlot === index;
    const preview = imagePreviews[index];
    
    return (
      <label className={`relative group overflow-hidden rounded-xl bg-surface-container-low border border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-surface-container hover:border-primary/50 ${preview ? 'border-none' : ''} ${isHero ? 'md:col-span-2' : 'flex-1'}`}>
        {preview ? (
          <>
            <img src={preview} alt={`Slot ${index} Preview`} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-white text-3xl">edit</span>
            </div>
          </>
        ) : (
          <>
            <span className={`material-symbols-outlined ${isHero ? 'text-4xl' : 'text-2xl'} text-primary mb-3 ${isUploading ? 'animate-spin' : ''}`}>
              {isUploading ? 'sync' : (isHero ? 'add_a_photo' : 'imagesmode')}
            </span>
            <p className={`${isHero ? 'text-sm' : 'text-[10px]'} text-on-surface font-semibold uppercase tracking-widest`}>
              {isUploading ? 'Beaming...' : (isHero ? 'Hero Atmos' : `Slot ${index + 1}`)}
            </p>
            {isHero && <p className="text-on-surface-variant text-[9px] mt-1 italic tracking-normal uppercase opacity-40">PNG, JPG or WebP (Max 10MB)</p>}
          </>
        )}
        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(index, e)} disabled={uploadingSlot !== null} />
      </label>
    );
  };

  return (
    <ProtectedRoute>
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        {/* Header Section */}
        <header className="mb-16 text-center">
          <span className="text-secondary font-display font-bold tracking-widest text-xs uppercase mb-4 block">Editorial Desk</span>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-on-surface mb-6">Craft Your Narrative</h1>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
            Share your unique perspective with the community. Every great story begins with a single word.
          </p>
        </header>

        {/* Form Area */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold text-center">
            {error}
          </div>
        )}
        <form className="space-y-12" onSubmit={handleSubmit}>
          
          {/* Title Section */}
          <section className="group">
            <div className="flex items-center justify-between mb-4">
              <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase">01. Headline</label>
              <span className="text-[10px] text-on-surface-variant px-2 py-1 border border-outline-variant rounded uppercase tracking-tighter">Required</span>
            </div>
            <input 
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:outline-none text-3xl font-display font-bold py-4 text-on-surface placeholder:text-surface-bright transition-all duration-300" 
              placeholder="Enter a compelling title..." 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </section>

          {/* Media Upload Section map */}
          <section>
            <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase mb-6 block">02. Visual Atmosphere</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px]">
               {renderUploadBlock(0, true)}
               <div className="hidden md:flex flex-col gap-4">
                  {renderUploadBlock(1)}
                  {renderUploadBlock(2)}
               </div>
            </div>
          </section>

          {/* Series Section */}
          <section>
            <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase mb-6 block">02B. Series (Optional)</label>
            <div className="space-y-4">
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-6 py-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
              >
                <option value="">No Series</option>
                {seriesList.map((s) => (
                  <option key={s._id} value={s._id}>{s.title}</option>
                ))}
              </select>
              {seriesId && (
                <div className="flex items-center gap-4">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant">Series Order</label>
                  <input
                    type="number"
                    min="1"
                    value={seriesOrder}
                    onChange={(e) => setSeriesOrder(parseInt(e.target.value || '1', 10))}
                    className="w-24 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newSeriesTitle}
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  placeholder="Create new series title..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-6 py-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                />
                <input
                  type="text"
                  value={newSeriesDescription}
                  onChange={(e) => setNewSeriesDescription(e.target.value)}
                  placeholder="Series description (optional)"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-6 py-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateSeries}
                disabled={isCreatingSeries}
                className="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-bold text-[10px] uppercase tracking-widest border border-outline-variant hover:bg-surface-container transition-all"
              >
                {isCreatingSeries ? 'Creating...' : 'Create Series'}
              </button>
            </div>
          </section>

          {/* Category Chips */}
          <section>
            <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase mb-6 block">03. Contextual Filing</label>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Real Horror', value: 'real-horror' },
                { label: 'Paranormal', value: 'paranormal' },
                { label: 'Haunted Places', value: 'haunted-places' },
                { label: 'Urban Legends', value: 'urban-legends' },
                { label: 'General Horror', value: 'general-horror' }
              ].map((cat) => (
                <button 
                  type="button"
                  key={cat.value}
                  onClick={() => setFormData({...formData, category: cat.value})}
                  className={`px-6 py-2 rounded-full text-sm font-bold h-10 flex items-center justify-center transition-all ${
                    formData.category === cat.value 
                      ? 'bg-primary-container text-on-surface border border-primary-container shadow-lg' 
                      : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>

          {/* Rich Text Editor Placeholder */}
          <section className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant relative">
            <div className="px-6 h-12 border-b border-outline-variant flex items-center justify-between gap-4 bg-[#0e0e0e]">
              <div className="flex items-center gap-4">
                <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary text-sm">format_bold</button>
                <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary text-sm">format_italic</button>
                <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary text-sm">format_quote</button>
                <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
                <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary text-sm">link</button>
              </div>
              
              <button 
                type="button" 
                onClick={handleAIAnalyze}
                className={`relative flex items-center gap-2 group transition-all px-4 py-1 rounded-lg ${isAnalyzing ? 'animate-pulse' : ''}`}
              >
                <span className={`material-symbols-outlined text-sm ${isAnalyzing ? 'text-primary animate-spin' : 'text-on-surface-variant group-hover:text-primary'}`}>
                  {isAnalyzing ? 'sync' : 'auto_fix'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-white">
                  {isAnalyzing ? 'Analyzing Story...' : 'AI Analysis'}
                </span>
                <div className="absolute inset-0 bg-primary/5 rounded-lg filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </button>
            </div>
            <textarea 
              className="w-full bg-transparent border-0 focus:outline-none p-8 text-on-surface text-lg leading-relaxed placeholder:text-surface-bright resize-none min-h-[300px]" 
              placeholder="Tell your story here..." 
              rows="10"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            ></textarea>
          </section>

          {/* AI Suggestions Panel */}
          {aiSuggestions && (
            <section className="bg-surface-container-high rounded-2xl border border-outline-variant p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">AI Suggestions</h3>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                  Believability: {aiSuggestions.realismScore}%
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Suggested Title</p>
                <p className="text-on-surface font-bold">{aiSuggestions.suggestedTitle.en}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Suggested Category</p>
                <p className="text-on-surface font-bold">{aiSuggestions.suggestedCategory}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Suggested Content</p>
                <div className="text-sm text-on-surface-variant whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {aiSuggestions.enhancedContent.en}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={applyAISuggestion}
                  className="px-6 py-3 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest"
                >
                  Apply Suggestions
                </button>
                <button
                  type="button"
                  onClick={() => setAiSuggestions(null)}
                  className="px-6 py-3 rounded-full border border-outline-variant text-on-surface text-[10px] font-black uppercase tracking-widest"
                >
                  Discard
                </button>
              </div>
            </section>
          )}

          {/* Bottom Actions */}
          <footer className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-outline-variant">
             <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant text-sm w-full md:w-auto">
               <span className="material-symbols-outlined text-tertiary flex items-center justify-center h-full">lock_reset</span>
               <span className="flex items-center h-full mt-1">Autosaved 2 minutes ago</span>
             </div>
             <div className="flex items-center gap-4 w-full md:w-auto">
               <button
                 type="button"
                 onClick={handleSaveDraft}
                 className="flex-1 md:flex-none px-8 py-3 rounded-full border border-outline-variant text-on-surface font-display font-bold transition-all hover:bg-surface-container-high h-12 flex items-center justify-center"
               >
                 {draftId ? 'Update Draft' : 'Save Draft'}
               </button>
               <button 
                 type="submit" 
                 disabled={loading}
                 className="flex-1 md:flex-none px-12 py-3 rounded-full bg-primary-container text-on-primary-container font-display font-bold shadow-lg shadow-primary-container/20 transition-all hover:scale-105 active:scale-95 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {loading ? 'Submitting...' : 'Submit Story'}
               </button>
             </div>
          </footer>

        </form>
      </main>
    </ProtectedRoute>
  );
}

export default function SubmitStory() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black tracking-[0.5em] uppercase text-on-surface-variant/40">Loading...</p>
      </div>
    }>
      <SubmitStoryContent />
    </Suspense>
  );
}
