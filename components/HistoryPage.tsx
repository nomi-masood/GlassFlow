
import React, { useState } from 'react';
import { HistoryLog, ActionType, User } from '../types';
import { GlassCard, Badge } from './GlassComponents';
import { Search, Shield, Filter, Clock, Activity, User as UserIcon } from 'lucide-react';

interface HistoryPageProps {
  logs: HistoryLog[];
  currentUser: User;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ logs, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | ActionType>('all');

  const canViewHistory = currentUser.role === 'admin' || currentUser.role === 'manager';

  if (!canViewHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-slate-400 mb-4" />
          <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200">Access Restricted</h2>
          <p className="text-slate-500">You do not have permission to view the audit log.</p>
        </div>
      </div>
    );
  }

  // Sort logs by newest first
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = sortedLogs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesFilter;
  });

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'USER_ADD': return 'bg-emerald-500';
      case 'USER_DELETE': return 'bg-rose-500';
      case 'TASK_CREATE': return 'bg-indigo-500';
      case 'TASK_UPDATE': return 'bg-blue-500';
      case 'TASK_DELETE': return 'bg-rose-500';
      case 'LEAD_CREATE': return 'bg-emerald-500';
      case 'LEAD_UPDATE': return 'bg-blue-500';
      case 'LEAD_DELETE': return 'bg-rose-600';
      case 'LEAD_STAGE_CHANGE': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  const getActionLabel = (action: ActionType) => {
    return action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-1">History & Audit</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-thin">Track all critical system activities</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input-base rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          
          <div className="relative">
            <select 
              className="glass-input-base appearance-none rounded-xl px-4 py-2 pr-8 text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as ActionType | 'all')}
            >
              <option value="all">All Actions</option>
              <option value="LEAD_CREATE">Lead Created</option>
              <option value="LEAD_UPDATE">Lead Updated</option>
              <option value="LEAD_STAGE_CHANGE">Pipeline Moves</option>
              <option value="LEAD_DELETE">Lead Deletions</option>
              <option value="TASK_CREATE">Task Created</option>
              <option value="TASK_UPDATE">Task Updates</option>
              <option value="TASK_DELETE">Task Deletions</option>
              <option value="USER_ADD">User Additions</option>
              <option value="USER_DELETE">User Deletions</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <GlassCard className="p-0 overflow-hidden border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target</th>
                <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-indigo-50/50 dark:hover:bg-white/[0.04] transition-colors">
                  <td className="p-4">
                     <Badge color={getActionColor(log.action)}>
                       {getActionLabel(log.action)}
                     </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <UserIcon size={14} className="text-slate-400" />
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{log.userName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{log.details}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">{log.targetName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-slate-500">
                      <Clock size={14} />
                      <span className="text-xs font-medium">{formatTime(log.timestamp)}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                            <Activity size={24} className="opacity-50" />
                        </div>
                        <span>No history logs found.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );
};

export default HistoryPage;
