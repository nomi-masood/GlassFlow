import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { GlassCard } from './GlassComponents';
import { Lead } from '../types';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  score: number;
}

const Dashboard: React.FC<DashboardProps> = ({ leads, score }) => {
  const totalValue = leads.reduce((acc, curr) => acc + curr.value, 0);
  const totalLeads = leads.length;
  const winRate = Math.round((leads.filter(l => l.stage === 'won').length / totalLeads) * 100) || 0;

  // Mock data for charts
  const activityData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];

  const StatCard: React.FC<{ label: string; value: string; icon: React.ElementType; color: string; trend?: string }> = ({ label, value, icon: Icon, color, trend }) => (
    <GlassCard className="relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('text-', 'text-')}`}>
        <Icon size={80} />
      </div>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 ${color}`}>
          <Icon size={20} />
        </div>
        {trend && <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">{trend}</span>}
      </div>
      <div className="space-y-1">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</h3>
        <p className="text-2xl font-thin text-slate-800 dark:text-white">{value}</p>
      </div>
    </GlassCard>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-thin">Welcome back, Alex. Your flow score is <span className="text-indigo-600 dark:text-indigo-400 font-medium">{score}</span> today.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-medium">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Pipeline Value" value={`$${totalValue.toLocaleString()}`} icon={DollarSign} color="text-indigo-600 dark:text-indigo-400" trend="+12%" />
        <StatCard label="Total Leads" value={totalLeads.toString()} icon={Users} color="text-pink-600 dark:text-pink-400" trend="+5%" />
        <StatCard label="Win Rate" value={`${winRate}%`} icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Flow Score" value={score.toString()} icon={Activity} color="text-blue-600 dark:text-blue-400" trend="Level 3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 h-80 flex flex-col">
          <h3 className="text-lg font-thin text-slate-800 dark:text-white mb-6">Revenue Velocity</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  hide={true} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 30, 46, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 500 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#818cf8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="h-80 flex flex-col">
          <h3 className="text-lg font-thin text-slate-800 dark:text-white mb-6">Lead Sources</h3>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Direct', value: 40 },
                { name: 'Social', value: 30 },
                { name: 'Referral', value: 20 },
                { name: 'Ads', value: 10 },
              ]}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(30, 30, 46, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 500 }}
                />
                <Bar dataKey="value" fill="#c084fc" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;