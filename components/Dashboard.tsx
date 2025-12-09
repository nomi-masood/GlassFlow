
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, YAxis } from 'recharts';
import { GlassCard } from './GlassComponents';
import { Lead, HistoryLog, Task, User, View } from '../types';
import { Users, CheckSquare, Clock, AlertCircle, Activity, Sparkles, TrendingUp, Lightbulb, Target, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  history: HistoryLog[];
  tasks: Task[];
  currentUser: User;
  onChangeView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ leads, history, tasks, currentUser, onChangeView }) => {
  const totalLeads = leads.length;
  
  // Calculate Task Metrics
  const pendingReviews = tasks.filter(t => t.creatorId === currentUser.id && t.status === 'review').length;
  const activeTasks = tasks.filter(t => t.assigneeId === currentUser.id && (t.status === 'todo' || t.status === 'in-progress')).length;
  
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => 
    t.assigneeId === currentUser.id && 
    t.status !== 'done' && 
    t.status !== 'review' &&
    t.dueDate < today
  ).length;

  // Smart Suggestions Logic (For User Role)
  const getSuggestions = () => {
    const suggestions = [];
    
    // 1. Overdue Tasks (Critical)
    const overdueCount = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'done' && t.status !== 'review' && t.dueDate < today).length;
    if (overdueCount > 0) {
       suggestions.push({
           id: 'overdue',
           icon: AlertCircle,
           color: 'text-rose-500',
           bg: 'bg-rose-500/10',
           title: 'Overdue Tasks',
           desc: `You have ${overdueCount} overdue tasks requiring immediate attention.`,
           action: 'Review Tasks',
           view: 'tasks' as View
       });
    }

    // 2. High Priority Tasks
    const urgentTask = tasks.find(t => t.assigneeId === currentUser.id && t.priority === 'high' && t.status !== 'done' && t.status !== 'review' && t.dueDate >= today);
    if (urgentTask) {
        suggestions.push({
            id: 'urg-task',
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            title: 'Urgent Attention',
            desc: `Complete "${urgentTask.title}" today.`,
            action: 'View Task',
            view: 'tasks' as View
        });
    }

    // 3. Closing Focus (Proposal)
    const closingLeads = leads.filter(l => l.stage === 'proposal');
    if (closingLeads.length > 0) {
        suggestions.push({
            id: 'close-deal',
            icon: Target,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            title: 'Closing Focus',
            desc: `You have ${closingLeads.length} deals in Proposal stage. Push to close!`,
            action: 'View Pipeline',
            view: 'pipeline' as View
        });
    }

    // 4. Stale Leads (Contacted but not moved)
    // Simulating "Stale" based on simple string check for prototype
    const staleLead = leads.find(l => l.stage === 'contacted' && (l.lastActive.includes('d ago') || l.lastActive.includes('w ago')));
    if (staleLead) {
         suggestions.push({
            id: 're-engage',
            icon: Clock,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            title: 'Re-engage Lead',
            desc: `${staleLead.name} hasn't been active recently. Send a follow-up.`,
            action: 'Email',
            view: 'lists' as View
        });
    }

    // 5. Funnel Health (Empty Prospecting)
    const prospects = leads.filter(l => l.stage === 'prospect');
    if (prospects.length < 2) {
         suggestions.push({
            id: 'fill-funnel',
            icon: Lightbulb,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            title: 'Fill the Funnel',
            desc: `Your prospect list is running low. Add new leads to keep the flow.`,
            action: 'Add Lead',
            view: 'lists' as View
        });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  // Lead Sources Data
  const sourceData = React.useMemo(() => {
    const sources = leads.reduce((acc, lead) => {
        const src = lead.source || 'Direct';
        acc[src] = (acc[src] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources)
      .map(([name, value]) => ({ 
        name, 
        value,
        percent: Math.round((value / totalLeads) * 100)
      }))
      .sort((a, b) => b.value - a.value); // Sort by highest count
  }, [leads, totalLeads]);

  const SOURCE_COLORS = ['#818cf8', '#c084fc', '#f472b6', '#22d3ee', '#34d399'];

  const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; color: string; subtext?: string; onClick?: () => void }> = ({ label, value, icon: Icon, color, subtext, onClick }) => (
    <GlassCard onClick={onClick} className={`relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${onClick ? 'cursor-pointer' : ''}`}>
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon size={80} />
      </div>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="space-y-1 relative z-10">
        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</h3>
        <p className="text-3xl font-thin text-slate-800 dark:text-white">{value}</p>
        {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{subtext}</p>}
      </div>
    </GlassCard>
  );

  const canViewActivity = currentUser.role === 'admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-2">Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 font-thin">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser.name.split(' ')[0]}.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-medium">System Online</span>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            label="Total Leads" 
            value={totalLeads} 
            icon={Users} 
            color="text-indigo-500" 
            subtext="Active in pipeline"
            onClick={() => onChangeView('lists')}
        />
        <StatCard 
            label="Pending Reviews" 
            value={pendingReviews} 
            icon={CheckSquare} 
            color="text-orange-500" 
            subtext="Tasks awaiting approval"
            onClick={() => onChangeView('task-feed')}
        />
        <StatCard 
            label="My Active Tasks" 
            value={activeTasks} 
            icon={Clock} 
            color="text-blue-500" 
            subtext="To Do & In Progress"
            onClick={() => onChangeView('tasks')}
        />
        <StatCard 
            label="Overdue" 
            value={overdueTasks} 
            icon={AlertCircle} 
            color="text-rose-500" 
            subtext="Requires attention"
            onClick={() => onChangeView('tasks')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Activity OR Suggestions */}
        {canViewActivity ? (
          <GlassCard className="h-96 flex flex-col">
              <h3 className="text-lg font-thin text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-500" /> Recent Activity
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                  {history.slice(0, 8).map((log, i) => (
                      <div key={log.id} className="flex gap-3 items-start relative">
                          {i !== history.slice(0, 8).length - 1 && <div className="absolute left-[11px] top-6 bottom-[-10px] w-px bg-slate-200 dark:bg-white/10" />}
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-600 dark:text-slate-300">
                               {log.userName.charAt(0)}
                          </div>
                          <div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-tight mb-1">
                                  <span className="font-semibold">{log.userName}</span> {log.details.toLowerCase()}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                  {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                          </div>
                      </div>
                  ))}
                  {history.length === 0 && (
                      <div className="text-center text-slate-400 text-xs py-10">No recent activity</div>
                  )}
              </div>
          </GlassCard>
        ) : (
          <GlassCard className="h-96 flex flex-col">
              <h3 className="text-lg font-thin text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" /> Smart Suggestions
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  {suggestions.length > 0 ? suggestions.map((sugg) => (
                      <div 
                        key={sugg.id} 
                        onClick={() => onChangeView(sugg.view)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-colors group cursor-pointer"
                      >
                          <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sugg.bg} ${sugg.color}`}>
                                  <sugg.icon size={16} />
                              </div>
                              <div className="flex-1">
                                  <h4 className="text-sm font-medium text-slate-800 dark:text-white mb-0.5">{sugg.title}</h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mb-2">{sugg.desc}</p>
                                  <div className="flex items-center text-[10px] font-bold text-indigo-500 uppercase tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
                                      {sugg.action} <ArrowRight size={10} className="ml-1" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  )) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <CheckCircle2 size={32} className="text-emerald-500 mb-2 opacity-50" />
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">All caught up!</p>
                          <p className="text-xs text-slate-400">No immediate actions required.</p>
                      </div>
                  )}
              </div>
          </GlassCard>
        )}

        {/* Lead Sources Chart (Donut) */}
        <GlassCard className="h-96 flex flex-col relative overflow-hidden">
          <h3 className="text-lg font-thin text-slate-800 dark:text-white mb-2 z-10">Lead Sources</h3>
          
          <div className="flex-1 flex flex-col">
            {/* Chart Area */}
            <div className="h-48 w-full relative -ml-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sourceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {sourceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(20, 20, 40, 0.9)', 
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                fontSize: '12px'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [`${value} Leads`, '']}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{totalLeads}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Total</span>
                </div>
            </div>

            {/* Detailed List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-2">
                {sourceData.map((source, index) => (
                    <div key={source.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }} 
                            />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{source.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">{source.value}</span>
                            <span className="text-[10px] text-slate-400 w-8 text-right">{source.percent}%</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </GlassCard>
        
        {/* Quick Actions / Tips */}
        <GlassCard className="h-96 flex flex-col justify-center items-center text-center p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
                <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-medium text-slate-800 dark:text-white mb-2">Keep the Flow</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                Review your {pendingReviews} pending tasks or check in with leads in the "Contacted" stage to keep things moving.
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full">
                <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <TrendingUp size={16} className="text-emerald-500 mx-auto mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Pipeline Healthy</span>
                </div>
                <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <Clock size={16} className="text-blue-500 mx-auto mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">On Track</span>
                </div>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
