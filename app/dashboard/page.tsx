"use client";

import { useEffect, useState, useMemo } from 'react';
import { Task } from '../../lib/types';
import { getTasks } from '../../lib/api';
import { ProgressGraphCard } from '../../components/tasks/progress-graph-card';
import { Progress } from '../../components/ui/progress';
import { TaskTable } from '../../components/tasks/task-table';
import { DashboardStats } from '../../components/DashboardStats';
import { CreateTaskDialog } from '../../components/CreateTaskDialog';

interface DecodedToken {
  profile_picture: string | 'U';
  full_name: string | 'User';
  email: string | 'notworking@gmail.com';
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedToken>();

  const fetchTasks = async (email: string) => {
    try {
      setLoading(true);
      const data = await getTasks(email);
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
    const getToken = async () => {
      try {
        const response = await fetch('/api/auth/token');
        const data = await response.json();
        if (data.decoded) {
          setDecodedToken(data.decoded);
        }
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    if (decodedToken) {
      fetchTasks(decodedToken.email);
    }
  }, [decodedToken]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  // Memoize the stats to prevent unnecessary recalculations
  const stats = useMemo(() => ({
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.is_done).length,
    inProgressTasks: tasks.filter(task => !task.is_done && task.progress > 0).length,
    pendingTasks: tasks.filter(task => !task.is_done && task.progress === 0).length,
  }), [tasks]);

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
            onClick={() => fetchTasks(decodedToken?.email || 'notworking@gmail.com')}
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
            <DashboardStats stats={stats} />
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