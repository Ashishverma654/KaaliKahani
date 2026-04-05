"use client";
import React, { useState, useEffect } from 'react';
import Table from '@/components/admin/Table';
import Card from '@/components/admin/Card';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
         <h1 className="text-3xl md:text-4xl font-black font-gothic tracking-[0.2em] uppercase text-on-surface pt-8 pb-2 leading-relaxed overflow-visible">Registry Control</h1>
         <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-on-surface-variant">User Identity & Access Governance</p>
      </div>

      <Card title="Personnel Database" icon="badge" className="border border-outline-variant">
        <Table 
          headers={['Curator', 'Role', 'Status', 'Joined', 'Actions']}
          loading={loading}
          data={users}
          renderRow={(user) => (
            <>
              <td className="py-5 px-6">
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
                 <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-primary' : 'text-on-surface-variant'}`}>
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
