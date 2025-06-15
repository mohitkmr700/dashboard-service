import { NextResponse } from 'next/server';
import { dummyTasks } from '@/lib/dummy-data';
import { Task } from '@/lib/types';

// GET /api/tasks/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = dummyTasks.find(t => t.id === params.id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const taskIndex = dummyTasks.findIndex(t => t.id === params.id);

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // In a real app, this would update in a database
    const updatedTask: Task = {
      ...dummyTasks[taskIndex],
      ...body,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskIndex = dummyTasks.findIndex(t => t.id === params.id);

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // In a real app, this would delete from a database
    dummyTasks.splice(taskIndex, 1);

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 