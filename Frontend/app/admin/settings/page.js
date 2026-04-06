"use client";
import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import Card from '@/components/admin/Card';
import adminService from '@/services/adminService';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowAIAnalysis: true,
    archivePublicAccess: true,
    siteTitle: 'KaaliKahani',
    curatorApprovalThreshold: 1
  });
  const [logs, setLogs] = useState([]);
  const [approvedStories, setApprovedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArchivalData = async () => {
      try {
        const [settingsRes, logsRes] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/admin/logs')
        ]);
        setSettings(settingsRes.data.data);
        setLogs(logsRes.data.data);
        const stories = await adminService.getStories('approved');
        setApprovedStories(stories || []);
      } catch (err) {
        setError('Archival Retrieval Failed: Master registry unreachable.');
      } finally {
        setLoading(false);
      }
    };
    fetchArchivalData();
  }, []);

  const handleUpdate = async (field, value) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings); // Optimistic Update map

    try {
      await api.put('/admin/settings', updatedSettings);
    } catch (err) {
      setError('Tele-Command Failure: Registry rejected the sync.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-primary animate-pulse font-display font-black tracking-widest uppercase text-xs">
       Retrieving Archival Parameters...
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-display tracking-tight text-on-surface flex items-center gap-4 pt-8 pb-2 leading-relaxed">
            <span className="material-symbols-outlined text-primary text-4xl">terminal</span>
            System Protocols
          </h1>
          <p className="text-on-surface-variant text-sm mt-2 font-medium">Calibrate high-tier archival intelligence and narrative gatekeeping.</p>
        </div>
      </header>

      {error && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold animate-shake">
           {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Core Protocols */}
        <div className="space-y-8">
          <Card title="Operational Intelligence" icon="security">
            <div className="space-y-6 pt-4">
               {/* AI Intelligence Access */}
               <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-bright/5 hover:bg-surface-bright/10 transition-colors border border-outline-variant/30">
                  <div>
                    <p className="text-on-surface font-bold text-sm">AI Narrative Intelligence</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Status: {settings.allowAIAnalysis ? 'CONNECTED' : 'DISCONNECTED'}</p>
                  </div>
                  <button 
                    onClick={() => handleUpdate('allowAIAnalysis', !settings.allowAIAnalysis)}
                    className={`w-14 h-7 rounded-full relative transition-all duration-500 ${settings.allowAIAnalysis ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                     <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 ${settings.allowAIAnalysis ? 'left-8' : 'left-1'}`}></div>
                  </button>
              </div>
            </div>
          </Card>

          <Card title="Featured Story" icon="star">
            <div className="space-y-4 pt-4">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Select a single featured story for homepage</p>
              <select
                value={settings.featuredStoryId || ''}
                onChange={(e) => handleUpdate('featuredStoryId', e.target.value || null)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-5 py-3 text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">None</option>
                {approvedStories.map((story) => (
                  <option key={story._id} value={story._id}>
                    {story.title?.en || story.title} ({story._id.slice(-6)})
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </div>

        {/* System Activity Log (Terminal) */}
        <div className="space-y-8 h-full">
           <Card title="Archival retrieval Log" icon="terminal" className="h-full flex flex-col">
              <div className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-[10px] leading-relaxed overflow-y-auto max-h-[500px] border border-outline-variant/20 mt-4 custom-scrollbar">
                 <div className="space-y-2">
                    {logs.map((log, idx) => (
                      <div key={idx} className="flex gap-4 group opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-on-surface-variant select-none">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                        <span className="text-primary font-bold uppercase tracking-tighter">[{log.action}]</span>
                        <span className="text-on-surface/60">{log.details}</span>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-on-surface-variant italic py-12 text-center select-none">
                         Synchronizing with remote registries... no active pulses detected.
                      </div>
                    )}
                 </div>
              </div>
           </Card>
        </div>

      </div>

      {/* Frame Decals */}
      <div className="fixed top-12 left-12 pointer-events-none opacity-5">
         <div className="w-16 h-16 border-t-2 border-l-2 border-white rounded-tl-3xl"></div>
      </div>
      <div className="fixed bottom-12 right-12 pointer-events-none opacity-5">
         <div className="w-16 h-16 border-b-2 border-r-2 border-white rounded-br-3xl"></div>
      </div>
    </div>
  );
}
