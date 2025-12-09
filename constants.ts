
import { Lead, PipelineColumn, User, Task, HistoryLog } from './types';

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'prospect', title: 'Prospect', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-indigo-500' },
  { id: 'qualified', title: 'Qualified', color: 'bg-purple-500' },
  { id: 'proposal', title: 'Proposal', color: 'bg-pink-500' },
  { id: 'won', title: 'Won', color: 'bg-emerald-500' },
  { id: 'lost', title: 'Lost', color: 'bg-rose-500' },
];

export const LEAD_SOURCES = ['Direct', 'Social', 'Referral', 'Ads'];

export const LEAD_TYPES = ['Inbound', 'Outbound', 'Referral', 'Partner', 'Cold'];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Alice Freeman',
    company: 'Nexus Tech',
    email: 'alice@nexus.com',
    stage: 'qualified',
    tags: ['SaaS', 'High Value'],
    lastActive: '2h ago',
    avatarUrl: 'https://picsum.photos/100/100?random=1',
    source: 'Direct',
    type: 'Inbound'
  },
  {
    id: '2',
    name: 'Bob Chen',
    company: 'Starlight Media',
    email: 'bob@starlight.com',
    stage: 'prospect',
    tags: ['Agency'],
    lastActive: '1d ago',
    avatarUrl: 'https://picsum.photos/100/100?random=2',
    source: 'Referral',
    type: 'Referral'
  },
  {
    id: '3',
    name: 'Sarah Jones',
    company: 'Blue Sky Inc',
    email: 'sarah@bluesky.com',
    stage: 'proposal',
    tags: ['Enterprise', 'Q3'],
    lastActive: '4h ago',
    avatarUrl: 'https://picsum.photos/100/100?random=3',
    source: 'Social',
    type: 'Inbound'
  },
  {
    id: '4',
    name: 'Mike Ross',
    company: 'Pearson Specter',
    email: 'mross@pearson.com',
    stage: 'won',
    tags: ['Legal'],
    lastActive: '1w ago',
    avatarUrl: 'https://picsum.photos/100/100?random=4',
    source: 'Direct',
    type: 'Outbound'
  },
  {
    id: '5',
    name: 'Jessica Pearson',
    company: 'Pearson Specter',
    email: 'jpearson@pearson.com',
    stage: 'contacted',
    tags: ['VIP'],
    lastActive: '5m ago',
    avatarUrl: 'https://picsum.photos/100/100?random=5',
    source: 'Ads',
    type: 'Cold'
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Founder',
    email: 'admin@glassflow.com',
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://picsum.photos/100/100?random=10'
  },
  {
    id: 'u2',
    name: 'Jordan Sales',
    email: 'manager@glassflow.com',
    role: 'manager',
    status: 'active',
    branchId: 'b1',
    avatarUrl: 'https://picsum.photos/100/100?random=11'
  },
  {
    id: 'u3',
    name: 'Taylor Rep',
    email: 'user@glassflow.com',
    role: 'user',
    status: 'active',
    branchId: 'b1',
    avatarUrl: 'https://picsum.photos/100/100?random=12'
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review Q3 Pipeline',
    description: 'Analyze the drop-off rate at the proposal stage.',
    assigneeId: 'u1',
    creatorId: 'u1',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2023-11-15'
  },
  {
    id: 't2',
    title: 'Follow up with Nexus Tech',
    assigneeId: 'u3',
    creatorId: 'u2',
    status: 'todo',
    priority: 'medium',
    dueDate: '2023-11-10'
  },
  {
    id: 't3',
    title: 'Prepare Slide Deck',
    assigneeId: 'u2',
    creatorId: 'u1',
    status: 'done',
    priority: 'low',
    dueDate: '2023-11-01'
  },
  {
    id: 't4',
    title: 'Call Starlight Media',
    assigneeId: 'u3',
    creatorId: 'u3',
    status: 'todo',
    priority: 'high',
    dueDate: '2023-11-12'
  }
];

export const MOCK_HISTORY: HistoryLog[] = [
  {
    id: 'h1',
    action: 'LEAD_STAGE_CHANGE',
    userId: 'u1',
    userName: 'Alex Founder',
    targetId: '4',
    targetName: 'Mike Ross',
    details: 'Moved from Proposal to Won',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 'h2',
    action: 'TASK_CREATE',
    userId: 'u2',
    userName: 'Jordan Sales',
    targetId: 't2',
    targetName: 'Follow up with Nexus Tech',
    details: 'Created new task assigned to Taylor Rep',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  }
];
