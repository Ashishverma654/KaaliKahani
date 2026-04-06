"use client";
import React, { useState, useEffect } from 'react';
import Card from '@/components/admin/Card';
import Table from '@/components/admin/Table';
import NarrativeGraph from '@/components/admin/NarrativeGraph';
import adminService from '@/services/adminService';
import api from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, isAdmin, isSettled, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [stories, setStories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Primary Data Fetch: Only execute after successful identity clearance map
  useEffect(() => {
    if (authLoading || !isAdmin || !isSettled) return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, storiesData, logsData] = await Promise.all([
          adminService.getStats(),
          adminService.getStories(),
          adminService.getLogs()
        ]);
        setStats(statsData);
        setStories(storiesData || []);
        setLogs(logsData || []);
      } catch (error) {
        toast.error('Registry Access Error: Failed to synchronize telemetry.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [authLoading, isAdmin, isSettled]);

  const metricCards = [
    { label: 'Pending Verifications', value: stats?.pendingSubmissions || 0, icon: 'pending_actions', trend: '+12% flux', color: 'text-amber-500', sparkline: [40, 70, 50, 90, 60, 80] },
    { label: 'Active Curators', value: stats?.totalUsers || 0, icon: 'group', trend: 'Optimal', color: 'text-primary', sparkline: [30, 40, 35, 50, 45, 60] },
    { label: 'Total Narratives', value: stats?.totalStories || 0, icon: 'menu_book', trend: '+8.4% growth', color: 'text-green-500', sparkline: [20, 50, 40, 70, 65, 85] },
    { label: 'Network Latency', value: '14ms', icon: 'speed', trend: 'Stable', color: 'text-blue-500', sparkline: [10, 15, 12, 18, 14, 16] },
  ];

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="space-y-12 animate-in fade-in duration-1000">
        {/* Mission Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(163,29,29,0.5)]"></div>
               <h1 className="text-4xl md:text-5xl font-black font-gothic tracking-[0.2em] uppercase text-white pt-8 pb-2 leading-relaxed overflow-visible">Mission Control</h1>
            </div>
            <p className="text-[10px] font-black tracking-[0.5em] uppercase text-on-surface-variant/40 pl-5">Strategic Operational Command & Registry Hub</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-6 py-3 backdrop-blur-xl">
             <div className="text-right">
                <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Archive Pulse</p>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Normal Operations</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
             </div>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((card, i) => (
            <Card key={i} className="hover:translate-y-[-4px]">
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${card.color} shadow-inner`}>
                    <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">{card.label}</p>
                     <h3 className="text-3xl font-black text-white tracking-tighter">{loading ? '...' : card.value}</h3>
                  </div>
                </div>

                {/* Mini Sparkline Visualization */}
                <div className="h-12 w-full flex items-end gap-1 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                  {card.sparkline.map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`flex-1 rounded-t-sm transition-all duration-700 bg-current ${card.color}`} 
                      style={{ height: `${val}%`, transitionDelay: `${idx * 100}ms` }}
                    ></div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                   <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 italic">Telemetry Delta</span>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${card.trend.includes('+') ? 'text-green-500' : 'text-primary'}`}>
                      {card.trend}
                   </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
   
        {/* Narrative Correlation Graph (Stitch ID Engine) */}
        <section className="space-y-6">
           <header className="flex items-center justify-between">
              <div>
                 <h2 className="text-xl font-bold font-display text-on-surface tracking-tight">Narrative Correlation Lattice</h2>
                 <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Stitch ID Spatial Analysis Hub • Synchronicity Core</p>
              </div>
           </header>
           <NarrativeGraph stories={stories || []} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Operational Log Table */}
          <div className="lg:col-span-8">
            <Card 
              title="Operational Log" 
              icon="history" 
              className="h-full"
            >
              <Table 
                headers={['Codename', 'Curator', 'Telemetry', 'Status']}
                loading={loading}
                data={logs}
                renderRow={(log) => (
                  <tr key={log._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-3">
                         <span className="material-symbols-outlined text-xs text-primary">terminal</span>
                         <span className="text-xs font-bold text-white tracking-wide">{log.details}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-on-surface-variant">
                            {log.admin?.name?.charAt(0) || 'S'}
                         </div>
                         <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant">{log.admin?.name || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-[10px] uppercase font-black tracking-widest text-on-surface-variant/40">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-2 py-1 px-3 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                         <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                         <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Success</span>
                      </div>
                    </td>
                  </tr>
                )}
              />
            </Card>
          </div>
          
          {/* Strategic Command Panel */}
          <div className="lg:col-span-4 space-y-8">
            <Card title="Strategic Tasks" icon="bolt">
               <div className="space-y-4">
                  {[
                    { t: 'Verification Queue', d: '24 stories requiring review', icon: 'rule' },
                    { t: 'Registry Sanitization', d: 'Maintenance protocol needed', icon: 'shield_heart' },
                    { t: 'Metadata Analytics', d: 'Export site performance', icon: 'insights' }
                  ].map((task, i) => (
                    <button key={i} className="w-full p-6 rounded-2xl bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 text-left group transition-all relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl group-hover:bg-primary/20 transition-colors"></div>
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-black/50 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors border border-white/5">
                             <span className="material-symbols-outlined text-lg">{task.icon}</span>
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase text-white mb-1 tracking-widest group-hover:text-primary transition-colors">{task.t}</p>
                             <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-relaxed line-clamp-1">{task.d}</p>
                          </div>
                       </div>
                    </button>
                  ))}
               </div>
            </Card>

            {/* Growth Insight (Noir Enhanced) */}
            <div className="bg-gradient-to-br from-[#a31d1d] to-[#7a1616] p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 blur-[80px] -translate-y-24 translate-x-12 opacity-50"></div>
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/40 blur-[80px] translate-y-24 -translate-x-12 opacity-50"></div>
               
               <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                     <span className="material-symbols-outlined text-white text-2xl">trending_up</span>
                  </div>
                  <div>
                     <h4 className="text-white font-black font-gothic text-2xl mb-2 uppercase tracking-[0.2em]">Growth Pulse</h4>
                     <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">System traction accelerated by 18% following the glassmorphic overhaul. Narrative engagement is at its peak.</p>
                  </div>
                  <button className="w-full bg-white text-[#a31d1d] py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all shadow-xl active:scale-95">
                     Access Telemetry
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
