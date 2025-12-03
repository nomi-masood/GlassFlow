import React, { useState } from 'react';
import { Lead, Stage } from '../types';
import { PIPELINE_COLUMNS } from '../constants';
import { GlassCard, Badge } from './GlassComponents';
import { MoreHorizontal, GripVertical } from 'lucide-react';

interface PipelineProps {
  leads: Lead[];
  onMoveLead: (leadId: string, newStage: Stage) => void;
  onLeadClick: (lead: Lead) => void;
}

const Pipeline: React.FC<PipelineProps> = ({ leads, onMoveLead, onLeadClick }) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: Stage) => {
    e.preventDefault();
    if (draggedLeadId) {
      onMoveLead(draggedLeadId, stageId);
      setDraggedLeadId(null);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-thin text-slate-900 dark:text-white">Pipeline</h1>
        <div className="flex gap-2">
            {/* Filters could go here */}
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex h-full gap-4 min-w-max px-1">
          {PIPELINE_COLUMNS.map((column) => {
            const columnLeads = leads.filter(l => l.stage === column.id);
            const totalValue = columnLeads.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <div 
                key={column.id}
                className="w-80 flex flex-col h-full rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-colors hover:bg-white/60 dark:hover:bg-white/[0.07]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between sticky top-0 bg-inherit rounded-t-2xl z-10 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                    <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200">{column.title}</h3>
                    <span className="text-xs font-medium text-slate-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">{columnLeads.length}</span>
                  </div>
                  <MoreHorizontal size={16} className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer" />
                </div>

                <div className="p-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-center border-b border-slate-200 dark:border-white/5 bg-black/5 dark:bg-black/10">
                   ${totalValue.toLocaleString()}
                </div>

                {/* Drop Zone / List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="cursor-grab active:cursor-grabbing group relative"
                    >
                      <GlassCard 
                        onClick={() => onLeadClick(lead)}
                        className="p-4 hover:border-indigo-500/30 hover:shadow-lg !bg-white/70 dark:!bg-white/[0.02] hover:!bg-white dark:hover:!bg-white/[0.08] backdrop-blur-sm border-slate-200 dark:border-white/5 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge color={column.color}>{lead.tags[0] || 'Lead'}</Badge>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={14} className="text-slate-400 dark:text-slate-500" />
                          </div>
                        </div>
                        
                        <h4 className="text-sm font-medium text-slate-800 dark:text-white mb-0.5">{lead.name}</h4>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">{lead.company}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">${lead.value.toLocaleString()}</span>
                          {lead.avatarUrl && (
                             <img src={lead.avatarUrl} alt="avatar" className="w-5 h-5 rounded-full ring-1 ring-slate-200 dark:ring-white/20" />
                          )}
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                     <div className="h-24 border border-dashed border-slate-300 dark:border-white/10 rounded-xl flex items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-600">
                        Drop here
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;