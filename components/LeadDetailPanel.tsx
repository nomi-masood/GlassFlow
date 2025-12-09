
import React, { useState, useEffect } from 'react';
import { Lead, Task, HistoryLog, Stage } from '../types';
import { PIPELINE_COLUMNS } from '../constants';
import { GlassCard, GlassButton, Badge } from './GlassComponents';
import { X, Mail, Building, DollarSign, Calendar, Tag, FileText, CheckSquare, Clock, Edit, Save, Activity, ChevronDown } from 'lucide-react';

interface LeadDetailPanelProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  linkedTasks: Task[];
  history: HistoryLog[];
  onUpdateNotes: (leadId: string, notes: string) => void;
  onEditLead: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: Stage) => void;
}

const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({ 
  lead, 
  isOpen, 
  onClose, 
  linkedTasks, 
  history,
  onUpdateNotes,
  onEditLead,
  onStageChange
}) => {
  const [notes, setNotes] = useState('');
  const [isNotesDirty, setIsNotesDirty] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '');
      setIsNotesDirty(false);
    }
  }, [lead]);

  if (!lead) return null;

  const handleSaveNotes = () => {
    onUpdateNotes(lead.id, notes);
    setIsNotesDirty(false);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'won': return 'bg-emerald-500';
      case 'lost': return 'bg-rose-500';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-white/90 dark:bg-[#15152a]/95 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-lg">
               <img src={lead.avatarUrl} alt={lead.name} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#15152a]" />
            </div>
            <div>
              <h2 className="text-2xl font-thin text-slate-900 dark:text-white">{lead.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Building size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{lead.company}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4">
            <GlassCard className="p-4 !bg-indigo-500/5 border-indigo-500/10">
               <div className="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-400">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Stage</span>
              </div>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer py-1 pr-6"
                  value={lead.stage}
                  onChange={(e) => onStageChange(lead.id, e.target.value as Stage)}
                >
                  {PIPELINE_COLUMNS.map(col => (
                    <option key={col.id} value={col.id} className="text-slate-900 bg-white dark:bg-slate-800">{col.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-indigo-500/50 pointer-events-none" size={14} />
              </div>
            </GlassCard>
          </div>

          {/* Details */}
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{lead.email}</span>
             </div>
             <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">Last active: {lead.lastActive}</span>
             </div>
             <div className="flex flex-wrap gap-2 mt-2">
                {lead.tags.map(tag => (
                   <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                      <Tag size={10} /> {tag}
                   </span>
                ))}
             </div>
             
             <GlassButton onClick={() => onEditLead(lead)} variant="ghost" className="w-full mt-2 text-indigo-500 justify-center">
                <Edit size={14} /> Edit Lead Details
             </GlassButton>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                 <FileText size={16} /> Notes
               </h3>
               {isNotesDirty && (
                 <button onClick={handleSaveNotes} className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-medium animate-pulse">
                    <Save size={12} /> Save
                 </button>
               )}
            </div>
            <textarea
               value={notes}
               onChange={(e) => { setNotes(e.target.value); setIsNotesDirty(true); }}
               placeholder="Add notes about this lead..."
               className="w-full h-32 glass-input-base rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none transition-all"
            />
          </div>

          {/* Linked Tasks */}
          <div>
             <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                 <CheckSquare size={16} /> Linked Tasks
             </h3>
             <div className="space-y-2">
                {linkedTasks.length > 0 ? linkedTasks.map(task => (
                   <div key={task.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                         <span className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                           {task.title}
                         </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{task.priority}</span>
                   </div>
                )) : (
                   <p className="text-sm text-slate-400 italic px-2">No active tasks.</p>
                )}
             </div>
          </div>

          {/* Activity Timeline */}
          <div>
             <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                 <Clock size={16} /> Timeline
             </h3>
             <div className="space-y-4 relative pl-2">
                {/* Timeline Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />
                
                {history.length > 0 ? history.map(log => (
                   <div key={log.id} className="relative flex gap-4 items-start group">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/10 flex items-center justify-center z-10 shrink-0">
                         <Activity size={12} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 pb-2">
                         <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-tight">{log.details}</p>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-xs text-slate-400">{log.userName}</span>
                         </div>
                      </div>
                   </div>
                )) : (
                   <p className="text-sm text-slate-400 italic px-8">No recorded activity.</p>
                )}
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default LeadDetailPanel;
