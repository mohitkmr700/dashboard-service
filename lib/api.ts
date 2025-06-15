import { Task, CreateTaskInput } from './types';

export async function getTasks(email: string): Promise<Task[]> {
  const response = await fetch(`/api/proxy/list?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }
  return response.json();
}

export async function createTask(task: CreateTaskInput): Promise<Task> {
  const response = await fetch('/api/proxy/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
}

export async function deleteTask(id: string): Promise<{ statusCode: number; message: string; data: { id: string } }> {
  const response = await fetch('/api/proxy/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
  
  return response.json();
} 