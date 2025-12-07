
import React, { useState, useEffect } from 'react';
import { Lead, Stage, View, User, Task, TaskStatus, HistoryLog, ActionType } from './types';
import { MOCK_LEADS, MOCK_USERS, MOCK_TASKS, PIPELINE_COLUMNS, MOCK_HISTORY } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import LeadsList from './components/LeadsList';
import TasksBoard from './components/TasksBoard';
import UserManagement from './components/UserManagement';
import HistoryPage from './components/HistoryPage';
import LeadDetailPanel from './components/LeadDetailPanel';
import Login from './components/Login';
import { GlassCard, GlassButton, GlassInput } from './components/GlassComponents';
import { Plus, X, Sparkles, AlertCircle, ChevronDown, LayoutTemplate, Globe } from 'lucide-react';

// Simple toast component local to App
const Toast: React.FC<{ message: string; show: boolean }> = ({ message, show }) => (
  <div className={`fixed bottom-8 right-8 z-[200] transform transition-all duration-500 ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
    <div className="glass-panel px-6 py-3 rounded-xl border-l-4 border-l-indigo-500 flex items-center gap-3 shadow-2xl bg-white dark:bg-white/10">
      <Sparkles className="text-indigo-500 dark:text-indigo-400" size={18} />
      <span className="text-slate-900 dark:text-white text-sm font-medium">{message}</span>
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
  const [flowScore, setFlowScore] = useState(120);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Lead Detail Panel State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Lost Modal State
  const [lostModal, setLostModal] = useState<{ show: boolean; leadId: string | null }>({ show: false, leadId: null });

  // Theme State
  const [isDark, setIsDark] = useState(true);

  // Add/Edit Lead Form State
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [newLead, setNewLead] = useState<{name: string, company: string, email: string, value: string, type: string, source: string, stage: Stage, notes: string}>({ 
    name: '', 
    company: '', 
    email: '',
    value: '', 
    type: 'Inbound',
    source: 'Direct',
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
        // Gamification logic
        if (newStage === 'won' && l.stage !== 'won') {
            setFlowScore(s => s + 50);
            showToast(`Deal Won! +50 Flow Points`);
        } else if (newStage === 'lost') {
            // Logic for lost deals
            showToast('Lead marked as lost');
        } else if (newStage !== l.stage) {
            setFlowScore(s => s + 10);
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
    setNewLead({ name: '', company: '', email: '', value: '', type: 'Inbound', source: 'Direct', stage: 'prospect', notes: '' });
    setShowAddModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setNewLead({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      value: lead.value.toString(),
      type: lead.type || 'Inbound',
      source: lead.source || 'Direct',
      stage: lead.stage,
      notes: lead.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSaveLead = () => {
    // Correctly parse value to number, handle empty string
    const parsedValue = parseFloat(newLead.value);
    const validValue = isNaN(parsedValue) ? 0 : parsedValue;

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
            value: validValue,
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
          value: validValue,
          email: newLead.email || 'contact@example.com',
          stage: newLead.stage,
          type: newLead.type,
          source: newLead.source,
          tags: [newLead.type, 'New'],
          lastActive: 'Just now',
          avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 100)}`,
          notes: newLead.notes
      };
      setLeads([...leads, lead]);
      setFlowScore(s => s + 20);
      logAction('LEAD_CREATE', `Created new lead: ${lead.name}`, lead.id, lead.name);
      const stageName = PIPELINE_COLUMNS.find(c => c.id === newLead.stage)?.title || 'Pipeline';
      showToast(`New lead added to ${stageName}`);
    }

    setShowAddModal(false);
    setEditingLeadId(null);
    setNewLead({ name: '', company: '', email: '', value: '', type: 'Inbound', source: 'Direct', stage: 'prospect', notes: '' });
  };
  
  // Handler for Lead Detail Panel notes update
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
      const hasHeaders = headers.some(h => ['name', 'company', 'email', 'value', 'amount', 'stage'].includes(h));

      let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('contact'));
      let companyIdx = headers.findIndex(h => h.includes('company') || h.includes('org'));
      let emailIdx = headers.findIndex(h => h.includes('email'));
      let valueIdx = headers.findIndex(h => h.includes('value') || h.includes('amount') || h.includes('revenue'));

      // Fallbacks
      if (nameIdx === -1) nameIdx = 0;
      if (companyIdx === -1) companyIdx = 1;
      if (emailIdx === -1) emailIdx = 2;
      if (valueIdx === -1) valueIdx = 3;

      const newLeads: Lead[] = [];
      const startIndex = hasHeaders ? 1 : 0;

      for (let i = startIndex; i < cleanRows.length; i++) {
        const row = cleanRows[i];
        if (row.length < 2) continue; 

        const rawValue = row[valueIdx] || '0';
        const cleanValue = parseFloat(rawValue.replace(/[^0-9.-]+/g, ''));

        const lead: Lead = {
          id: Math.random().toString(36).substr(2, 9),
          name: row[nameIdx] || 'Imported Lead',
          company: row[companyIdx] || 'Unknown Company',
          email: row[emailIdx] || '',
          value: isNaN(cleanValue) ? 0 : cleanValue,
          stage: 'prospect',
          tags: ['Imported'],
          lastActive: 'Just now',
          avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`,
          type: 'Inbound',
          source: 'Direct'
        };
        newLeads.push(lead);
      }

      if (newLeads.length > 0) {
        setLeads(prev => [...prev, ...newLeads]);
        setFlowScore(s => s + (newLeads.length * 5));
        logAction('LEAD_CREATE', `Imported ${newLeads.length} leads via CSV`, 'bulk_import', 'Bulk Import');
        showToast(`Success! Imported ${newLeads.length} leads.`);
      } else {
        showToast('Could not parse any valid leads from file.');
      }
    };
    reader.readAsText(file);
  };

  // Task Handling
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
            if (status === 'done' && t.status !== 'done') {
                setFlowScore(s => s + 15);
                showToast('Task Complete! +15 Points');
            }
            return { ...t, status };
        }
        return t;
    }));
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
    showToast('Task assigned successfully');
  };

  const handleEditTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    logAction('TASK_UPDATE', `Updated task: ${updatedTask.title}`, updatedTask.id, updatedTask.title);
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
      avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`
    };
    setUsers([...users, newUser]);
    logAction('USER_ADD', `Added user: ${newUser.name} (${newUser.role})`, newUser.id, newUser.name);
    showToast('User created successfully');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    showToast('User profile updated');
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
  };
  
  const selectedLead = selectedLeadId ? leads.find(l => l.id === selectedLeadId) || null : null;
  const leadTasks = selectedLeadId ? tasks.filter(t => t.leadId === selectedLeadId) : [];
  const leadHistory = selectedLeadId ? historyLogs.filter(h => h.targetId === selectedLeadId) : [];

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

      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isDark={isDark} 
        toggleTheme={toggleTheme}
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="relative z-10 pl-20 md:pl-64 min-h-screen transition-all">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 h-screen overflow-y-auto custom-scrollbar">
          
          {currentView === 'dashboard' && <Dashboard leads={leads} score={flowScore} history={historyLogs} />}
          
          {currentView === 'pipeline' && (
            <Pipeline 
                leads={leads} 
                onMoveLead={handleMoveLead} 
                onLeadClick={(lead) => setSelectedLeadId(lead.id)}
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
          
          {currentView === 'lists' && (
            <LeadsList 
              leads={leads} 
              onImport={handleImportCSV} 
              onAdd={openAddModal}
              onEdit={handleEditLead}
              onBulkDelete={handleBulkDeleteLeads}
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
          
          {(currentView === 'settings') && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <GlassCard className="p-12 border-dashed border-slate-300 dark:border-white/20 bg-transparent">
                    <h2 className="text-2xl font-thin mb-2">Coming Soon</h2>
                    <p className="text-slate-500 dark:text-slate-400">The {currentView} module is under construction.</p>
                </GlassCard>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button (FAB) - Only on relevant pages */}
      {(currentView === 'pipeline' || currentView === 'lists') && (
        <button 
          onClick={openAddModal}
          className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-110 transition-all duration-300"
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
         onEditLead={(lead) => {
            setSelectedLeadId(null);
            handleEditLead(lead);
         }}
         onStageChange={handleMoveLead}
      />

      {/* Add/Edit Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <GlassCard className="p-8 border-white/20 bg-white/80 dark:bg-[#15152a]/90 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-thin text-slate-800 dark:text-white">
                  {editingLeadId ? 'Edit Lead' : 'Quick Add Lead'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
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
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Estimated Value ($)</label>
                  <GlassInput 
                    type="number"
                    min="0"
                    placeholder="5000" 
                    value={newLead.value}
                    onChange={(e) => setNewLead({...newLead, value: e.target.value})}
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
                        <option value="Inbound" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Inbound</option>
                        <option value="Outbound" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Outbound</option>
                        <option value="Referral" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Referral</option>
                        <option value="Partner" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Partner</option>
                        <option value="Cold" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Cold Lead</option>
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
                        <option value="Direct" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Direct</option>
                        <option value="Social" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Social</option>
                        <option value="Referral" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Referral</option>
                        <option value="Ads" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Ads</option>
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
                
                <div className="pt-4 flex gap-3">
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
