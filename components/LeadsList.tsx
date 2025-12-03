
import React, { useRef, useState, useEffect } from 'react';
import { Lead } from '../types';
import { Badge, GlassInput } from './GlassComponents';
import { Search, Filter, Plus, Upload, Trash2, CheckSquare, Square, MoreVertical, X, ChevronDown, Edit } from 'lucide-react';
import { PIPELINE_COLUMNS } from '../constants';

interface LeadsListProps {
  leads: Lead[];
  onImport: (file: File) => void;
  onAdd: () => void;
  onEdit: (lead: Lead) => void;
  onBulkDelete: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

const LEAD_SOURCES = ['Direct', 'Social', 'Referral', 'Ads'];
const LEAD_TYPES = ['Inbound', 'Outbound', 'Referral', 'Partner', 'Cold'];

const LeadsList: React.FC<LeadsListProps> = ({ leads, onImport, onAdd, onEdit, onBulkDelete, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    stage: 'all',
    source: 'all',
    type: 'all'
  });

  // Derived filtered leads
  const filteredLeads = leads.filter(lead => {
    // Search Text
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchLower) ||
      lead.company.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower);

    // Filters
    const matchesStage = filters.stage === 'all' || lead.stage === filters.stage;
    const matchesSource = filters.source === 'all' || lead.source === filters.source;
    const matchesType = filters.type === 'all' || lead.type === filters.type;

    return matchesSearch && matchesStage && matchesSource && matchesType;
  });

  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedIds(new Set());
    }
  }, [isSelectionMode, filters, searchTerm]); // Reset selection on filter change too

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSelectAll = () => {
    if (isSelectionMode && selectedIds.size === filteredLeads.length && filteredLeads.length > 0) {
      // If already in mode and all visible selected, exit mode
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    } else {
      // Enter mode and select all visible
      setIsSelectionMode(true);
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (!isSelectionMode) return;
    
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} leads? This action cannot be undone.`)) {
      onBulkDelete(Array.from(selectedIds));
      setIsSelectionMode(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ stage: 'all', source: 'all', type: 'all' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-1">All Leads</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm font-thin">Manage your contacts and companies</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {selectedIds.size > 0 ? (
             <button 
               onClick={handleBulkDelete}
               className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-sm font-medium flex items-center gap-2 animate-scale-in transition-all"
             >
               <Trash2 size={16} />
               <span>Delete ({selectedIds.size})</span>
             </button>
          ) : (
            <>
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full glass-input-base rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv" 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 glass-input-base rounded-xl text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                title="Import CSV"
              >
                <Upload size={18} />
                <span className="hidden sm:inline text-sm font-medium">Import</span>
              </button>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 glass-input-base rounded-xl transition-all ${showFilters ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}
                title="Toggle Filters"
              >
                <Filter size={20} />
              </button>
            </>
          )}
          
          <button 
            onClick={onAdd}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 animate-fade-in-up">
            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Stage</label>
                <div className="relative">
                    <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                        value={filters.stage}
                        onChange={(e) => setFilters({...filters, stage: e.target.value})}
                    >
                        <option value="all" className="text-black">All Stages</option>
                        {PIPELINE_COLUMNS.map(col => (
                            <option key={col.id} value={col.id} className="text-black">{col.title}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Source</label>
                <div className="relative">
                    <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                        value={filters.source}
                        onChange={(e) => setFilters({...filters, source: e.target.value})}
                    >
                        <option value="all" className="text-black">All Sources</option>
                        {LEAD_SOURCES.map(src => (
                            <option key={src} value={src} className="text-black">{src}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Type</label>
                <div className="relative">
                    <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                    >
                        <option value="all" className="text-black">All Types</option>
                        {LEAD_TYPES.map(type => (
                            <option key={type} value={type} className="text-black">{type}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>
            
            {(filters.stage !== 'all' || filters.source !== 'all' || filters.type !== 'all') && (
                <div className="md:col-span-3 flex justify-end">
                    <button 
                        onClick={clearFilters}
                        className="text-xs font-medium text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                    >
                        <X size={12} /> Clear Filters
                    </button>
                </div>
            )}
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-visible border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="p-4 w-12 first:rounded-tl-2xl">
                <button 
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center"
                  aria-label={isSelectionMode ? "Deselect all" : "Select all"}
                  title={isSelectionMode ? "Exit selection mode" : "Select all visible"}
                >
                  {isSelectionMode && selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? (
                    <CheckSquare size={18} className="text-indigo-500" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stage</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Active</th>
              <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider last:rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredLeads.map((lead) => {
              const isSelected = selectedIds.has(lead.id);
              return (
                <tr 
                  key={lead.id} 
                  className={`group hover:bg-indigo-50/50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                  onClick={() => toggleSelectOne(lead.id)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {isSelectionMode && (
                        <button 
                          onClick={() => toggleSelectOne(lead.id)}
                          className="text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center animate-scale-in"
                          aria-label={`Select ${lead.name}`}
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-indigo-500" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-medium text-white shadow-inner">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-white">{lead.name}</div>
                        <div className="text-xs font-medium text-slate-500">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">{lead.company}</td>
                  <td className="p-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                      {lead.source || lead.type || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">${lead.value.toLocaleString()}</td>
                  <td className="p-4">
                    <Badge color={
                      lead.stage === 'won' ? 'bg-emerald-500' : 
                      lead.stage === 'lost' ? 'bg-rose-500' : 'bg-indigo-500'
                    }>
                      {lead.stage}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-500">{lead.lastActive}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           onEdit(lead);
                         }}
                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-all"
                         title="Edit Lead"
                         aria-label={`Edit ${lead.name}`}
                       >
                         <Edit size={18} />
                       </button>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           if(window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
                             onDelete(lead.id);
                           }
                         }}
                         className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                         title="Delete Lead"
                         aria-label={`Delete ${lead.name}`}
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredLeads.length === 0 && (
                <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                        {searchTerm || filters.stage !== 'all' ? 'No leads found matching your criteria.' : 'No leads available.'}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsList;
