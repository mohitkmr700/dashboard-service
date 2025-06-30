import { LucideIcon } from "lucide-react";

export type UserRole = "admin" | "user";

export interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
  role?: UserRole;
}

// Task status enum with the 4 required values
export enum TaskStatus {
  PENDING = 'pending',
  BACKLOG = 'backlog',
  PROGRESS = 'progress',
  COMPLETED = 'completed'
}

export interface Task {
  id: string;
  collectionId: string;
  collectionName: string;
  title: string;
  description: string;
  email: string;
  is_done: boolean | null;
  progress: number;
  status: TaskStatus; // New status field
  deadline: string | null;
  created: string;
  updated: string;
  completed_at: string | null;
}

export type CreateTaskInput = Omit<Task, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>;

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'punisher' | 'admin';
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  profile_picture?: string;
} 