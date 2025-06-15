"use client";

import { useState } from 'react';
import { TaskTable } from '@/components/tasks/task-table';
import CreateTaskDialog from '@/components/tasks/create-task-dialog';
import { Task } from '@/lib/types';
import { dummyTasks } from '@/lib/dummy-data';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(dummyTasks);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleTaskCreated = () => {
    // In a real app, this would fetch the updated tasks from the API
    setIsCreateDialogOpen(false);
  };

  const handleEditTask = (task: Task) => {
    // In a real app, this would open an edit dialog
    console.log('Edit task:', task);
  };

  const handleDeleteTask = (taskId: string) => {
    // In a real app, this would call the API to delete the task
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <CreateTaskDialog onTaskCreated={handleTaskCreated} />
      </div>
      <TaskTable
        tasks={tasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
} 