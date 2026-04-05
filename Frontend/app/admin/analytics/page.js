// app/admin/analytics/page.js
"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/admin/Card';
import adminService from '@/services/adminService';

export default function SystemAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await adminService.getAnalytics();
      setAnalytics(data);
      setLoading(false);
    };
    loadAnalytics();
  }, []);

  if (loading) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black font-gothic text-on-surface tracking-tighter mb-2">Narrative Intelligence</h1>
        <p className="text-on-surface-variant font-medium text-sm">Deep dive into community engagement, consumption patterns, and system health.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <Card title="Traffic Evolution">
           <div className="mt-8 flex items-end justify-between h-64 gap-3 px-4">
              {analytics.dailyTraffic.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                   <div 
                     className="w-full bg-primary/20 rounded-t-xl group-hover:bg-primary transition-all duration-700 cursor-help relative"
                     style={{ height: `${(day.views / 10000) * 100}%` }}
                   >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container border border-outline-variant px-3 py-1.5 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                         {day.views.toLocaleString()} VIEWS
                      </div>
                   </div>
                   <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                      {day.day}
                   </span>
                </div>
              ))}
           </div>
        </Card>

        <Card title="Engagement Distribution">
           <div className="mt-8 flex flex-col gap-6">
              {[
                { label: 'Real Horror', value: 45, color: 'bg-primary' },
                { label: 'Paranormal', value: 30, color: 'bg-green-500' },
                { label: 'Haunted Places', value: 15, color: 'bg-yellow-500' },
                { label: 'Urban Legends', value: 10, color: 'bg-red-500' },
              ].map((item, i) => (
                <div key={i}>
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">{item.label}</span>
                      <span className="text-[10px] font-black text-on-surface-variant">{item.value}%</span>
                   </div>
                   <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card icon="speed" title="System Latency" value="124ms" description="Stable performance across regions." />
         <Card icon="cloud_done" title="Archive Uptime" value="99.98%" description="Zero narrative data loss detected." />
         <Card icon="database" title="Storage Status" value="4.2 TB" description="Expansion remaining: 65%." />
      </div>
    </div>
  );
}
