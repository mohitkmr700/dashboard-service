import { NextResponse } from 'next/server';
import { dummyTasks } from '@/lib/dummy-data';
import { Task } from '@/lib/types';

// GET /api/tasks
export async function GET() {
  try {
    // In a real app, this would fetch from a database
    return NextResponse.json(dummyTasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real app, this would save to a database
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      title: body.title,
      description: body.description,
      deadline: body.deadline,
      status: 'pending',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      email: body.email || 'mohit2010sm@gmail.com'
    };

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 