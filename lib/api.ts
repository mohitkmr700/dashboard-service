import { Task, CreateTaskInput, User } from './types';
import { getStoredToken } from './token-context';

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

export async function getUsers(): Promise<User[]> {
  // console.log('Calling server-side API route for users');
  
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // console.log('Server response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server API Error:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  // console.log('Server API Success:', data);
  return data;
}

export async function getUser(id: string): Promise<User> {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth-service.algoarena.co.in';
  const token = getStoredToken();
  
  const response = await fetch(`${authDomain}/user/profiles/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Cookie: `access_token=${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth-service.algoarena.co.in';
  const token = getStoredToken();
  
  const response = await fetch(`${authDomain}/user/profiles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Cookie: `access_token=${token}` }),
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  
  return response.json();
}

export async function deleteUser(id: string): Promise<{ statusCode: number; message: string }> {
  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth-service.algoarena.co.in';
  const token = getStoredToken();
  
  const response = await fetch(`${authDomain}/user/profiles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Cookie: `access_token=${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  
  return response.json();
} 