"use client";
import React, { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import adminService from '@/services/adminService';
import toast from 'react-hot-toast';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await adminService.getLogs();
        setLogs(data || []);
      } catch (error) {
        toast.error('Failed to load system logs');
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
         <h1 className="text-3xl font-black font-gothic tracking-[0.2em] uppercase text-on-surface">Audit Registry</h1>
         <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant">Traceability & Administrative Event Stream</p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-3xl overflow-hidden shadow-sm">
        <Table 
          headers={['Event', 'Context', 'Admin', 'Temporal Hook']}
          loading={loading}
          data={logs}
          renderRow={(log) => (
            <>
              <td className="py-5 px-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                       <span className="material-symbols-outlined text-sm">history</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">{log.action.replace(/_/g, ' ')}</span>
                 </div>
              </td>
              <td className="py-5">
                 <span className="text-xs text-on-surface-variant font-medium leading-relaxed">{log.details}</span>
              </td>
              <td className="py-5">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">{log.admin?.name || 'System'}</span>
                   <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-tighter">{log.admin?.email}</span>
                </div>
              </td>
              <td className="py-5 pr-6">
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                    {new Date(log.timestamp).toLocaleString()}
                 </span>
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
}
