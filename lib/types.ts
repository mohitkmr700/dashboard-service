import { LucideIcon } from "lucide-react";

export type UserRole = "admin" | "user";

export interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
  role?: UserRole;
}

// Task status enum with the 3 required values (removed PENDING)
export enum TaskStatus {
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

// Expense Plan Types
export interface PlannedExpenseItem {
  id: string;
  category: string;
  planned_amount: number;
  actual_paid?: number;
  variance?: number;
  description?: string;
  created?: string;
  updated?: string;
}

export interface ExpensePlan {
  id: string;
  name: string;
  month: string;
  year: number;
  version: number;
  total_planned: number;
  total_actual: number;
  total_variance: number;
  savings: number;
  is_active: boolean;
  created: string;
  updated: string;
  planned_expense_items: PlannedExpenseItem[];
}

// New types for plans list
export interface PlanListItem {
  id: number;
  month: string;
  plan_name: string;
  version: number;
  is_active: boolean;
  created_at: string;
  notes?: string;
  planned_expense_items: {
    id: number;
    category: string;
    planned_amount: number;
  }[];
}

export interface PlansListResponse {
  success: boolean;
  data: PlanListItem[];
}

export interface SyncPlanPayload {
  month: string;
  year: number;
  prompt?: string;
}

export interface VarianceResult {
  category: string;
  planned_amount: number;
  actual_paid: number;
  variance: number;
  percentage_variance: number;
}

export interface PlanSummary {
  total_planned: number;
  total_actual: number;
  total_variance: number;
  percentage_fulfilled: number;
  savings: number;
  is_over_budget: boolean;
} 