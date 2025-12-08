import React, { useState } from 'react';
import { Task, User } from '../types';
import { GlassCard, GlassButton, Badge } from './GlassComponents';
import { CheckCircle2, XCircle, Search, Clock, Calendar, User as UserIcon, ArrowLeft, RefreshCw, X, UserPlus, RotateCcw, ArrowRight } from 'lucide-react';

interface TaskFeedProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  onAccept: (taskId: string) => void;
  onDecline: (taskId: string, newAssigneeId?: string) => void;
}

const TaskFeed: React.FC<TaskFeedProps> = ({ tasks, users, currentUser, onAccept, onDecline }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [declineModal, setDeclineModal] = useState<{ show: boolean; task: Task | null }>({ show: false, task: null });
  const [declineStep, setDeclineStep] = useState<'choice' | 'reassign'>('choice');
  const [reassignId, setReassignId] = useState<string>('');

  // Filter tasks: Created by current user AND status is 'review'
  const reviewTasks = tasks.filter(task => 
    task.creatorId === currentUser.id && 
    task.status === 'review' &&
    (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     task.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';
  const getUserAvatar = (id: string) => users.find(u => u.id === id)?.avatarUrl;

  const openDeclineModal = (task: Task) => {
    setDeclineModal({ show: true, task });
    setDeclineStep('choice');
    setReassignId(task.assigneeId); // Default to current assignee
  };

  const closeDeclineModal = () => {
    setDeclineModal({ show: false, task: null });
    setDeclineStep('choice');
  };

  const handleReassignToSame = () => {
    if (declineModal.task) {
      onDecline(declineModal.task.id, declineModal.task.assigneeId);
      closeDeclineModal();
    }
  };

  const handleConfirmReassign = () => {
    if (declineModal.task) {
      onDecline(declineModal.task.id, reassignId);
      closeDeclineModal();
    }
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

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
          {reviewTasks.map(task => (
            <GlassCard key={task.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:border-indigo-500/30 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge color="bg-emerald-500">Pending Review</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> Completed recently
                  </span>
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">{task.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{task.description || 'No description provided.'}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <img 
                      src={getUserAvatar(task.assigneeId)} 
                      alt={getUserName(task.assigneeId)}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>Done by <span className="font-medium text-slate-900 dark:text-white">{getUserName(task.assigneeId)}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
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
            </GlassCard>
          ))}

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
      {declineModal.show && declineModal.task && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeDeclineModal} />
          <div className="relative w-full max-w-md animate-scale-in">
            <GlassCard className="p-6 border-white/20 bg-white/90 dark:bg-[#15152a]/95 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-slate-800 dark:text-white">Decline Task Completion</h2>
                <button onClick={closeDeclineModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {declineStep === 'choice' ? (
                <>
                  <div className="mb-6">
                     <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      You are declining the completion of <span className="font-semibold text-slate-900 dark:text-white">"{declineModal.task.title}"</span>.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Would you like to reassign this task to <span className="font-semibold">{getUserName(declineModal.task.assigneeId)}</span> or assign it to someone else?
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
                          <div className="text-sm font-semibold text-slate-800 dark:text-white">Reassign to {getUserName(declineModal.task.assigneeId)}</div>
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
                          <div className="text-sm font-semibold text-slate-800 dark:text-white">Assign to different user</div>
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
                      Select a new user to assign this task to.
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
                              {u.name} {u.id === declineModal.task?.assigneeId ? '(Current)' : ''}
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
                      <ArrowLeft size={16} /> Back
                    </GlassButton>
                    <GlassButton 
                      onClick={handleConfirmReassign}
                      className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white"
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
