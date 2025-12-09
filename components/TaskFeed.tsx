
import React, { useState, useEffect } from 'react';
import { Task, User, HistoryLog } from '../types';
import { GlassCard, GlassButton, Badge } from './GlassComponents';
import { CheckCircle2, XCircle, Search, Clock, Calendar, User as UserIcon, ArrowLeft, RefreshCw, X, UserPlus, RotateCcw, ArrowRight, Square, CheckSquare, Tag, AlertCircle, History, ChevronDown, ChevronUp, Activity, ArrowDown } from 'lucide-react';

interface TaskFeedProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  historyLogs: HistoryLog[];
  onAccept: (taskId: string) => void;
  onDecline: (taskId: string, newAssigneeId?: string) => void;
  onBatchAccept: (taskIds: string[]) => void;
  onBatchDecline: (taskIds: string[], newAssigneeId?: string) => void;
}

const TaskFeed: React.FC<TaskFeedProps> = ({ tasks, users, currentUser, historyLogs, onAccept, onDecline, onBatchAccept, onBatchDecline }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Expanded History State
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());

  // Modal State
  const [declineModal, setDeclineModal] = useState<{ 
    show: boolean; 
    task: Task | null;
    isBatch?: boolean;
  }>({ show: false, task: null, isBatch: false });
  
  const [declineStep, setDeclineStep] = useState<'choice' | 'reassign'>('choice');
  const [reassignId, setReassignId] = useState<string>('');

  // Filter tasks: Created by current user AND status is 'review'
  const reviewTasks = tasks.filter(task => 
    task.creatorId === currentUser.id && 
    task.status === 'review' &&
    (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     task.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Clear selection if filtered tasks change significantly (optional, but good for consistency)
  useEffect(() => {
    // Optionally clear selection on search change, or keep it. Keeping it allows searching to find more to select.
    // For now, we will just ensure that selected IDs are valid if needed, but Sets are safe.
  }, [searchTerm]);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';
  const getUserAvatar = (id: string) => users.find(u => u.id === id)?.avatarUrl;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
          border: 'border-l-rose-500',
          icon: AlertCircle
        };
      case 'medium':
        return {
          badge: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
          border: 'border-l-orange-500',
          icon: Clock
        };
      case 'low':
        return {
          badge: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
          border: 'border-l-blue-500',
          icon: ArrowDown
        };
      default:
        return {
          badge: 'text-slate-600 bg-slate-50 border-slate-200',
          border: 'border-l-slate-300',
          icon: Clock
        };
    }
  };

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === reviewTasks.length && reviewTasks.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviewTasks.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleHistory = (taskId: string) => {
    const newSet = new Set(expandedHistory);
    if (newSet.has(taskId)) newSet.delete(taskId);
    else newSet.add(taskId);
    setExpandedHistory(newSet);
  };

  // Action Handlers
  const openDeclineModal = (task: Task) => {
    setDeclineModal({ show: true, task, isBatch: false });
    setDeclineStep('choice');
    setReassignId(task.assigneeId);
  };

  const openBatchDeclineModal = () => {
    if (selectedIds.size === 0) return;
    setDeclineModal({ show: true, task: null, isBatch: true });
    setDeclineStep('choice');
    setReassignId(users[0]?.id || ''); // Default to first user for batch reassign
  };

  const closeDeclineModal = () => {
    setDeclineModal({ show: false, task: null, isBatch: false });
    setDeclineStep('choice');
  };

  const handleBatchAccept = () => {
    onBatchAccept(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleReassignToSame = () => {
    if (declineModal.isBatch) {
      // For batch, "same" means keeping original assignee for each task
      onBatchDecline(Array.from(selectedIds)); // No newAssigneeId implies keep original
      setSelectedIds(new Set());
    } else if (declineModal.task) {
      onDecline(declineModal.task.id, declineModal.task.assigneeId);
    }
    closeDeclineModal();
  };

  const handleConfirmReassign = () => {
    if (declineModal.isBatch) {
      onBatchDecline(Array.from(selectedIds), reassignId);
      setSelectedIds(new Set());
    } else if (declineModal.task) {
      onDecline(declineModal.task.id, reassignId);
    }
    closeDeclineModal();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-1">Task Feed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-thin">Review completed tasks pending your approval</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search pending tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input-base rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Batch Actions Toolbar */}
      {reviewTasks.length > 0 && (
        <div className="flex items-center justify-between mb-2 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all">
            <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors group"
            >
                {selectedIds.size === reviewTasks.length ? (
                    <CheckSquare size={20} className="text-indigo-500" />
                ) : (
                    <Square size={20} className="text-slate-400 group-hover:text-indigo-500" />
                )}
                <span>Select All ({reviewTasks.length})</span>
            </button>

            <div className={`flex items-center gap-3 transition-opacity duration-300 ${selectedIds.size > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-2 hidden sm:inline">{selectedIds.size} selected</span>
                <button 
                    onClick={openBatchDeclineModal} 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                >
                    <XCircle size={14} /> Decline
                </button>
                <button 
                    onClick={handleBatchAccept} 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                >
                    <CheckCircle2 size={14} /> Accept
                </button>
            </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto pb-6">
          {reviewTasks.map(task => {
            const isSelected = selectedIds.has(task.id);
            const isHistoryOpen = expandedHistory.has(task.id);
            const pConfig = getPriorityConfig(task.priority);
            const PriorityIcon = pConfig.icon;
            
            // Get relevant logs and sort by newest first
            const taskLogs = historyLogs.filter(h => h.targetId === task.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            return (
              <GlassCard 
                key={task.id} 
                className={`p-0 flex flex-col md:flex-row items-stretch group hover:border-indigo-500/30 transition-all overflow-hidden ${isSelected ? 'border-indigo-500/40 bg-indigo-50/10 dark:bg-indigo-900/10' : ''}`}
              >
                {/* Selection Strip with Priority Border */}
                <div 
                    className={`w-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 cursor-pointer bg-slate-50/50 dark:bg-white/[0.02] hover:bg-indigo-50/50 dark:hover:bg-white/[0.05] transition-colors shrink-0 border-l-4 ${pConfig.border}`}
                    onClick={() => toggleSelect(task.id)}
                >
                    {isSelected ? (
                        <CheckSquare size={20} className="text-indigo-500" />
                    ) : (
                        <Square size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400" />
                    )}
                </div>

                <div className="flex-1 p-5 flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div className="flex-1 w-full">
                        {/* Header Row: Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                           <Badge color="bg-emerald-500">Review Pending</Badge>
                           <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium uppercase tracking-wider flex items-center gap-1 ${pConfig.badge}`}>
                              <PriorityIcon size={12} />
                              {task.priority} Priority
                           </span>
                           {task.type && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 flex items-center gap-1">
                                <Tag size={10} /> {task.type}
                              </span>
                           )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">{task.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 line-clamp-1">{task.description || 'No description provided.'}</p>
                        
                        {/* Metadata Grid */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                            {/* Assignee */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img 
                                        src={getUserAvatar(task.assigneeId)} 
                                        alt={getUserName(task.assigneeId)}
                                        className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#1E1E2E]"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white dark:border-[#1E1E2E]">
                                        <CheckCircle2 size={8} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Completed By</div>
                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{getUserName(task.assigneeId)}</div>
                                </div>
                            </div>

                            {/* Divider for desktop */}
                            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/10" />

                            {/* Due Date */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-500/20">
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Due Date</div>
                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Log - Concise Default */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                            {taskLogs.length > 0 ? (
                            <div>
                                <button 
                                    onClick={() => toggleHistory(task.id)}
                                    className="w-full flex items-center justify-between group/history text-left"
                                >
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <div className={`p-1 rounded-full ${isHistoryOpen ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
                                            <Activity size={12} />
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{taskLogs[0].userName}</span>
                                            <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                            <span className="truncate max-w-[150px] sm:max-w-[250px]">
                                                {taskLogs[0].details.replace(task.title, '').replace(':', '').trim() || 'Updated task'}
                                            </span>
                                            <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                            <span className="opacity-70">{formatTimeAgo(taskLogs[0].timestamp)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-500 opacity-60 group-hover/history:opacity-100 transition-opacity">
                                        {isHistoryOpen ? 'Collapse' : (taskLogs.length > 1 ? `${taskLogs.length - 1} more updates` : 'Details')}
                                        {isHistoryOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </div>
                                </button>

                                {isHistoryOpen && (
                                    <div className="mt-4 pl-2 space-y-4 relative border-l border-slate-200 dark:border-white/10 ml-2.5 animate-fade-in-up">
                                        {taskLogs.map((log, i) => (
                                            <div key={log.id} className="relative pl-4">
                                                <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1E1E2E] ${i === 0 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                <div className="text-xs">
                                                    <span className="font-semibold text-slate-800 dark:text-white">{log.userName}</span>
                                                    <span className="text-slate-500 dark:text-slate-400 ml-1">{log.details.replace(task.title, '').replace(':', '').trim()}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic flex items-center gap-2 py-1">
                                    <Clock size={12} /> No activity recorded
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5 shrink-0 self-start">
                        <GlassButton 
                        variant="ghost" 
                        onClick={() => openDeclineModal(task)}
                        className="flex-1 md:flex-none text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200"
                        >
                        <XCircle size={18} /> <span className="md:hidden">Decline</span>
                        </GlassButton>
                        <GlassButton 
                        onClick={() => onAccept(task.id)}
                        className="flex-1 md:flex-none bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white border-transparent shadow-lg shadow-emerald-500/20"
                        >
                        <CheckCircle2 size={18} /> Accept
                        </GlassButton>
                    </div>
                </div>
              </GlassCard>
            );
          })}

          {reviewTasks.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">All caught up!</h3>
              <p className="text-slate-500 dark:text-slate-400">You have no tasks pending review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Decline/Reassign Modal */}
      {declineModal.show && (declineModal.task || declineModal.isBatch) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeDeclineModal} />
          <div className="relative w-full max-w-md animate-scale-in">
            <GlassCard className="p-6 border-white/20 bg-white/90 dark:bg-[#15152a]/95 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-slate-800 dark:text-white">
                    {declineModal.isBatch ? 'Decline Multiple Tasks' : 'Decline Task Completion'}
                </h2>
                <button onClick={closeDeclineModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {declineStep === 'choice' ? (
                <>
                  <div className="mb-6">
                    {declineModal.isBatch ? (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                             You are declining the completion of <span className="font-semibold text-slate-900 dark:text-white">{selectedIds.size} tasks</span>.
                        </p>
                    ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                             You are declining the completion of <span className="font-semibold text-slate-900 dark:text-white">"{declineModal.task?.title}"</span>.
                        </p>
                    )}
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {declineModal.isBatch 
                            ? "How would you like to handle reassignment?" 
                            : <>Would you like to reassign this task to <span className="font-semibold">{getUserName(declineModal.task?.assigneeId || '')}</span> or assign it to someone else?</>
                        }
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleReassignToSame}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                          <RotateCcw size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-slate-800 dark:text-white">
                            {declineModal.isBatch 
                                ? "Return to original assignees" 
                                : `Reassign to ${getUserName(declineModal.task?.assigneeId || '')}`
                            }
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Task returns to their Todo list</div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500" />
                    </button>

                    <button 
                      onClick={() => setDeclineStep('reassign')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                          <UserPlus size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-slate-800 dark:text-white">
                            {declineModal.isBatch ? "Assign all to different user" : "Assign to different user"}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Select a new assignee</div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-6 animate-fade-in-up">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Select a new user to assign {declineModal.isBatch ? 'these tasks' : 'this task'} to.
                    </p>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Assignee</label>
                      <div className="relative">
                        <select 
                          className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none font-medium"
                          value={reassignId}
                          onChange={(e) => setReassignId(e.target.value)}
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.id} className="text-black">
                              {u.name} {!declineModal.isBatch && u.id === declineModal.task?.assigneeId ? '(Current)' : ''}
                            </option>
                          ))}
                        </select>
                        <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <GlassButton 
                        variant="ghost" 
                        onClick={() => setDeclineStep('choice')}
                        className="flex-1"
                    >
                        Back
                    </GlassButton>
                    <GlassButton 
                        onClick={handleConfirmReassign}
                        className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white border-transparent"
                    >
                        Confirm Reassignment
                    </GlassButton>
                  </div>
                </>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFeed;
