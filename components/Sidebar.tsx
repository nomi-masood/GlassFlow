
import React from 'react';
import { LayoutDashboard, Kanban, Users, CreditCard, Settings, LogOut, Zap, Moon, Sun, CheckSquare, UserCog } from 'lucide-react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isDark: boolean;
  toggleTheme: () => void;
  user?: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isDark, toggleTheme, user, onLogout }) => {
  const menuItems: { id: View; icon: React.ElementType; label: string; roles?: string[] }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pipeline', icon: Kanban, label: 'Pipeline' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'lists', icon: Users, label: 'Leads' },
    { id: 'users', icon: UserCog, label: 'Users', roles: ['admin', 'manager'] },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-64 glass-panel border-r border-white/10 dark:border-white/10 flex flex-col z-50 transition-all duration-300">
      <div className="p-6 flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap size={16} className="text-white fill-white" />
        </div>
        <span className="text-lg font-thin tracking-wide hidden md:block text-glow text-slate-800 dark:text-white">GlassFlow</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          // If roles are defined for the item, check if current user has permission
          if (item.roles && user && !item.roles.includes(user.role)) {
            return null;
          }

          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm dark:shadow-lg border border-indigo-100 dark:border-white/5' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-500 dark:group-hover:text-indigo-300'}`} />
              <span className={`text-sm font-medium hidden md:block ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] hidden md:block" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900" />
            <div className="hidden md:block overflow-hidden">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user.name}</div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{user.role}</div>
            </div>
          </div>
        )}

        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-sm font-medium hidden md:block">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium hidden md:block">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
