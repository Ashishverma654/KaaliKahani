"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function SubmitStory() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', content: '', category: 'General Horror' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Image Uplink to the Registry
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Immediate Upload to Registry
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/stories/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImage(res.data.data.imageUrl);
    } catch (err) {
      setError('Image Uplink Failed: Please try a different frequency.');
    } finally {
      setIsUploading(false);
    }
  };

  // Perform AI Narrative Analysis
  const handleAIAnalyze = async () => {
    if (!formData.content) {
       setError("Provide narrative content before invoking the AI Oracle.");
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
      setError("AI Analysis Unreachable: The machine is silent.");
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
        images: image ? [image] : []
      });
      alert('Archive Entry Successful: Your narrative has been filed.');
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Archival Rejection: Integrity check failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
      {/* Header Section */}
      <header className="mb-16 text-center">
        <span className="text-secondary font-display font-bold tracking-widest text-xs uppercase mb-4 block">Editorial Desk</span>
        <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter text-on-surface mb-6">Craft Your Narrative</h1>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
          Share your unique perspective with the Curator community. Every great story begins with a single word.
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

        {/* Media Upload Section */}
        <section>
          <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase mb-6 block">02. Visual Atmosphere</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px]">
             <label className={`md:col-span-2 relative group overflow-hidden rounded-xl bg-surface-container-low border border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-surface-container hover:border-primary/50 ${imagePreview ? 'border-none' : ''}`}>
               {imagePreview ? (
                 <>
                   <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-3xl">edit</span>
                   </div>
                 </>
               ) : (
                 <>
                   <span className={`material-symbols-outlined text-4xl text-primary mb-3 ${isUploading ? 'animate-spin' : ''}`}>
                     {isUploading ? 'sync' : 'add_a_photo'}
                   </span>
                   <p className="text-on-surface font-semibold">{isUploading ? 'Beaming to Registry...' : 'Upload Hero Image'}</p>
                   <p className="text-on-surface-variant text-xs mt-1 italic">Atmospheric PNG, JPG or WebP (Max 10MB)</p>
                 </>
               )}
               <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
             </label>
             
             <div className="hidden md:flex flex-col gap-4">
                <div className="flex-1 bg-surface-container-low rounded-xl border border-dashed border-outline-variant flex items-center justify-center text-outline-variant hover:text-primary transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined transition-transform group-hover:scale-125">imagesmode</span>
                </div>
                <div className="flex-1 bg-surface-container-low rounded-xl border border-dashed border-outline-variant flex items-center justify-center text-outline-variant hover:text-primary transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined transition-transform group-hover:scale-125">auto_graph</span>
                </div>
             </div>
          </div>
        </section>

        {/* Category Chips */}
        <section>
          <label className="text-on-surface-variant font-display font-bold text-sm tracking-widest uppercase mb-6 block">03. Contextual Filing</label>
          <div className="flex flex-wrap gap-3">
            {['Real Horror', 'Paranormal', 'Haunted Places', 'Urban Legends', 'General Horror'].map((cat) => (
              <button 
                type="button"
                key={cat}
                onClick={() => setFormData({...formData, category: cat})}
                className={`px-6 py-2 rounded-full text-sm font-bold h-10 flex items-center justify-center transition-all ${
                  formData.category === cat 
                    ? 'bg-primary-container text-on-surface border border-primary-container shadow-lg' 
                    : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
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
              onMouseEnter={() => setFormData({...formData})} // Force re-render for glow effect
              className={`flex items-center gap-2 group transition-all px-4 py-1 rounded-lg ${isAnalyzing ? 'animate-pulse' : ''}`}
            >
               <span className={`material-symbols-outlined text-sm ${isAnalyzing ? 'text-primary animate-spin' : 'text-on-surface-variant group-hover:text-primary'}`}>
                 {isAnalyzing ? 'sync' : 'auto_fix'}
               </span>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-white">
                 {isAnalyzing ? 'Consulting Archive...' : 'AI Sense Analysis'}
               </span>
               <div className="absolute inset-0 bg-primary/5 rounded-lg filter blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
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

        {/* Bottom Actions */}
        <footer className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-outline-variant">
           <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant text-sm w-full md:w-auto">
             <span className="material-symbols-outlined text-tertiary flex items-center justify-center h-full">lock_reset</span>
             <span className="flex items-center h-full mt-1">Autosaved 2 minutes ago</span>
           </div>
           <div className="flex items-center gap-4 w-full md:w-auto">
             <button type="button" className="flex-1 md:flex-none px-8 py-3 rounded-full border border-outline-variant text-on-surface font-display font-bold transition-all hover:bg-surface-container-high h-12 flex items-center justify-center">Preview Draft</button>
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

      {/* AI Suggestion Comparison Overlay */}
      {aiSuggestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-surface-container-high rounded-3xl border border-outline-variant shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col scale-in duration-300">
            <header className="p-8 border-b border-outline-variant flex items-center justify-between bg-primary/5">
              <div>
                <h2 className="text-2xl font-display font-black text-on-surface tracking-tight flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">auto_fix</span>
                  Archive Intelligence Results
                </h2>
                <p className="text-on-surface-variant text-sm mt-1">Review Gemini's suggested enhancements for your narrative.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant block mb-1">Believability Index</span>
                  <div className="h-2 w-32 bg-outline-variant rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${aiSuggestions.realismScore}%` }}
                    ></div>
                  </div>
                </div>
                <button onClick={() => setAiSuggestions(null)} className="p-2 hover:bg-surface-bright rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Original Content */}
              <div className="space-y-6 opacity-60">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant border-l-2 border-outline-variant pl-3">Original Registry</span>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display text-on-surface italic line-through">{formData.title}</h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{formData.content}</p>
                </div>
              </div>

              {/* AI Suggested Content */}
              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-l-2 border-primary pl-3">AI Suggestion</span>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-display text-primary">{aiSuggestions.suggestedTitle.en}</h3>
                  <div className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                    {aiSuggestions.enhancedContent.en}
                  </div>
                  <div className="pt-4 flex flex-wrap gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary px-3 py-1 rounded">
                      Category: {aiSuggestions.suggestedCategory}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary px-3 py-1 rounded">
                      Sense: Immersive
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-8 border-t border-outline-variant flex items-center justify-end gap-6 bg-surface-container">
              <button 
                onClick={() => setAiSuggestions(null)}
                className="px-8 py-3 rounded-full border border-outline-variant text-on-surface font-display font-bold hover:bg-surface-bright transition-all"
              >
                Discard Suggestions
              </button>
              <button 
                onClick={applyAISuggestion}
                className="px-12 py-3 rounded-full bg-primary text-on-primary font-display font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Apply Archive Changes
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
