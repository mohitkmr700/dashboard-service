"use client";

import { Task } from '../../lib/types';
import { TaskTable } from '../../components/tasks/task-table';
import { useGetTasksQuery } from '../../lib/api/apiSlice';
import { useToken } from '../../lib/token-context';
import { useSidebar } from '../../lib/sidebar-context';

export default function TasksPage() {
  // Get token data from token context
  const { decodedToken, isLoading: isTokenLoading, token } = useToken();
  
  // Get sidebar data to ensure permissions are loaded
  const { isLoading: isSidebarLoading } = useSidebar();

  // RTK Query hook for tasks - only call when we have a valid token and email
  const { isLoading: isTasksQueryLoading, error, refetch } = useGetTasksQuery(
    decodedToken?.email || '', 
    { 
      skip: !decodedToken?.email || !token || isTokenLoading || isSidebarLoading 
    }
  );

  // Check if we're fully authenticated and all data is loaded
  const isFullyAuthenticated = !isTokenLoading && !!token && !!decodedToken?.email;
  const isAllDataLoaded = !isSidebarLoading && !isTasksQueryLoading;
  const isPageReady = isFullyAuthenticated && isAllDataLoaded;

  // Check if we're still loading anything
  const isPageLoading = isTokenLoading || isSidebarLoading || (isFullyAuthenticated && isTasksQueryLoading);

  const handleTaskUpdated = (updatedTask: Task) => {
    // RTK Query will automatically update the cache
    console.log('Task updated:', updatedTask);
  };

  // Show loading if anything is still loading or not authenticated
  if (isPageLoading || !isFullyAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Show error if tasks failed to load
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to fetch tasks</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Only render content if we're fully ready and have data
  if (!isPageReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col p-3 md:p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Task List</h1>
        </div>

        <div className="flex-1 overflow-hidden">
          <TaskTable 
            userEmail={decodedToken?.email || ''}
            onTaskUpdated={handleTaskUpdated}
          />
        </div>
      </div>
    </div>
  );
} 