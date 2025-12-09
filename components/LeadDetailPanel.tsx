
import React, { useState, useEffect } from 'react';
import { Lead, Task, HistoryLog, Stage, LeadActivity, LeadActivityType } from '../types';
import { PIPELINE_COLUMNS } from '../constants';
import { GlassCard, GlassButton, Badge, GlassInput } from './GlassComponents';
import { X, Mail, Building, DollarSign, Calendar, Tag, FileText, CheckSquare, Clock, Edit, Save, Activity, ChevronDown, Phone, Users, Plus, MessageSquare } from 'lucide-react';

interface LeadDetailPanelProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  linkedTasks: Task[];
  history: HistoryLog[];
  onUpdateNotes: (leadId: string, notes: string) => void;
  onAddActivity: (leadId: string, activity: LeadActivity) => void;
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
  onAddActivity,
  onEditLead,
  onStageChange
}) => {
  // Activity Log State
  const [activeTab, setActiveTab] = useState<'all' | LeadActivityType>('all');
  const [showLogForm, setShowLogForm] = useState(false);
  
  // New Activity Form State
  const defaultActivityState = {
    type: 'note' as LeadActivityType,
    summary: '',
    details: '',
    outcome: '',
    duration: '',
    date: new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
  };
  const [newActivity, setNewActivity] = useState(defaultActivityState);

  // Reset state when lead changes
  useEffect(() => {
    setShowLogForm(false);
    setNewActivity(defaultActivityState);
  }, [lead]);

  if (!lead) return null;

  const handleLogActivity = () => {
    if (!newActivity.summary) return;
    
    const activity: LeadActivity = {
        id: Math.random().toString(36).substr(2, 9),
        type: newActivity.type,
        summary: newActivity.summary,
        details: newActivity.details,
        outcome: newActivity.outcome,
        duration: newActivity.duration,
        date: newActivity.date
    };

    onAddActivity(lead.id, activity);
    setShowLogForm(false);
    setNewActivity(defaultActivityState);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'won': return 'bg-emerald-500';
      case 'lost': return 'bg-rose-500';
      default: return 'bg-indigo-500';
    }
  };

  const getActivityIcon = (type: LeadActivityType) => {
    switch (type) {
        case 'call': return Phone;
        case 'email': return Mail;
        case 'meeting': return Users;
        default: return FileText;
    }
  };

  const getActivityColor = (type: LeadActivityType) => {
    switch (type) {
        case 'call': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
        case 'email': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
        case 'meeting': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
        default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const filteredActivities = (lead.activities || []).filter(a => activeTab === 'all' || a.type === activeTab);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-white/95 dark:bg-[#15152a]/95 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-start bg-slate-50/50 dark:bg-white/[0.02]">
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
          
          {/* Quick Stats & Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <GlassCard className="p-4 !bg-indigo-500/5 border-indigo-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Activity size={16} />
                    <span className="text-xs font-bold uppercase tracking-wide">Stage</span>
                </div>
                <div className="relative w-40">
                    <select 
                    className="w-full appearance-none bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer py-1 pr-6 text-right"
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
            
             <div className="col-span-2 space-y-3 px-1">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Mail size={16} /> Email
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{lead.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar size={16} /> Last Active
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{lead.lastActive}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {lead.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                        <Tag size={10} /> {tag}
                    </span>
                    ))}
                    <button onClick={() => onEditLead(lead)} className="text-xs px-2.5 py-1 rounded-md text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-1 ml-auto">
                         <Edit size={12} /> Edit
                    </button>
                </div>
             </div>
          </div>

          <hr className="border-slate-100 dark:border-white/5" />

          {/* Activity Log Section (Replacing old Notes) */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                 <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                     <MessageSquare size={16} /> Activity Log
                 </h3>
                 {!showLogForm && (
                     <button 
                        onClick={() => setShowLogForm(true)}
                        className="text-xs flex items-center gap-1 px-3 py-1.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
                     >
                        <Plus size={14} /> Log Activity
                     </button>
                 )}
             </div>

             {/* Legacy Note (Pinned) */}
             {lead.notes && (
                 <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl mb-4">
                     <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-wide mb-1">
                         <FileText size={12} /> Pinned Note
                     </div>
                     <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{lead.notes}</p>
                 </div>
             )}

             {/* Log Activity Form */}
             {showLogForm && (
                 <GlassCard className="p-4 border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-500/5 animate-scale-in">
                     <div className="flex justify-between items-center mb-4">
                         <span className="text-sm font-semibold text-slate-800 dark:text-white">New Entry</span>
                         <button onClick={() => setShowLogForm(false)}><X size={16} className="text-slate-400" /></button>
                     </div>
                     
                     <div className="space-y-3">
                         {/* Type Selector */}
                         <div className="flex gap-2">
                             {(['note', 'call', 'email', 'meeting'] as LeadActivityType[]).map(type => {
                                 const Icon = getActivityIcon(type);
                                 const isSelected = newActivity.type === type;
                                 return (
                                     <button
                                         key={type}
                                         onClick={() => setNewActivity({...newActivity, type})}
                                         className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-all ${isSelected ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10'}`}
                                     >
                                         <Icon size={16} />
                                         <span className="text-[10px] uppercase font-bold">{type}</span>
                                     </button>
                                 )
                             })}
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <GlassInput 
                                    placeholder={newActivity.type === 'call' ? "Who did you speak with?" : "Summary header..."}
                                    value={newActivity.summary}
                                    onChange={(e) => setNewActivity({...newActivity, summary: e.target.value})}
                                    className="bg-white/50 dark:bg-black/20"
                                />
                            </div>
                            
                            <div>
                                <input 
                                    type="datetime-local"
                                    value={newActivity.date}
                                    onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                                    className="w-full glass-input-base rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white bg-white/50 dark:bg-black/20 focus:outline-none"
                                />
                            </div>

                            {(newActivity.type === 'call' || newActivity.type === 'meeting') && (
                                <div>
                                    <GlassInput 
                                        placeholder="Outcome (e.g. Connected)"
                                        value={newActivity.outcome}
                                        onChange={(e) => setNewActivity({...newActivity, outcome: e.target.value})}
                                        className="bg-white/50 dark:bg-black/20"
                                    />
                                </div>
                            )}
                         </div>

                         <textarea
                             placeholder="Add detailed notes..."
                             value={newActivity.details}
                             onChange={(e) => setNewActivity({...newActivity, details: e.target.value})}
                             className="w-full h-24 glass-input-base rounded-xl p-3 text-sm font-medium text-slate-800 dark:text-slate-200 bg-white/50 dark:bg-black/20 focus:outline-none focus:border-indigo-500/50 resize-none"
                         />
                         
                         <GlassButton onClick={handleLogActivity} className="w-full justify-center bg-indigo-600 dark:bg-indigo-500 text-white">
                             Save Activity
                         </GlassButton>
                     </div>
                 </GlassCard>
             )}

             {/* Activity List Tabs */}
             {!showLogForm && (
                 <div className="flex gap-2 pb-2 overflow-x-auto">
                     {(['all', 'call', 'email', 'meeting', 'note'] as const).map(tab => (
                         <button
                             key={tab}
                             onClick={() => setActiveTab(tab)}
                             className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${activeTab === tab ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400'}`}
                         >
                             {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                         </button>
                     ))}
                 </div>
             )}

             {/* Timeline */}
             <div className="space-y-4 relative pl-4 border-l border-slate-200 dark:border-white/10 ml-2">
                {filteredActivities.length > 0 ? filteredActivities.map(activity => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClasses = getActivityColor(activity.type);
                    
                    return (
                        <div key={activity.id} className="relative group">
                            <div className={`absolute -left-[27px] top-0 w-8 h-8 rounded-full border-2 border-white dark:border-[#15152a] flex items-center justify-center z-10 ${colorClasses}`}>
                                <Icon size={14} />
                            </div>
                            <div className="pl-4 pb-4">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-800 dark:text-white text-sm">{activity.summary}</span>
                                        {activity.outcome && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                                {activity.outcome}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400">{new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                                    {activity.details || 'No details provided.'}
                                </p>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-2 text-slate-400">
                            <Clock size={18} />
                        </div>
                        <p className="text-xs text-slate-400">No {activeTab === 'all' ? '' : activeTab} activities logged yet.</p>
                    </div>
                )}
             </div>
          </div>

          <hr className="border-slate-100 dark:border-white/5" />

          {/* Linked Tasks */}
          <div>
             <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                 <CheckSquare size={16} /> Linked Tasks
             </h3>
             <div className="space-y-2">
                {linkedTasks.length > 0 ? linkedTasks.map(task => (
                   <div key={task.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between hover:border-indigo-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                         <span className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                           {task.title}
                         </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">{task.priority}</span>
                   </div>
                )) : (
                   <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center">
                       <p className="text-xs text-slate-400 italic">No tasks linked to this lead.</p>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default LeadDetailPanel;
