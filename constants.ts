
import { Lead, PipelineColumn, User, Task } from './types';

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'prospect', title: 'Prospect', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-indigo-500' },
  { id: 'qualified', title: 'Qualified', color: 'bg-purple-500' },
  { id: 'proposal', title: 'Proposal', color: 'bg-pink-500' },
  { id: 'won', title: 'Won', color: 'bg-emerald-500' },
  { id: 'lost', title: 'Lost', color: 'bg-rose-500' },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Alice Freeman',
    company: 'Nexus Tech',
    email: 'alice@nexus.com',
    value: 12500,
    stage: 'qualified',
    tags: ['SaaS', 'High Value'],
    lastActive: '2h ago',
    avatarUrl: 'https://picsum.photos/100/100?random=1'
  },
  {
    id: '2',
    name: 'Bob Chen',
    company: 'Starlight Media',
    email: 'bob@starlight.com',
    value: 5400,
    stage: 'prospect',
    tags: ['Agency'],
    lastActive: '1d ago',
    avatarUrl: 'https://picsum.photos/100/100?random=2'
  },
  {
    id: '3',
    name: 'Sarah Jones',
    company: 'Blue Sky Inc',
    email: 'sarah@bluesky.com',
    value: 28000,
    stage: 'proposal',
    tags: ['Enterprise', 'Q3'],
    lastActive: '4h ago',
    avatarUrl: 'https://picsum.photos/100/100?random=3'
  },
  {
    id: '4',
    name: 'Mike Ross',
    company: 'Pearson Specter',
    email: 'mross@pearson.com',
    value: 8000,
    stage: 'won',
    tags: ['Legal'],
    lastActive: '1w ago',
    avatarUrl: 'https://picsum.photos/100/100?random=4'
  },
  {
    id: '5',
    name: 'Jessica Pearson',
    company: 'Pearson Specter',
    email: 'jpearson@pearson.com',
    value: 55000,
    stage: 'contacted',
    tags: ['VIP'],
    lastActive: '5m ago',
    avatarUrl: 'https://picsum.photos/100/100?random=5'
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
