
import React, { useState } from 'react';
import { User, Role } from '../types';
import { GlassCard, GlassButton, GlassInput, Badge } from './GlassComponents';
import { Search, Plus, Trash2, Edit, Shield, CheckCircle, XCircle, MoreVertical, X, Filter } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as Role,
    status: 'active' as 'active' | 'inactive'
  });

  const canManageUsers = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Helper to determine if current user can delete a specific target user
  const canDeleteTargetUser = (targetUser: User) => {
    if (currentUser.id === targetUser.id) return false; // Prevent self-deletion

    if (currentUser.role === 'admin') {
      return true; // Admin can delete anyone
    }

    if (currentUser.role === 'manager') {
      // Manager can delete other managers and users, but NOT admins
      return targetUser.role === 'manager' || targetUser.role === 'user';
    }

    return false; // Users cannot delete anyone
  };

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-slate-400 mb-4" />
          <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200">Access Restricted</h2>
          <p className="text-slate-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'user',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...formData
      });
    } else {
      onAddUser(formData);
    }
    setShowModal(false);
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'admin': return 'bg-rose-500';
      case 'manager': return 'bg-blue-500';
      case 'user': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-1">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-thin">Manage team access and roles</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input-base rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          
          <div className="relative">
            <select 
              className="glass-input-base appearance-none rounded-xl px-4 py-2 pr-8 text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <GlassButton 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white border-transparent"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add User</span>
          </GlassButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <GlassCard className="p-0 overflow-hidden border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-indigo-50/50 dark:hover:bg-white/[0.04] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge color={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {user.status === 'active' ? (
                        <CheckCircle size={14} className="text-emerald-500" />
                      ) : (
                        <XCircle size={14} className="text-slate-400" />
                      )}
                      <span className={`text-sm font-medium ${user.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-all"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      
                      {canDeleteTargetUser(user) && (
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md animate-scale-in">
            <GlassCard className="p-8 border-white/20 bg-white/80 dark:bg-[#15152a]/90 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-thin text-slate-800 dark:text-white">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Full Name</label>
                  <GlassInput 
                    placeholder="e.g. John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Email Address</label>
                  <GlassInput 
                    type="email"
                    placeholder="e.g. john@company.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Role</label>
                    <div className="relative">
                      <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                      >
                        {currentUser.role === 'admin' && <option value="admin" className="text-black">Admin</option>}
                        <option value="manager" className="text-black">Manager</option>
                        <option value="user" className="text-black">User</option>
                      </select>
                      <MoreVertical className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={14} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Status</label>
                    <div className="relative">
                      <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                      >
                        <option value="active" className="text-black">Active</option>
                        <option value="inactive" className="text-black">Inactive</option>
                      </select>
                      <MoreVertical className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={14} />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <GlassButton type="button" variant="ghost" className="flex-1 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => setShowModal(false)}>Cancel</GlassButton>
                  <GlassButton type="submit" className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white border-transparent">
                    {editingUser ? 'Save Changes' : 'Create User'}
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
