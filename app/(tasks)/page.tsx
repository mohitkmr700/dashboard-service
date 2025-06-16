"use client";

import { useState, useEffect } from 'react';
import { Task } from '../../lib/types';
import { getTasks, deleteTask } from '../../lib/api';
import { TaskTable } from '../../components/TaskTable';
import { CreateTaskDialog } from '../../components/CreateTaskDialog';

export default function TasksPage() {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <CreateTaskDialog onTaskCreated={handleTaskCreated} />
      </div>

      <div className="mt-8">
        <TaskTable tasks={tasks} onDeleteTask={handleDeleteTask} onEdit={() => {}} />
      </div>
    </div>
  );
} 