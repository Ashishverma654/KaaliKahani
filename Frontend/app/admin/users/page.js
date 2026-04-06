"use client";
import React, { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import Card from '@/components/admin/Card';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter Registry State map map map
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'archived'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id, currentStatus) => {
    try {
      await userService.toggleBlock(id);
      toast.success(`User ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  // Identity Isolation Logic map map map
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && user.isActive) || 
                            (statusFilter === 'archived' && !user.isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
         <h1 className="text-3xl md:text-4xl font-black font-gothic tracking-[0.2em] uppercase text-on-surface pt-8 pb-2 leading-relaxed overflow-visible">Registry Control</h1>
         <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant">User Identity & Access Governance</p>
      </div>

      <Card 
        title="Personnel Database" 
        icon="badge" 
        className="border border-outline-variant overflow-visible"
        actions={(
          <div className="relative">
             <button 
               onClick={() => setIsFilterOpen(!isFilterOpen)}
               className={`flex gap-1.5 p-3 rounded-xl transition-all duration-300 ${isFilterOpen ? 'bg-primary/20 scale-110' : 'hover:bg-white/5'}`}
             >
                <div className={`w-1 h-1 rounded-full transition-all duration-500 ${isFilterOpen ? 'bg-primary scale-125' : 'bg-white opacity-40'}`}></div>
                <div className={`w-1 h-1 rounded-full transition-all duration-500 delay-75 ${isFilterOpen ? 'bg-primary scale-125' : 'bg-white opacity-40'}`}></div>
                <div className={`w-1 h-1 rounded-full transition-all duration-500 delay-150 ${isFilterOpen ? 'bg-primary scale-125' : 'bg-white opacity-40'}`}></div>
             </button>

             {/* Floating Filter Registry map map map */}
             {isFilterOpen && (
               <div className="absolute top-12 right-0 w-80 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Identity Lookup</label>
                        <div className="relative">
                           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/40">search</span>
                           <input 
                             type="text" 
                             placeholder="Search name or email..."
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-primary focus:outline-none transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Status Protocol</label>
                        <div className="grid grid-cols-3 gap-2">
                           {['all', 'active', 'archived'].map((status) => (
                             <button
                               key={status}
                               onClick={() => setStatusFilter(status)}
                               className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                                 statusFilter === status 
                                   ? 'bg-primary/20 border-primary text-primary' 
                                   : 'bg-white/5 border-white/5 text-on-surface-variant/40 hover:text-white'
                               }`}
                             >
                                {status}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Archival Sequence</label>
                        <div className="flex gap-2">
                           <button
                             onClick={() => setSortOrder('newest')}
                             className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                               sortOrder === 'newest' 
                                 ? 'bg-primary/20 border-primary text-primary' 
                                 : 'bg-white/5 border-white/5 text-on-surface-variant/40 hover:text-white'
                             }`}
                           >
                              Newest First
                           </button>
                           <button
                             onClick={() => setSortOrder('oldest')}
                             className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                               sortOrder === 'oldest' 
                                 ? 'bg-primary/20 border-primary text-primary' 
                                 : 'bg-white/5 border-white/5 text-on-surface-variant/40 hover:text-white'
                             }`}
                           >
                              Legacy First
                           </button>
                        </div>
                     </div>

                     <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{filteredUsers.length} CURATORS MATCHED</span>
                        <button 
                          onClick={() => { setSearchQuery(''); setStatusFilter('all'); setSortOrder('newest'); }}
                          className="text-[8px] font-black uppercase text-primary hover:underline tracking-widest"
                        >
                           Reset Internal filters
                        </button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        )}
      >
        <Table 
          headers={['#', 'Curator', 'Role', 'Status', 'Joined', 'Actions']}
          loading={loading}
          data={filteredUsers}
          renderRow={(user, i) => (
            <>
              <td className="py-5 pl-6 text-[11px] font-black text-on-surface-variant/40 font-mono">
                 {String(i + 1).padStart(2, '0')}
              </td>
              <td className="py-5 px-4">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary font-black uppercase text-xs">
                       {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-black text-on-surface">{user.name}</span>
                       <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter">{user.email}</span>
                    </div>
                 </div>
              </td>
              <td className="py-5">
                 <span className={`text-[10px] font-black uppercase tracking-widest ${['admin', 'superadmin'].includes(user.role) ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {user.role}
                 </span>
              </td>
              <td className="py-5">
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                       {user.isActive ? 'Active' : 'Archived'}
                    </span>
                 </div>
              </td>
              <td className="py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                 {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-5 pr-6">
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleBlock(user._id, user.isActive)}
                      className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center border ${
                        user.isActive 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' 
                          : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'
                      }`}
                      title={user.isActive ? 'Block User' : 'Unblock User'}
                    >
                       <span className="material-symbols-outlined text-sm">
                          {user.isActive ? 'block' : 'undo'}
                       </span>
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline-variant">
                       <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                 </div>
              </td>
            </>
          )}
        />
      </Card>
    </div>
  );
}
