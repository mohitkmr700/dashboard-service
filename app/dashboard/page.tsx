"use client";

import { useState, useEffect } from 'react';
import { Task } from '../../lib/types';
import { getTasks } from '../../lib/api';
import { TaskTable } from '../../components/tasks/task-table';
import { CreateTaskDialog } from '../../components/CreateTaskDialog';
import { DashboardStats } from '../../components/DashboardStats';
import { ProgressGraphCard } from '../../components/tasks/progress-graph-card';
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

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const handleTaskUpdated = () => {
    fetchTasks();
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
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Task Management Dashboard</h1>
          <CreateTaskDialog onTaskCreated={handleTaskCreated} />
        </div>

        <div className="flex-1 grid gap-4 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardStats stats={{
              totalTasks: tasks.length,
              completedTasks: tasks.filter(task => task.is_done).length,
              inProgressTasks: tasks.filter(task => !task.is_done && task.progress > 0).length,
              pendingTasks: tasks.filter(task => !task.is_done && task.progress === 0).length,
            }} />
          </div>
          
          <ProgressGraphCard tasks={tasks} />

          <div className="flex-1 overflow-hidden">
            <TaskTable 
              tasks={tasks} 
              onDelete={handleDeleteTask} 
              onEdit={() => {}} 
              onTaskUpdated={handleTaskUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 