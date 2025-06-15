import { Task, DashboardStats } from './types';

export const dummyTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Set up JWT authentication and user sessions',
    status: 'completed',
    progress: 100,
    deadline: '2024-03-20T00:00:00Z',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    completed_at: '2024-03-15T00:00:00Z',
    email: 'mohit2010sm@gmail.com'
  },
  {
    id: '2',
    title: 'Design dashboard layout',
    description: 'Create responsive dashboard with dark/light mode',
    status: 'in_progress',
    progress: 75,
    deadline: '2024-03-25T00:00:00Z',
    created_at: '2024-03-05T00:00:00Z',
    updated_at: '2024-03-18T00:00:00Z',
    completed_at: null,
    email: 'mohit2010sm@gmail.com'
  },
  {
    id: '3',
    title: 'Implement task CRUD operations',
    description: 'Create API endpoints for task management',
    status: 'pending',
    progress: 0,
    deadline: '2024-03-30T00:00:00Z',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
    completed_at: null,
    email: 'mohit2010sm@gmail.com'
  },
  {
    id: '4',
    title: 'Add data visualization',
    description: 'Implement charts for task statistics',
    status: 'urgent',
    progress: 25,
    deadline: '2024-03-22T00:00:00Z',
    created_at: '2024-03-12T00:00:00Z',
    updated_at: '2024-03-18T00:00:00Z',
    completed_at: null,
    email: 'mohit2010sm@gmail.com'
  }
];

export const dummyStats: DashboardStats = {
  totalTasks: 4,
  completedTasks: 1,
  inProgressTasks: 1,
  pendingTasks: 1,
  overdueTasks: 0
}; 