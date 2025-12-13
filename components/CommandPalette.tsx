
import React, { useState, useEffect, useRef } from 'react';
import { Search, LayoutDashboard, Kanban, CheckSquare, Users, Settings, User as UserIcon, Building, ArrowRight, Command } from 'lucide-react';
import { Lead, Task, View } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  tasks: Task[];
  onNavigate: (view: View) => void;
  onLeadSelect: (lead: Lead) => void;
  onTaskSelect: (task: Task) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  leads, 
  tasks, 
  onNavigate,
  onLeadSelect,
  onTaskSelect 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter Data
  const pages: { id: View; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Go to Pipeline', icon: Kanban },
    { id: 'tasks', label: 'Go to Tasks Board', icon: CheckSquare },
    { id: 'task-feed', label: 'Go to Task Feed', icon: CheckSquare },
    { id: 'lists', label: 'Go to Leads List', icon: Users },
    { id: 'settings', label: 'Go to Settings', icon: Settings },
  ];

  const filteredPages = query ? pages.filter(p => p.label.toLowerCase().includes(query.toLowerCase())) : pages;
  
  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(query.toLowerCase()) || 
    l.company.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // Limit to 5

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // Limit to 5

  const allItems = [
    ...filteredPages.map(item => ({ ...item, type: 'page' as const })),
    ...filteredLeads.map(item => ({ ...item, label: item.name, sub: item.company, type: 'lead' as const, icon: UserIcon })),
    ...filteredTasks.map(item => ({ ...item, label: item.title, sub: item.status, type: 'task' as const, icon: CheckSquare }))
  ];

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems.length > 0) {
          handleSelect(allItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allItems]);

  // Ensure selected item is in view
  useEffect(() => {
    if (listRef.current) {
        const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [selectedIndex]);

  const handleSelect = (item: any) => {
    if (item.type === 'page') {
      onNavigate(item.id);
    } else if (item.type === 'lead') {
      onLeadSelect(item);
    } else if (item.type === 'task') {
      onTaskSelect(item);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white/90 dark:bg-[#15152a]/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-scale-in">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-white/10">
          <Search className="text-slate-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to command or search..."
            className="flex-1 bg-transparent text-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
            }}
          />
          <div className="hidden md:flex gap-1">
             <span className="text-[10px] font-medium text-slate-400 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2" ref={listRef}>
          {allItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            
            return (
              <div
                key={`${item.type}-${item.id}`} // Unique key
                onClick={() => handleSelect(item)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                   <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{item.label}</div>
                  {(item as any).sub && (
                    <div className={`text-xs ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{(item as any).sub}</div>
                  )}
                </div>
                {isSelected && <ArrowRight size={16} className="text-white/70" />}
              </div>
            );
          })}
          
          {allItems.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              No results found.
            </div>
          )}
        </div>
        
        <div className="bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 px-4 py-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
           <div className="flex gap-3">
              <span className="flex items-center gap-1"><Command size={10} /> <span>Search</span></span>
              <span className="flex items-center gap-1"><ArrowRight size={10} /> <span>Select</span></span>
           </div>
           <div>
              <span>{filteredPages.length + filteredLeads.length + filteredTasks.length} results</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
