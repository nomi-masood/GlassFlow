
export type Stage = 'prospect' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export type LeadActivityType = 'note' | 'call' | 'email' | 'meeting';

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  summary: string;
  details?: string;
  outcome?: string;
  date: string; // ISO string
  duration?: string; // e.g. "15m", "1h"
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: Stage;
  tags: string[];
  lastActive: string;
  avatarUrl?: string;
  lostReason?: string;
  type?: string;
  source?: string;
  notes?: string;
  activities?: LeadActivity[];
  assigneeId?: string;
  createdAt?: string; // ISO string for date added
}

export interface PipelineColumn {
  id: Stage;
  title: string;
  color: string;
}

export type View = 'dashboard' | 'pipeline' | 'lists' | 'tasks' | 'task-feed' | 'users' | 'history' | 'settings';

export type Role = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  avatarUrl: string;
  branchId?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  creatorId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  type?: string;
  leadId?: string;
  attachments?: Attachment[];
}

export type ActionType = 'USER_ADD' | 'USER_DELETE' | 'TASK_CREATE' | 'TASK_UPDATE' | 'TASK_DELETE' | 'TASK_REVIEW' | 'LEAD_CREATE' | 'LEAD_UPDATE' | 'LEAD_DELETE' | 'LEAD_STAGE_CHANGE' | 'LEAD_ACTIVITY_LOG' | 'LEAD_ASSIGN';

export interface HistoryLog {
  id: string;
  action: ActionType;
  userId: string;
  userName: string;
  targetId?: string;
  targetName?: string;
  details: string;
  timestamp: string;
}
