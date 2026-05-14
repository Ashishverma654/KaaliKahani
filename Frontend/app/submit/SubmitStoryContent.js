"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import storyService from '@/services/storyService';
import seriesService from '@/services/seriesService';

export default function SubmitStoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({ title: '', content: '', category: 'general-horror' });
  const [draftId, setDraftId] = useState(null);
  const [images, setImages] = useState([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState([null, null, null]);
  const [uploadingSlot, setUploadingSlot] = useState(null);
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
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const draftParam = searchParams.get('draftId');

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const data = await seriesService.getMySeries();
        setSeriesList(data || []);
      } catch (e) { /* Silent fail */ }
    };
    loadSeries();
  }, []);

  useEffect(() => {
    if (!draftParam) return;
    
    let isMounted = true;
    const loadDraft = async () => {
      try {
        const draft = await storyService.getDraftById(draftParam);
        if (isMounted && draft) {
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
        }
      } catch (e) {
        if (isMounted) setError('Unable to load draft.');
      }
    };
    loadDraft();
    return () => { isMounted = false; };
  }, [draftParam]);

  const handleImageChange = async (slotIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...imagePreviews];
      newPreviews[slotIndex] = reader.result;
      setImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);

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
      setError(`Upload Failed: ${err.response?.data?.message || 'Server error'}`);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleAIAnalyze = async () => {
    if (!formData.content) {
       setError("Please provide story content before using the AI analysis.");
       return;
    }
    setIsAnalyzing(true);
    try {
      const res = await api.post('/stories/analyze', { content: formData.content, lang: 'en' });
      setAiSuggestions(res.data.data);
    } catch (err) {
      setError("AI Analysis Unavailable.");
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
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setError('A draft requires a title (minimum 3 characters) to be identified.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let activeSeriesId = seriesId;
      let activeCategory = formData.category;

      if (isCreatingSeries && newSeriesTitle) {
        const newSeries = await seriesService.createSeries({
          title: newSeriesTitle,
          description: newSeriesDescription,
          category: formData.category
        });
        activeSeriesId = newSeries._id;
        setSeriesId(newSeries._id);
        setIsCreatingSeries(false);
      } else if (activeSeriesId) {
        const selected = seriesList.find(s => s._id === activeSeriesId);
        if (selected) activeCategory = selected.category;
      }

      const payload = {
        title: formData.title,
        content: formData.content,
        language: 'en',
        category: activeCategory,
        images: images.filter(Boolean),
        seriesId: activeSeriesId || null,
        seriesOrder: seriesOrder || 1
      };
      if (draftId) {
        await storyService.updateDraft(draftId, payload);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let activeSeriesId = seriesId;
      let activeCategory = formData.category;

      if (isCreatingSeries && newSeriesTitle) {
        const newSeries = await seriesService.createSeries({
          title: newSeriesTitle,
          description: newSeriesDescription,
          category: formData.category
        });
        activeSeriesId = newSeries._id;
        setSeriesId(newSeries._id);
        setIsCreatingSeries(false);
      } else if (activeSeriesId) {
        const selected = seriesList.find(s => s._id === activeSeriesId);
        if (selected) activeCategory = selected.category;
      }

      await api.post('/stories', {
        title: formData.title,
        content: formData.content,
        language: 'en',
        category: activeCategory,
        images: images.filter(Boolean),
        seriesId: activeSeriesId || null,
        seriesOrder: seriesOrder || 1,
        storyId: draftId || null
      });
      alert('Story submitted successfully!');
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission Failed.');
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
          </>
        )}
        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(index, e)} disabled={uploadingSlot !== null} />
      </label>
    );
  };

  return (
    <ProtectedRoute>
      <main className="max-w-4xl mx-auto px-6 pt-8 pb-24">
        <header className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-on-surface mb-6">Narrate Your Experience</h1>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
            Share your unique experience with the world. Every great story begins with a single word.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form className="space-y-12" onSubmit={handleSubmit}>
          
          <section className="group">
            <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase block mb-4">01. Headline</label>
            <input 
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:outline-none text-3xl font-display font-bold py-4 text-on-surface placeholder:text-surface-bright transition-all" 
              placeholder="Enter a compelling title..." 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </section>

          <section>
            <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase mb-6 block">02. Add Image</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px]">
               {renderUploadBlock(0, true)}
               <div className="hidden md:flex flex-col gap-4">
                  {renderUploadBlock(1)}
                  {renderUploadBlock(2)}
               </div>
            </div>
          </section>

          <section className="space-y-6">
            <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase block">03. The Narrative</label>
            <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant relative">
              <div className="px-6 h-12 border-b border-outline-variant flex items-center justify-between gap-4 bg-black">
                <div className="flex items-center gap-4">
                  <button type="button" className="material-symbols-outlined text-white/60 hover:text-primary text-sm transition-colors">format_bold</button>
                  <button type="button" className="material-symbols-outlined text-white/60 hover:text-primary text-sm transition-colors">format_italic</button>
                  <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                  {user?.role === 'admin' && (
                    <button 
                      type="button" 
                      onClick={handleAIAnalyze}
                      className={`flex items-center gap-2 group transition-all ${isAnalyzing ? 'animate-pulse' : ''}`}
                    >
                      <span className={`material-symbols-outlined text-sm ${isAnalyzing ? 'text-primary animate-spin' : 'text-white/60 group-hover:text-primary'}`}>
                        {isAnalyzing ? 'sync' : 'auto_fix'}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 group-hover:text-white">
                        AI Analysis
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <textarea 
                className="w-full bg-transparent border-0 focus:outline-none p-8 text-on-surface text-lg leading-relaxed placeholder:text-surface-bright resize-none min-h-[300px]" 
                placeholder="Tell your story here..." 
                rows="10"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
              ></textarea>
            </div>
          </section>

          <section className="space-y-6">
            <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase block">04. Categorization & Series</label>
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-on-surface text-sm font-bold block mb-2">Category</label>
                  <select 
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
                    value={seriesId && !isCreatingSeries ? (seriesList.find(s => s._id === seriesId)?.category || formData.category) : formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    disabled={!!seriesId && !isCreatingSeries}
                  >
                    <option value="general-horror">General Horror</option>
                    <option value="real-horror">Real Horror</option>
                    <option value="paranormal">Paranormal</option>
                    <option value="haunted-places">Haunted Places</option>
                    <option value="urban-legends">Urban Legends</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="sci-fi">Sci-Fi</option>
                    <option value="thriller">Thriller</option>
                    <option value="real-story">Real Story</option>
                    <option value="fiction">Fiction</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="romance">Romance</option>
                    <option value="other">Other</option>
                  </select>
                  {!!seriesId && !isCreatingSeries && (
                    <p className="text-[10px] text-primary mt-1">Category is locked to the selected series.</p>
                  )}
                </div>

                <div>
                  <label className="text-on-surface text-sm font-bold block mb-2">Select Series (Optional)</label>
                  <select 
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                    value={seriesId}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setIsCreatingSeries(true);
                        setSeriesId('');
                      } else {
                        setIsCreatingSeries(false);
                        setSeriesId(e.target.value);
                      }
                    }}
                  >
                    <option value="">Standalone Story (No Series)</option>
                    <option value="new">+ Create New Series</option>
                    {seriesList.map(s => (
                      <option key={s._id} value={s._id}>{s.title?.en || s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isCreatingSeries && (
                <div className="space-y-4 p-4 rounded-xl bg-surface-container border border-outline-variant/50">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">New Series Details</p>
                  <input 
                    type="text" 
                    placeholder="New Series Title" 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:outline-none text-lg font-bold py-2 text-on-surface"
                    value={newSeriesTitle}
                    onChange={(e) => setNewSeriesTitle(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Series Description (optional)" 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:outline-none py-2 text-on-surface"
                    value={newSeriesDescription}
                    onChange={(e) => setNewSeriesDescription(e.target.value)}
                  />
                </div>
              )}

              {(seriesId || isCreatingSeries) && (
                <div>
                  <label className="text-on-surface text-sm font-bold block mb-2">Part Number / Order</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                    value={seriesOrder}
                    onChange={(e) => setSeriesOrder(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
            </div>
          </section>

          <footer className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-outline-variant">
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
                 className="flex-1 md:flex-none px-12 py-3 rounded-full border border-outline-variant text-on-surface font-display font-bold transition-all hover:bg-primary hover:text-black h-12 flex items-center justify-center disabled:opacity-50"
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
