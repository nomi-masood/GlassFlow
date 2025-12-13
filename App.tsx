
import React, { useState, useEffect } from 'react';
import { Lead, Stage, View, User, Task, TaskStatus, HistoryLog, ActionType, LeadActivity } from './types';
import { MOCK_LEADS, MOCK_USERS, MOCK_TASKS, PIPELINE_COLUMNS, MOCK_HISTORY, LEAD_SOURCES, LEAD_TYPES } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import LeadsList from './components/LeadsList';
import TasksBoard from './components/TasksBoard';
import TaskFeed from './components/TaskFeed';
import UserManagement from './components/UserManagement';
import HistoryPage from './components/HistoryPage';
import LeadDetailPanel from './components/LeadDetailPanel';
import SettingsPage from './components/SettingsPage';
import Login from './components/Login';
import CommandPalette from './components/CommandPalette';
import { GlassCard, GlassButton, GlassInput } from './components/GlassComponents';
import { Plus, X, Sparkles, AlertCircle, ChevronDown, LayoutTemplate, Globe, Menu, Zap } from 'lucide-react';

// Simple toast component local to App
const Toast: React.FC<{ message: string; show: boolean }> = ({ message, show }) => (
  <div className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[200] transform transition-all duration-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
    <div className="glass-panel px-6 py-3 rounded-xl border-l-4 border-l-indigo-500 flex items-center gap-3 shadow-2xl bg-white dark:bg-white/10 max-w-[90vw]">
      <Sparkles className="text-indigo-500 dark:text-indigo-400 shrink-0" size={18} />
      <span className="text-slate-900 dark:text-white text-sm font-medium truncate">{message}</span>
    </div>
  </div>
);

const LOST_REASONS = [
  "Price too high",
  "Competitor",
  "No Response",
  "Feature Gap",
  "Timing",
  "Other"
];

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App State
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(MOCK_HISTORY);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Lead Detail Panel State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Lost Modal State
  const [lostModal, setLostModal] = useState<{ show: boolean; leadId: string | null }>({ show: false, leadId: null });

  // Theme State
  const [isDark, setIsDark] = useState(true);

  // Add/Edit Lead Form State
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [newLead, setNewLead] = useState<{name: string, company: string, email: string, type: string, source: string, stage: Stage, notes: string}>({ 
    name: '', 
    company: '', 
    email: '',
    type: LEAD_TYPES[0],
    source: LEAD_SOURCES[0],
    stage: 'prospect',
    notes: ''
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Helper function to log actions
  const logAction = (action: ActionType, details: string, targetId?: string, targetName?: string) => {
    if (!currentUser) return;
    
    const newLog: HistoryLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      userId: currentUser.id,
      userName: currentUser.name,
      targetId,
      targetName,
      details,
      timestamp: new Date().toISOString()
    };
    
    setHistoryLogs(prev => [newLog, ...prev]);
  };

  const updateLeadStage = (leadId: string, newStage: Stage, lostReason?: string) => {
    const lead = leads.find(l => l.id === leadId);
    
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        if (newStage === 'won' && l.stage !== 'won') {
            showToast(`Deal Won!`);
        } else if (newStage === 'lost') {
            showToast('Lead marked as lost');
        } else if (newStage !== l.stage) {
            showToast('Pipeline updated');
        }
        
        // If moving OUT of lost, clear the reason. If moving INTO lost, set the reason.
        const updatedReason = newStage === 'lost' ? lostReason : undefined;

        return { ...l, stage: newStage, lostReason: updatedReason };
      }
      return l;
    }));

    if (lead && lead.stage !== newStage) {
        logAction('LEAD_STAGE_CHANGE', `Moved from ${lead.stage} to ${newStage}`, lead.id, lead.name);
    }
  };

  const handleMoveLead = (leadId: string, newStage: Stage) => {
    if (newStage === 'lost') {
      setLostModal({ show: true, leadId });
      return;
    }
    updateLeadStage(leadId, newStage);
  };

  const handleConfirmLost = (reason: string) => {
    if (lostModal.leadId) {
      updateLeadStage(lostModal.leadId, 'lost', reason);
      setLostModal({ show: false, leadId: null });
    }
  };

  const openAddModal = () => {
    setEditingLeadId(null);
    setNewLead({ name: '', company: '', email: '', type: LEAD_TYPES[0], source: LEAD_SOURCES[0], stage: 'prospect', notes: '' });
    setShowAddModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setNewLead({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      type: lead.type || LEAD_TYPES[0],
      source: lead.source || LEAD_SOURCES[0],
      stage: lead.stage,
      notes: lead.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSaveLead = () => {
    if (editingLeadId) {
      // Update existing lead
      setLeads(prev => prev.map(l => {
        if (l.id === editingLeadId) {
          // Update tags if type changed
          let newTags = [...l.tags];
          // Remove old type if present and add new type
          if (l.type && newLead.type !== l.type) {
             newTags = newTags.filter(t => t !== l.type);
          }
          if (!newTags.includes(newLead.type)) {
             newTags.unshift(newLead.type);
          }

          return {
            ...l,
            name: newLead.name,
            company: newLead.company,
            email: newLead.email,
            stage: newLead.stage,
            type: newLead.type,
            source: newLead.source,
            tags: newTags,
            notes: newLead.notes
          };
        }
        return l;
      }));
      logAction('LEAD_UPDATE', `Updated lead details: ${newLead.name}`, editingLeadId, newLead.name);
      showToast('Lead updated successfully');
    } else {
      // Create new lead
      const lead: Lead = {
          id: Math.random().toString(36).substr(2, 9),
          name: newLead.name || 'New Lead',
          company: newLead.company || 'Unknown',
          email: newLead.email || 'contact@example.com',
          stage: newLead.stage,
          type: newLead.type,
          source: newLead.source,
          tags: [newLead.type, 'New'],
          lastActive: 'Just now',
          avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 100)}`,
          notes: newLead.notes,
          assigneeId: currentUser?.id, // Default assign to creator
          createdAt: new Date().toISOString() // Set creation date
      };
      setLeads([...leads, lead]);
      logAction('LEAD_CREATE', `Created new lead: ${lead.name}`, lead.id, lead.name);
      const stageName = PIPELINE_COLUMNS.find(c => c.id === newLead.stage)?.title || 'Pipeline';
      showToast(`New lead added to ${stageName}`);
    }

    setShowAddModal(false);
    setEditingLeadId(null);
    setNewLead({ name: '', company: '', email: '', type: LEAD_TYPES[0], source: LEAD_SOURCES[0], stage: 'prospect', notes: '' });
  };
  
  // Handler for adding a new activity to a lead
  const handleAddLeadActivity = (leadId: string, activity: LeadActivity) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
            return {
                ...l,
                activities: [activity, ...(l.activities || [])],
                lastActive: 'Just now'
            };
        }
        return l;
    }));
    logAction('LEAD_ACTIVITY_LOG', `Logged ${activity.type}: ${activity.summary}`, leadId, lead?.name);
    showToast('Activity logged');
  };

  // Handler for Lead Detail Panel notes update (legacy/compatibility)
  const handleUpdateLeadNotes = (leadId: string, notes: string) => {
    const lead = leads.find(l => l.id === leadId);
    setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
            return { ...l, notes };
        }
        return l;
    }));
    // Improved logging with lead name
    logAction('LEAD_UPDATE', `Updated notes for ${lead?.name || 'lead'}`, leadId, lead?.name);
    showToast('Notes saved');
  };

  const handleBulkDeleteLeads = (ids: string[]) => {
    setLeads(prev => prev.filter(l => !ids.includes(l.id)));
    logAction('LEAD_DELETE', `Bulk deleted ${ids.length} leads`);
    showToast(`Deleted ${ids.length} leads`);
  };

  const handleBulkAssignLeads = (leadIds: string[], assigneeId: string) => {
    const assignee = users.find(u => u.id === assigneeId);
    if (!assignee) return;

    setLeads(prev => prev.map(l => {
        if (leadIds.includes(l.id)) {
            return { ...l, assigneeId };
        }
        return l;
    }));
    
    logAction('LEAD_ASSIGN', `Bulk assigned ${leadIds.length} leads to ${assignee.name}`);
    showToast(`Assigned ${leadIds.length} leads to ${assignee.name}`);
  };

  const handleDeleteLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (lead) {
        logAction('LEAD_DELETE', `Deleted lead: ${lead.name}`, lead.id, lead.name);
    }
    showToast('Lead deleted');
  };

  const handleImportCSV = (file: File) => {
    // Validate file type by extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Invalid file format. Please upload a .csv file.');
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => showToast('Failed to read file');

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.trim().length === 0) {
          showToast('File is empty');
          return;
        }

        // Robust CSV Parsing Function to handle quotes and newlines
        const parseCSV = (str: string) => {
          const arr: string[][] = [];
          let quote = false;  
          let col = 0, row = 0;
          
          for (let c = 0; c < str.length; c++) {
            const cc = str[c];
            const nc = str[c+1];
            arr[row] = arr[row] || [];
            arr[row][col] = arr[row][col] || '';
            
            if (cc == '"' && quote && nc == '"') { 
              arr[row][col] += cc; ++c; continue; 
            }
            if (cc == '"') { 
              quote = !quote; continue; 
            }
            if (cc == ',' && !quote) { 
              ++col; continue; 
            }
            if (cc == '\r' && nc == '\n' && !quote) { 
              ++row; col = 0; ++c; continue; 
            }
            if (cc == '\n' && !quote) { 
              ++row; col = 0; continue; 
            }
            if (cc == '\r' && !quote) { 
              ++row; col = 0; continue; 
            }
            arr[row][col] += cc;
          }
          return arr;
        };

        const rows = parseCSV(text);
        
        const cleanRows = rows.filter(r => r.length > 0 && r.some(c => c.trim().length > 0));

        if (cleanRows.length === 0) {
          showToast('No data found in CSV');
          return;
        }

        // Basic Header Mapping
        const headers = cleanRows[0].map(h => h.toLowerCase().trim());
        const hasHeaders = headers.some(h => ['name', 'company', 'email', 'stage'].includes(h));

        let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('contact'));
        let companyIdx = headers.findIndex(h => h.includes('company') || h.includes('org'));
        let emailIdx = headers.findIndex(h => h.includes('email'));

        // Fallbacks
        if (nameIdx === -1) nameIdx = 0;
        if (companyIdx === -1) companyIdx = 1;
        if (emailIdx === -1) emailIdx = 2;

        const newLeads: Lead[] = [];
        const startIndex = hasHeaders ? 1 : 0;

        for (let i = startIndex; i < cleanRows.length; i++) {
          const row = cleanRows[i];
          if (row.length < 2) continue; 

          const lead: Lead = {
            id: Math.random().toString(36).substr(2, 9),
            name: row[nameIdx] || 'Imported Lead',
            company: row[companyIdx] || 'Unknown Company',
            email: row[emailIdx] || '',
            stage: 'prospect',
            tags: ['Imported'],
            lastActive: 'Just now',
            avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`,
            type: 'Inbound',
            source: 'Direct',
            assigneeId: currentUser?.id,
            createdAt: new Date().toISOString()
          };
          newLeads.push(lead);
        }

        if (newLeads.length > 0) {
          setLeads(prev => [...prev, ...newLeads]);
          logAction('LEAD_CREATE', `Imported ${newLeads.length} leads via CSV`, 'bulk_import', 'Bulk Import');
          showToast(`Success! Imported ${newLeads.length} leads.`);
        } else {
          showToast('Could not parse any valid leads from file.');
        }
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        showToast('Error parsing CSV file. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  // Task Handling
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if the task is being moved to 'review' (visual column 3)
    let finalStatus = status;

    if (status === 'review') {
      // If creator is current user (or creator is same as assignee), task is effectively done
      if (task.creatorId === currentUser?.id) {
          finalStatus = 'done'; // Auto accept
          showToast('Task Complete!');
          logAction('TASK_UPDATE', `Completed task: ${task.title}`, task.id, task.title);
      } else {
          // If assigned to someone else, it goes to review
          finalStatus = 'review';
          showToast('Task submitted for review');
          logAction('TASK_REVIEW', `Submitted task for review: ${task.title}`, task.id, task.title);
      }
    } else if (status === 'done') {
      // Explicit done (if called directly)
       showToast('Task Complete!');
       logAction('TASK_UPDATE', `Marked task as done: ${task.title}`, task.id, task.title);
    } else {
       logAction('TASK_UPDATE', `Changed task status to ${status}: ${task.title}`, task.id, task.title);
    }

    setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
            return { ...t, status: finalStatus };
        }
        return t;
    }));
  };

  // Task Review Handlers
  const handleAcceptTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'done' };
      }
      return t;
    }));
    if (task) {
      logAction('TASK_REVIEW', `Approved/Finalized task: ${task.title}`, task.id, task.title);
    }
    showToast('Task approved and finalized');
  };

  const handleDeclineTask = (taskId: string, newAssigneeId?: string) => {
    const task = tasks.find(t => t.id === taskId);
    const newAssignee = users.find(u => u.id === newAssigneeId);
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status: 'todo', 
          assigneeId: newAssigneeId || t.assigneeId // Update assignee if provided
        };
      }
      return t;
    }));
    
    if (task) {
        const reassignmentText = newAssignee && newAssignee.id !== task.assigneeId 
            ? ` and reassigned to ${newAssignee.name}` 
            : '';
        logAction('TASK_REVIEW', `Declined task completion${reassignmentText}: ${task.title}`, task.id, task.title);
    }
    showToast('Task returned to assignee');
  };

  const handleBatchAccept = (taskIds: string[]) => {
    setTasks(prev => prev.map(t => {
      if (taskIds.includes(t.id)) {
        return { ...t, status: 'done' };
      }
      return t;
    }));
    
    // Log for each task to maintain history per task
    taskIds.forEach(id => {
        const task = tasks.find(t => t.id === id);
        if (task) logAction('TASK_REVIEW', `Approved task via batch action: ${task.title}`, task.id, task.title);
    });

    showToast(`${taskIds.length} tasks approved`);
  };

  const handleBatchDeclineTasks = (taskIds: string[], newAssigneeId?: string) => {
    setTasks(prev => prev.map(t => {
      if (taskIds.includes(t.id)) {
        return { 
          ...t, 
          status: 'todo', 
          assigneeId: newAssigneeId || t.assigneeId 
        };
      }
      return t;
    }));

    // Log for each task
    taskIds.forEach(id => {
        const task = tasks.find(t => t.id === id);
        if (task) logAction('TASK_REVIEW', `Declined task via batch action: ${task.title}`, task.id, task.title);
    });

    showToast(`${taskIds.length} tasks returned`);
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || 'New Task',
        description: taskData.description,
        assigneeId: taskData.assigneeId || currentUser?.id || '',
        creatorId: currentUser?.id || '',
        status: 'todo',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || new Date().toISOString(),
        type: taskData.type,
        leadId: taskData.leadId,
        attachments: taskData.attachments || []
    };
    setTasks([...tasks, newTask]);
    logAction('TASK_CREATE', `Created task: ${newTask.title}`, newTask.id, newTask.title);
    showToast('Task created successfully');
  };

  const handleEditTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    logAction('TASK_UPDATE', `Updated task details: ${updatedTask.title}`, updatedTask.id, updatedTask.title);
    showToast('Task updated successfully');
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (task) {
        logAction('TASK_DELETE', `Deleted task: ${task.title}`, task.id, task.title);
    }
    showToast('Task deleted');
  };

  // User Management Handling
  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || 'user',
      status: userData.status || 'active',
      avatarUrl: userData.avatarUrl || `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`
    };
    setUsers([...users, newUser]);
    logAction('USER_ADD', `Added user: ${newUser.name} (${newUser.role})`, newUser.id, newUser.name);
    showToast('User created successfully');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    showToast('User profile updated');
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    showToast('Profile updated successfully');
  };

  const handleDeleteUser = (userId: string) => {
    // Permission checks
    if (!currentUser) return;
    const targetUser = users.find(u => u.id === userId);
    
    if (!targetUser) return;
    
    if (userId === currentUser.id) {
        showToast('You cannot delete your own account');
        return;
    }
    
    if (currentUser.role === 'user') {
        showToast('Permission denied');
        return;
    }
    
    // Manager cannot delete Admin
    if (currentUser.role === 'manager' && targetUser.role === 'admin') {
        showToast('Managers cannot delete Admins');
        return;
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    logAction('USER_DELETE', `Deleted user: ${targetUser.name}`, targetUser.id, targetUser.name);
    showToast('User deleted');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setIsMobileMenuOpen(false);
  };
  
  const selectedLead = selectedLeadId ? leads.find(l => l.id === selectedLeadId) || null : null;
  const leadTasks = selectedLeadId ? tasks.filter(t => t.leadId === selectedLeadId) : [];
  const leadHistory = selectedLeadId ? historyLogs.filter(h => h.targetId === selectedLeadId) : [];

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  // RENDER LOGIC
  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast message={toast.message} show={toast.show} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F0F23] text-slate-900 dark:text-[#F8FAFF] font-medium selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-white transition-colors duration-300">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-600/10 blur-[120px]" />
         <div className="absolute top-[20%] right-[0%] w-[40%] h-[60%] rounded-full bg-purple-500/5 dark:bg-purple-600/10 blur-[120px]" />
         <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-[120px]" />
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        leads={leads}
        tasks={tasks}
        onNavigate={handleViewChange}
        onLeadSelect={(l) => setSelectedLeadId(l.id)}
        onTaskSelect={(t) => {
           // We might want to open a task detail modal here, but for now just navigate to tasks
           handleViewChange('tasks');
        }}
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0F0F23]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
             >
                <Menu size={24} />
             </button>
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                     <Zap size={16} className="text-white fill-white" />
                 </div>
                 <span className="text-lg font-thin tracking-wide text-glow text-slate-800 dark:text-white">GlassFlow</span>
             </div>
         </div>
         <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10" />
      </div>

      <Sidebar 
        currentView={currentView} 
        onChangeView={handleViewChange} 
        isDark={isDark} 
        toggleTheme={toggleTheme}
        user={currentUser}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="relative z-10 pl-0 md:pl-20 lg:pl-64 min-h-screen transition-all pt-16 md:pt-0">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 h-[calc(100vh-64px)] md:h-screen overflow-y-auto custom-scrollbar">
          
          {currentView === 'dashboard' && (
            <Dashboard 
              leads={leads} 
              history={historyLogs} 
              tasks={tasks}
              currentUser={currentUser}
              onChangeView={handleViewChange}
            />
          )}
          
          {currentView === 'pipeline' && (
            <Pipeline 
                leads={leads} 
                onMoveLead={handleMoveLead} 
                onLeadClick={(lead) => setSelectedLeadId(lead.id)}
                currentUser={currentUser}
            />
          )}
          
          {currentView === 'tasks' && (
            <TasksBoard 
              tasks={tasks}
              leads={leads}
              currentUser={currentUser} 
              onUpdateStatus={handleUpdateTaskStatus}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentView === 'task-feed' && (
            <TaskFeed 
              tasks={tasks}
              users={users}
              leads={leads}
              currentUser={currentUser}
              historyLogs={historyLogs}
              onAccept={handleAcceptTask}
              onDecline={handleDeclineTask}
              onBatchAccept={handleBatchAccept}
              onBatchDecline={handleBatchDeclineTasks}
            />
          )}
          
          {currentView === 'lists' && (
            <LeadsList 
              leads={leads}
              users={users}
              onImport={handleImportCSV} 
              onAdd={openAddModal}
              onEdit={handleEditLead}
              onBulkDelete={handleBulkDeleteLeads}
              onBulkAssign={handleBulkAssignLeads}
              onDelete={handleDeleteLead}
              onLeadClick={(lead) => setSelectedLeadId(lead.id)}
            />
          )}
          
          {currentView === 'users' && (
            <UserManagement 
              users={users}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
          {currentView === 'history' && (
            <HistoryPage 
              logs={historyLogs}
              currentUser={currentUser}
            />
          )}
          
          {currentView === 'settings' && (
            <SettingsPage 
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              isDark={isDark}
              toggleTheme={toggleTheme}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button (FAB) - Only on relevant pages */}
      {(currentView === 'pipeline' || currentView === 'lists') && (
        <button 
          onClick={openAddModal}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-110 transition-all duration-300 active:scale-95"
        >
          <Plus size={24} />
        </button>
      )}
      
      {/* Lead Detail Slide-Over */}
      <LeadDetailPanel 
         lead={selectedLead}
         isOpen={!!selectedLead}
         onClose={() => setSelectedLeadId(null)}
         linkedTasks={leadTasks}
         history={leadHistory}
         onUpdateNotes={handleUpdateLeadNotes}
         onAddActivity={handleAddLeadActivity}
         onEditLead={(lead) => {
            setSelectedLeadId(null);
            handleEditLead(lead);
         }}
         onStageChange={handleMoveLead}
      />

      {/* Add/Edit Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full h-full md:h-auto md:max-w-md animate-scale-in">
            <GlassCard className="h-full md:h-auto p-4 pt-16 md:p-8 border-white/20 bg-white/95 dark:bg-[#15152a]/95 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className="text-xl font-thin text-slate-800 dark:text-white">
                  {editingLeadId ? 'Edit Lead' : 'Quick Add Lead'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 md:pb-0">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Name</label>
                  <GlassInput 
                    placeholder="e.g. Jane Doe" 
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Company</label>
                  <GlassInput 
                    placeholder="e.g. Acme Corp" 
                    value={newLead.company}
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Email</label>
                  <GlassInput 
                    type="email"
                    placeholder="e.g. jane@company.com" 
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Lead Type</label>
                    <div className="relative">
                      <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                        value={newLead.type}
                        onChange={(e) => setNewLead({...newLead, type: e.target.value})}
                      >
                        {LEAD_TYPES.map(type => (
                          <option key={type} value={type} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Lead Source</label>
                    <div className="relative">
                      <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                        value={newLead.source}
                        onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                      >
                        {LEAD_SOURCES.map(source => (
                          <option key={source} value={source} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{source}</option>
                        ))}
                      </select>
                      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Stage</label>
                    <div className="relative">
                      <select 
                        className="w-full glass-input-base rounded-xl px-4 py-2 appearance-none bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                        value={newLead.stage}
                        onChange={(e) => setNewLead({...newLead, stage: e.target.value as Stage})}
                      >
                        {PIPELINE_COLUMNS.map(col => (
                          <option key={col.id} value={col.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                            {col.title}
                          </option>
                        ))}
                      </select>
                      <LayoutTemplate className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Notes</label>
                  <textarea 
                    className="glass-input-base rounded-xl px-4 py-2 font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full resize-none h-24"
                    placeholder="Add details regarding this lead..."
                    value={newLead.notes}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  />
                </div>
                
                <div className="pt-4 flex gap-3 shrink-0">
                  <GlassButton variant="ghost" className="flex-1 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => setShowAddModal(false)}>Cancel</GlassButton>
                  <GlassButton className="flex-1 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white border-transparent" onClick={handleSaveLead}>
                    {editingLeadId ? 'Save Changes' : 'Create Lead'}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Lost Reason Modal */}
      {lostModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setLostModal({ show: false, leadId: null })} />
          <div className="relative w-full max-w-sm animate-scale-in">
            <GlassCard className="p-8 border-white/20 bg-white/80 dark:bg-[#15152a]/90 shadow-2xl">
              <div className="flex flex-col items-center mb-6 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                  <AlertCircle className="text-rose-500" size={24} />
                </div>
                <h2 className="text-xl font-medium text-slate-800 dark:text-white">Mark as Lost</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Why was this deal lost?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {LOST_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleConfirmLost(reason)}
                    className="p-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 text-slate-600 dark:text-slate-300 transition-all"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              
              <GlassButton variant="ghost" className="w-full text-slate-500 dark:text-slate-400" onClick={() => setLostModal({ show: false, leadId: null })}>
                Cancel
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} />

      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
