import { LucideIcon } from "lucide-react";

export type UserRole = "admin" | "user";

export interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
  role?: UserRole;
}

export type TaskStatus = 'completed' | 'pending' | 'in_progress' | 'overdue' | 'urgent';

export interface Task {
  id: string;
  collectionId: string;
  collectionName: string;
  title: string;
  description: string;
  email: string;
  is_done: boolean;
  progress: number;
  deadline: string;
  created: string;
  updated: string;
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
  name: string;
  email: string;
  role: 'user' | 'punisher';
} 