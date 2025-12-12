
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, User, TaskPriority, Lead, Attachment } from '../types';
import { GlassCard, Badge, GlassButton, GlassInput } from './GlassComponents';
import { Calendar, CheckCircle2, Circle, Clock, MoreHorizontal, Plus, User as UserIcon, Filter, Tag, Edit, Trash, Search, Paperclip, FileText, Image as ImageIcon, X, ArrowUp, ArrowDown, ListFilter, Download, Lock, CheckSquare, Building, AlertCircle } from 'lucide-react';
import { MOCK_USERS } from '../constants';

interface TasksBoardProps {
  tasks: Task[];
  leads: Lead[];
  currentUser: User;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onAddTask: (task: Partial<Task>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TASK_TYPES = ['Follow-up', 'Call', 'Meeting', 'Email', 'Research', 'Admin', 'Proposal'];

const TasksBoard: React.FC<TasksBoardProps> = ({ tasks, leads, currentUser, onUpdateStatus, onAddTask, onEditTask, onDeleteTask }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('mine');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  
  // Modals & Panels State
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  // Menu State
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get local date string YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultTaskState = {
    title: '',
    description: '',
    assigneeId: currentUser.id,
    priority: 'medium' as TaskPriority,
    dueDate: getTodayString(),
    type: 'Follow-up',
    leadId: undefined as string | undefined,
    attachments: [] as Attachment[]
  };

  // Task Form State
  const [newTask, setNewTask] = useState(defaultTaskState);

  // Client Search State
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // Updated columns: 'done' tasks are hidden (finalized). The 3rd column is 'review'.
  const columns: { id: TaskStatus; title: string; color: string; icon: React.ElementType }[] = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-500', icon: Circle },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500', icon: Clock },
    { id: 'review', title: 'Completed (In Review)', color: 'bg-emerald-500', icon: CheckSquare },
  ];

  const filteredTasks = tasks.filter(task => {
    // Hide 'done' (Finalized) tasks from the board
    if (task.status === 'done') return false;

    if (currentUser.role === 'user') return task.assigneeId === currentUser.id;
    return filterMode === 'all' ? true : task.assigneeId === currentUser.id;
  });

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const weightA = priorityWeight[a.priority];
      const weightB = priorityWeight[b.priority];
      return sortOrder === 'desc' ? weightA - weightB : weightB - weightA;
    } else {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  // Permission Helper
  const canEditTask = (task: Task) => {
    // 1. Admin Protection: Tasks assigned to an admin can only be edited by an admin
    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
    if (assignee?.role === 'admin' && currentUser.role !== 'admin') {
      return false;
    }

    // 2. Base Permission: Admin, Manager, or Creator
    const hasPermission = currentUser.role === 'admin' || currentUser.role === 'manager' || task.creatorId === currentUser.id;
    
    // 3. Status Constraint: Only Admins can edit outside of 'todo'
    const isEditableStatus = currentUser.role === 'admin' || task.status === 'todo';
    
    return hasPermission && isEditableStatus;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onUpdateStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const openEditModal = (task: Task) => {
    setNewTask({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assigneeId,
        priority: task.priority,
        dueDate: task.dueDate.split('T')[0], // Ensure YYYY-MM-DD
        type: task.type || 'Follow-up',
        leadId: task.leadId,
        attachments: task.attachments || []
    });
    setEditingTaskId(task.id);
    
    // Set client search based on leadId
    if (task.leadId) {
        const lead = leads.find(l => l.id === task.leadId);
        setClientSearch(lead ? lead.name : '');
    } else {
        setClientSearch('');
    }

    setActiveMenuTaskId(null);
    setViewingTask(null); // Close detail view if open
    setShowAddModal(true);
  };

  const handleSaveTask = () => {
    if (!newTask.title) return;
    
    if (editingTaskId) {
        // Edit Mode
        const taskToUpdate = tasks.find(t => t.id === editingTaskId);
        if (taskToUpdate) {
            onEditTask({
                ...taskToUpdate,
                title: newTask.title,
                description: newTask.description,
                assigneeId: newTask.assigneeId,
                priority: newTask.priority,
                dueDate: newTask.dueDate,
                type: newTask.type,
                leadId: newTask.leadId,
                attachments: newTask.attachments
            });
        }
    } else {
        // Create Mode
        onAddTask({
            title: newTask.title,
            description: newTask.description,
            assigneeId: newTask.assigneeId,
            priority: newTask.priority,
            dueDate: newTask.dueDate,
            type: newTask.type,
            status: 'todo',
            leadId: newTask.leadId,
            attachments: newTask.attachments
        });
    }
    
    // Reset
    setShowAddModal(false);
    setEditingTaskId(null);
    setNewTask({ ...defaultTaskState, assigneeId: currentUser.id });
    setClientSearch('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file), // Mock preview URL
        type: file.type,
        size: file.size
      };
      setNewTask(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      }));
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setNewTask(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || 'Unknown';
  const getUserAvatar = (id: string) => MOCK_USERS.find(u => u.id === id)?.avatarUrl;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-1">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-thin">
            {currentUser.role === 'admin' ? 'Manage all system tasks' : 'Track your priorities'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Sorting Control */}
          <div className="flex items-center bg-white/50 dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/10">
             <div className="relative px-2 border-r border-slate-200 dark:border-white/10">
                 <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
                    className="bg-transparent text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none appearance-none pr-4 cursor-pointer py-1.5"
                 >
                    <option value="date" className="text-slate-900">Due Date</option>
                    <option value="priority" className="text-slate-900">Priority</option>
                 </select>
             </div>
             <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all"
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
             >
                {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
             </button>
          </div>

          {currentUser.role !== 'user' && (
            <div className="flex bg-white/50 dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/10">
              <button 
                onClick={() => setFilterMode('mine')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filterMode === 'mine' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                My Tasks
              </button>
              <button 
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filterMode === 'all' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                All Tasks
              </button>
            </div>
          )}
          
          <button 
            onClick={() => {
                setEditingTaskId(null);
                setNewTask({ ...defaultTaskState, assigneeId: currentUser.id });
                setClientSearch('');
                setShowAddModal(true);
            }}
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory">
        <div className="flex h-full gap-6 px-1 min-w-max">
          {columns.map(col => {
            const colTasks = sortedTasks.filter(t => t.status === col.id);
            const Icon = col.icon;
            
            return (
              <div 
                key={col.id} 
                className="w-[85vw] md:w-96 flex flex-col h-full snap-center shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className={`p-1.5 rounded-lg ${col.color.replace('bg-', 'bg-opacity-10 text-').replace('text-', 'text-')}`}>
                    <Icon size={16} />
                  </div>
                  <h3 className="font-medium text-slate-700 dark:text-slate-200">{col.title}</h3>
                  <Badge color="bg-slate-500">{colTasks.length}</Badge>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-10">
                  {colTasks.map(task => {
                    // Check if current user is the assignee
                    const isAssignee = task.assigneeId === currentUser.id;

                    return (
                      <div
                        key={task.id}
                        draggable={isAssignee}
                        onDragStart={(e) => {
                            if (isAssignee) {
                                handleDragStart(e, task.id);
                            } else {
                                e.preventDefault();
                            }
                        }}
                        onClick={() => setViewingTask(task)}
                        className={`${isAssignee ? "cursor-grab active:cursor-grabbing" : "cursor-default"} relative`}
                        title={!isAssignee ? "Only the user assigned to this task can update its status. Please log in with the assigned account." : ""}
                      >
                        <GlassCard className={`p-4 hover:border-indigo-500/30 hover:shadow-lg !bg-white/70 dark:!bg-white/[0.02] hover:!bg-white dark:hover:!bg-white/[0.08] backdrop-blur-sm border-slate-200 dark:border-white/5 group relative cursor-pointer ${!isAssignee ? 'opacity-75 grayscale-[0.3]' : ''}`}>
                          <div className="flex justify-between items-start mb-2 relative">
                            <div className="flex gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              {task.type && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium">
                                  {task.type}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                                {!isAssignee && (
                                    <div className="p-1 rounded-full bg-slate-100 dark:bg-white/5">
                                        <Lock size={12} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                )}
                                {canEditTask(task) && (
                                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id); }}>
                                    <MoreHorizontal size={16} className="text-slate-400 hover:text-indigo-500 transition-colors" />
                                    </button>
                                )}
                            </div>

                            {activeMenuTaskId === task.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuTaskId(null); }} />
                                  <div className="absolute right-0 top-6 z-20 w-32 glass-panel bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden animate-scale-in">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600 flex items-center gap-2 font-medium"
                                  >
                                    <Edit size={14} /> Edit
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); setActiveMenuTaskId(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                                  >
                                    <Trash size={14} /> Delete
                                  </button>
                                </div>
                                </>
                            )}
                          </div>
                          
                          <h4 className="text-sm font-medium text-slate-800 dark:text-white mb-1">{task.title}</h4>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{task.description || 'No description provided.'}</p>
                          
                          {task.leadId && (
                            <div className="mb-3">
                                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-medium border border-indigo-100 dark:border-indigo-500/20">
                                    Client: {leads.find(l => l.id === task.leadId)?.name || 'Unknown'}
                                </span>
                            </div>
                          )}

                          {task.attachments && task.attachments.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {task.attachments.slice(0, 3).map((att) => (
                                <a 
                                  key={att.id} 
                                  href={att.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="w-6 h-6 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-500 transition-colors" 
                                  title={att.name}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {att.type.includes('image') ? <ImageIcon size={10} /> : <FileText size={10} />}
                                </a>
                              ))}
                              {task.attachments.length > 3 && (
                                <div className="w-6 h-6 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                                  +{task.attachments.length - 3}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <img 
                                src={getUserAvatar(task.assigneeId)} 
                                alt={getUserName(task.assigneeId)}
                                title={`Assigned to ${getUserName(task.assigneeId)}`}
                                className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#1E1E2E]" 
                              />
                              <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                <Calendar size={12} />
                                <span>{new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', timeZone: 'UTC'})}</span>
                              </div>
                            </div>
                            {task.attachments && task.attachments.length > 0 && (
                                <Paperclip size={12} className="text-slate-400" />
                            )}
                          </div>
                        </GlassCard>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
                      <div className="p-3 rounded-full bg-slate-100 dark:bg-white/5">
                        <Clock size={20} className="opacity-50" />
                      </div>
                      <span className="text-xs font-medium">No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Slide-Over */}
      {viewingTask && (
        <>
            <div 
                className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
                onClick={() => setViewingTask(null)}
            />
            <div className="fixed inset-y-0 right-0 w-full md:w-[500px] z-[51] bg-white/95 dark:bg-[#15152a]/95 backdrop-blur-xl border-l border-white/20 shadow-2xl flex flex-col animate-slide-in-right transform transition-transform duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-start bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <Badge color={getPriorityColor(viewingTask.priority).replace('border', 'ring-1').split(' ')[0]}>{viewingTask.priority}</Badge>
                            {viewingTask.type && (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                    {viewingTask.type}
                                </span>
                            )}
                         </div>
                         <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{viewingTask.title}</h2>
                    </div>
                    <button onClick={() => setViewingTask(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Status Section */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</span>
                        <div className="flex items-center gap-2">
                            {viewingTask.status === 'todo' && <Circle size={16} className="text-slate-500" />}
                            {viewingTask.status === 'in-progress' && <Clock size={16} className="text-blue-500" />}
                            {viewingTask.status === 'review' && <CheckSquare size={16} className="text-emerald-500" />}
                            <span className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{viewingTask.status.replace('-', ' ')}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                         <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Description</label>
                         <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {viewingTask.description || <span className="italic text-slate-400">No description provided.</span>}
                         </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Due Date</label>
                            <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-white font-medium">
                                <Calendar size={16} className="text-slate-400" />
                                {new Date(viewingTask.dueDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Priority</label>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border ${getPriorityColor(viewingTask.priority)}`}>
                                {viewingTask.priority === 'high' && <AlertCircle size={14} />}
                                {viewingTask.priority === 'medium' && <Clock size={14} />}
                                {viewingTask.priority === 'low' && <ArrowDown size={14} />}
                                <span className="capitalize">{viewingTask.priority}</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-white/5" />

                    {/* People */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Assignee</label>
                             <div className="flex items-center gap-3">
                                 <img src={getUserAvatar(viewingTask.assigneeId)} alt="assignee" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10" />
                                 <div>
                                     <div className="text-sm font-semibold text-slate-800 dark:text-white">{getUserName(viewingTask.assigneeId)}</div>
                                     <div className="text-xs text-slate-500">Responsible</div>
                                 </div>
                             </div>
                        </div>
                        <div>
                             <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Creator</label>
                             <div className="flex items-center gap-3">
                                 <img src={getUserAvatar(viewingTask.creatorId)} alt="creator" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10" />
                                 <div>
                                     <div className="text-sm font-semibold text-slate-800 dark:text-white">{getUserName(viewingTask.creatorId)}</div>
                                     <div className="text-xs text-slate-500">Reporter</div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Linked Client */}
                    {viewingTask.leadId && (
                        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                             <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                                 <Building size={16} />
                                 <span className="text-xs font-bold uppercase tracking-wide">Linked Client</span>
                             </div>
                             <div className="flex items-center justify-between">
                                 <div>
                                     <div className="text-sm font-bold text-slate-800 dark:text-white">
                                         {leads.find(l => l.id === viewingTask.leadId)?.name}
                                     </div>
                                     <div className="text-xs text-slate-500 dark:text-slate-400">
                                         {leads.find(l => l.id === viewingTask.leadId)?.company}
                                     </div>
                                 </div>
                                 <div className="px-2 py-1 bg-white dark:bg-white/10 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                                     {leads.find(l => l.id === viewingTask.leadId)?.stage}
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* Attachments */}
                    <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                            <Paperclip size={14} /> Attachments ({viewingTask.attachments?.length || 0})
                        </label>
                        {viewingTask.attachments && viewingTask.attachments.length > 0 ? (
                            <div className="space-y-2">
                                {viewingTask.attachments.map(att => (
                                    <a 
                                        key={att.id}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                {att.type.includes('image') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-slate-800 dark:text-white truncate">{att.name}</div>
                                                <div className="text-xs text-slate-500">{formatFileSize(att.size)}</div>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                                            <Download size={16} />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center text-xs text-slate-400">
                                No attachments
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                {canEditTask(viewingTask) && (
                    <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex gap-3">
                         <GlassButton 
                            variant="ghost" 
                            className="flex-1 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            onClick={() => {
                                onDeleteTask(viewingTask.id);
                                setViewingTask(null);
                            }}
                         >
                            <Trash size={16} /> Delete
                         </GlassButton>
                         <GlassButton 
                            className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 border-transparent shadow-lg shadow-indigo-500/20"
                            onClick={() => openEditModal(viewingTask)}
                         >
                            <Edit size={16} /> Edit Task
                         </GlassButton>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </>
      )}

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full h-full md:h-auto md:max-w-md animate-scale-in">
            <GlassCard className="h-full md:h-auto p-4 pt-16 md:p-8 border-white/20 bg-white/95 dark:bg-[#15152a]/95 shadow-2xl flex flex-col">
              <h2 className="text-xl font-thin text-slate-800 dark:text-white mb-6 shrink-0">
                {editingTaskId ? 'Edit Task' : 'Create New Task'}
              </h2>
              
              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-0">
                {/* Task Title and Client Search */}
                <div>
                  <div className="flex justify-between items-center mb-1 ml-1">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Task Title</label>
                  </div>
                  <GlassInput 
                    placeholder="e.g. Follow up with client" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                  
                  {/* Related Client Search */}
                  <div className="mt-2 relative">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Related Client (Optional)</label>
                    <div className="relative">
                        <GlassInput
                            placeholder="Search client name..."
                            value={clientSearch}
                            onChange={(e) => {
                                setClientSearch(e.target.value);
                                setShowClientSuggestions(true);
                                if (e.target.value === '') {
                                    setNewTask({...newTask, leadId: undefined});
                                }
                            }}
                            onFocus={() => setShowClientSuggestions(true)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Search size={14} />
                        </div>
                        
                        {/* Suggestions Dropdown */}
                        {showClientSuggestions && clientSearch.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto glass-panel bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 border border-slate-200 dark:border-white/10">
                                {leads.filter(l => l.name.toLowerCase().includes(clientSearch.toLowerCase()) || l.company.toLowerCase().includes(clientSearch.toLowerCase())).length > 0 ? (
                                    leads.filter(l => l.name.toLowerCase().includes(clientSearch.toLowerCase()) || l.company.toLowerCase().includes(clientSearch.toLowerCase()))
                                        .slice(0, 5)
                                        .map(lead => (
                                            <div 
                                                key={lead.id}
                                                className="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-white/5 cursor-pointer flex flex-col"
                                                onClick={() => {
                                                    setClientSearch(lead.name);
                                                    setNewTask({...newTask, leadId: lead.id, title: newTask.title || `Follow up with ${lead.name}`});
                                                    setShowClientSuggestions(false);
                                                }}
                                            >
                                                <span className="text-sm font-medium text-slate-800 dark:text-white">{lead.name}</span>
                                                <span className="text-xs text-slate-500">{lead.company}</span>
                                            </div>
                                        ))
                                ) : (
                                    <div className="px-4 py-3 text-xs text-slate-500 text-center">No clients found</div>
                                )}
                            </div>
                        )}
                        {/* Backdrop to close suggestions */}
                        {showClientSuggestions && (
                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowClientSuggestions(false)} />
                        )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Description</label>
                  <textarea 
                    className="glass-input-base rounded-xl px-4 py-2 font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full resize-none h-24"
                    placeholder="Add details about this task..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                
                {/* Attachments Section */}
                <div>
                   <div className="flex justify-between items-center mb-1 ml-1">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Attachments</label>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-indigo-500 font-medium hover:text-indigo-400 flex items-center gap-1"
                      >
                         <Plus size={12} /> Add File
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                   </div>
                   
                   {newTask.attachments && newTask.attachments.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {newTask.attachments.map(att => (
                           <div key={att.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group">
                              <div className="flex items-center gap-3 overflow-hidden">
                                 <a 
                                    href={att.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                                 >
                                    {att.type.includes('image') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                 </a>
                                 <div className="flex flex-col min-w-0">
                                    <a 
                                      href={att.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs font-medium text-slate-800 dark:text-white truncate max-w-[150px] hover:text-indigo-500 transition-colors"
                                    >
                                        {att.name}
                                    </a>
                                    <span className="text-[10px] text-slate-500">{formatFileSize(att.size)}</span>
                                 </div>
                              </div>
                              <button 
                                onClick={() => removeAttachment(att.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                        ))}
                      </div>
                   ) : (
                     <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip size={18} className="opacity-50" />
                        <span className="text-xs">No files attached</span>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Due Date</label>
                    <div className="relative">
                      <GlassInput 
                        type="date"
                        min={getTodayString()}
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        className="[color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer"
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Priority</label>
                    <div className="relative">
                      <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none font-medium"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                      >
                        <option value="low" className="text-black">Low</option>
                        <option value="medium" className="text-black">Medium</option>
                        <option value="high" className="text-black">High</option>
                      </select>
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Task Type</label>
                    <div className="relative">
                      <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none font-medium"
                        value={newTask.type}
                        onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                      >
                        {TASK_TYPES.map(type => (
                          <option key={type} value={type} className="text-black">{type}</option>
                        ))}
                      </select>
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Assign To</label>
                    <div className="relative">
                      <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none font-medium"
                        value={newTask.assigneeId}
                        onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
                      >
                        {MOCK_USERS
                          .filter(u => currentUser.role !== 'user' || u.role === 'user')
                          .map(u => (
                            <option key={u.id} value={u.id} className="text-black">{u.name} ({u.role})</option>
                        ))}
                      </select>
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3 shrink-0">
                  <GlassButton variant="ghost" className="flex-1 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => setShowAddModal(false)}>Cancel</GlassButton>
                  <GlassButton className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white border-transparent" onClick={handleSaveTask}>
                    {editingTaskId ? 'Save Changes' : 'Create Task'}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksBoard;
