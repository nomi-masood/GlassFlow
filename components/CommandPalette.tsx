
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

