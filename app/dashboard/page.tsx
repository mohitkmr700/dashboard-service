"use client";

import { useState, useEffect } from 'react';
import { Task } from '../../lib/types';
import { getTasks, deleteTask } from '../../lib/api';
import { TaskTable } from '../../components/tasks/task-table';
import { CreateTaskDialog } from '../../components/CreateTaskDialog';
import { DashboardStats } from '../../components/DashboardStats';
import { Progress } from '../../components/ui/progress';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks('mohit2010sm@gmail.com');
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.is_done).length,
    inProgressTasks: tasks.filter(task => !task.is_done && task.progress > 0).length,
    pendingTasks: tasks.filter(task => !task.is_done && task.progress === 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Progress value={33} className="w-48 mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Task Management Dashboard</h1>
        <CreateTaskDialog onTaskCreated={handleTaskCreated} />
      </div>

      <DashboardStats stats={stats} />

      <div className="mt-8">
        <TaskTable tasks={tasks} onDelete={handleDeleteTask} onEdit={() => {}} />
      </div>
    </div>
  );
} 