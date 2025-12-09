
import { Lead, PipelineColumn, User, Task, HistoryLog } from './types';

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'prospect', title: 'Prospect', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-indigo-500' },
  { id: 'qualified', title: 'Qualified', color: 'bg-purple-500' },
  { id: 'proposal', title: 'Proposal', color: 'bg-pink-500' },
  { id: 'won', title: 'Won', color: 'bg-emerald-500' },
  { id: 'lost', title: 'Lost', color: 'bg-rose-500' },
];

export const LEAD_SOURCES = ['Direct', 'Social', 'Referral', 'Ads', 'Event', 'Partner'];

export const LEAD_TYPES = ['Inbound', 'Outbound', 'Referral', 'Partner', 'Cold', 'Expansion'];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Founder',
    email: 'admin@glassflow.com',
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'u2',
    name: 'Jordan Sales',
    email: 'manager@glassflow.com',
    role: 'manager',
    status: 'active',
    branchId: 'b1',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'u3',
    name: 'Taylor Rep',
    email: 'user@glassflow.com',
    role: 'user',
    status: 'active',
    branchId: 'b1',
    avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'u4',
    name: 'Casey Design',
    email: 'designer@glassflow.com',
    role: 'user',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Alice Freeman',
    company: 'Nexus Tech',
    email: 'alice@nexus.com',
    stage: 'qualified',
    tags: ['SaaS', 'High Value'],
    lastActive: '2h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100',
    source: 'Direct',
    type: 'Inbound',
    notes: 'Key decision maker. Interested in the enterprise plan.'
  },
  {
    id: '2',
    name: 'Bob Chen',
    company: 'Starlight Media',
    email: 'bob@starlight.com',
    stage: 'prospect',
    tags: ['Agency'],
    lastActive: '1d ago',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100',
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
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100',
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
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100',
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
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100',
    source: 'Ads',
    type: 'Cold'
  },
  {
    id: '6',
    name: 'David Wallace',
    company: 'Dunder Mifflin',
    email: 'dwallace@dm.com',
    stage: 'proposal',
    tags: ['Manufacturing', 'Paper'],
    lastActive: '3d ago',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100',
    source: 'Partner',
    type: 'Expansion'
  },
  {
    id: '7',
    name: 'Pam Beesly',
    company: 'Pratt Institute',
    email: 'pam@art.edu',
    stage: 'prospect',
    tags: ['Education'],
    lastActive: 'Just now',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100',
    source: 'Event',
    type: 'Inbound'
  },
  {
    id: '8',
    name: 'Ryan Howard',
    company: 'WUPHF.com',
    email: 'ryan@wuphf.com',
    stage: 'lost',
    tags: ['Startup', 'Risky'],
    lastActive: '2w ago',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100',
    source: 'Social',
    type: 'Outbound',
    lostReason: 'Price too high'
  },
  {
    id: '9',
    name: 'Jan Levinson',
    company: 'White Pages',
    email: 'jan@whitepages.com',
    stage: 'qualified',
    tags: ['Corporate'],
    lastActive: '12h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&w=100&h=100',
    source: 'Ads',
    type: 'Cold'
  },
  {
    id: '10',
    name: 'Oscar Martinez',
    company: 'Accounting Plus',
    email: 'oscar@accounting.com',
    stage: 'won',
    tags: ['Finance'],
    lastActive: '3d ago',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100',
    source: 'Referral',
    type: 'Referral'
  },
  {
    id: '11',
    name: 'Kelly Kapoor',
    company: 'Sabre',
    email: 'kelly@sabre.com',
    stage: 'contacted',
    tags: ['Retail', 'Tech'],
    lastActive: '1h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100',
    source: 'Social',
    type: 'Inbound'
  },
  {
    id: '12',
    name: 'Darryl Philbin',
    company: 'Athlead',
    email: 'darryl@athlead.com',
    stage: 'proposal',
    tags: ['Sports', 'Marketing'],
    lastActive: '5h ago',
    avatarUrl: 'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?auto=format&fit=crop&w=100&h=100',
    source: 'Partner',
    type: 'Expansion'
  }
];

export const MOCK_TASKS: Task[] = [
  // User 1 (Admin) Tasks to Review (Assigned to others)
  {
    id: 't1',
    title: 'Review Q3 Pipeline Analysis',
    description: 'Jordan needs to complete the slide deck for the Q3 pipeline review.',
    assigneeId: 'u2', // Jordan
    creatorId: 'u1',  // Alex (Admin)
    status: 'review', // Waiting for Alex to accept
    priority: 'high',
    dueDate: '2023-11-15',
    type: 'Research',
    attachments: [
      { id: 'a1', name: 'q3_data.xlsx', url: '#', type: 'application/xlsx', size: 1024 * 50 },
      { id: 'a2', name: 'summary.pdf', url: '#', type: 'application/pdf', size: 1024 * 500 }
    ]
  },
  {
    id: 't2',
    title: 'Draft Contract for Nexus Tech',
    description: 'Prepare the initial MSA for Alice Freeman based on the template.',
    assigneeId: 'u3', // Taylor
    creatorId: 'u1',  // Alex (Admin)
    status: 'review',
    priority: 'medium',
    dueDate: '2023-10-28', // Past date for "Overdue" but completed
    type: 'Admin',
    leadId: '1'
  },
  {
    id: 't3',
    title: 'Client Onboarding - Starlight',
    description: 'Set up the accounts for Bob Chen.',
    assigneeId: 'u2',
    creatorId: 'u1',
    status: 'review',
    priority: 'low',
    dueDate: '2023-11-20',
    type: 'Admin',
    leadId: '2'
  },
  
  // User 1 (Admin) To Do List
  {
    id: 't4',
    title: 'Prepare Board Meeting Deck',
    description: 'Consolidate reports from all departments.',
    assigneeId: 'u1',
    creatorId: 'u1',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
    type: 'Meeting'
  },
  {
    id: 't5',
    title: 'Approve Budget for Marketing',
    assigneeId: 'u1',
    creatorId: 'u1',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday (Overdue)
    type: 'Admin'
  },
  
  // User 3 (User) Tasks
  {
    id: 't6',
    title: 'Call Starlight Media',
    assigneeId: 'u3',
    creatorId: 'u2',
    status: 'todo',
    priority: 'high',
    dueDate: '2023-11-12',
    leadId: '2',
    type: 'Call'
  },
  {
    id: 't7',
    title: 'Email campaign for Cold Leads',
    assigneeId: 'u3',
    creatorId: 'u2',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2023-11-30',
    type: 'Email'
  },
  
  // New User 4 Tasks
  {
    id: 't8',
    title: 'Design Logo Variations',
    assigneeId: 'u4',
    creatorId: 'u1',
    status: 'review',
    priority: 'medium',
    dueDate: '2023-11-01',
    type: 'Proposal'
  },
  {
    id: 't9',
    title: 'Update Website Assets',
    assigneeId: 'u4',
    creatorId: 'u2',
    status: 'todo',
    priority: 'low',
    dueDate: '2023-12-01',
    type: 'Admin'
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
    targetName: 'Draft Contract for Nexus Tech',
    details: 'Created new task assigned to Taylor Rep',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'h3',
    action: 'TASK_REVIEW',
    userId: 'u3',
    userName: 'Taylor Rep',
    targetId: 't2',
    targetName: 'Draft Contract for Nexus Tech',
    details: 'Submitted task for review',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    id: 'h4',
    action: 'LEAD_CREATE',
    userId: 'u1',
    userName: 'Alex Founder',
    targetId: '12',
    targetName: 'Darryl Philbin',
    details: 'Created new lead from Partner source',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  },
  {
    id: 'h5',
    action: 'USER_ADD',
    userId: 'u1',
    userName: 'Alex Founder',
    targetId: 'u4',
    targetName: 'Casey Design',
    details: 'Added user: Casey Design (user)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  },
  {
    id: 'h6',
    action: 'TASK_UPDATE',
    userId: 'u1',
    userName: 'Alex Founder',
    targetId: 't5',
    targetName: 'Approve Budget for Marketing',
    details: 'Changed priority to Medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() // 26 hours ago
  },
  {
    id: 'h7',
    action: 'LEAD_STAGE_CHANGE',
    userId: 'u2',
    userName: 'Jordan Sales',
    targetId: '8',
    targetName: 'Ryan Howard',
    details: 'Moved from Proposal to Lost',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
  }
];
