"use client";

import { useEffect, useMemo } from 'react';
import { Task, TaskStatus } from '../../lib/types';
import { ProgressGraphCard } from '../../components/tasks/progress-graph-card';
import { StatusTaskBoxes } from '../../components/tasks/status-task-boxes';
import { DashboardStats } from '../../components/DashboardStats';
import CreateTaskDialog from '../../components/tasks/create-task-dialog';
import { DashboardShimmer } from '../../components/dashboard-shimmer';
import { useGetTasksQuery } from '../../lib/api/apiSlice';
import { useLoading } from '../../lib/loading-context';
import { useToken } from '../../lib/token-context';
import { useSidebar } from '../../lib/sidebar-context';

export default function DashboardPage() {
  const { setIsLoading, setLoadingMessage } = useLoading();

  // Get token data from token context
  const { decodedToken, isLoading: isTokenLoading, token } = useToken();
  
  // Get sidebar data to ensure permissions are loaded
  const { isLoading: isSidebarLoading } = useSidebar();

  // RTK Query hook for tasks - only call when we have a valid token and email
  const { data: tasks = [], isLoading: isTasksQueryLoading, error, refetch } = useGetTasksQuery(
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

  useEffect(() => {
    // If no token and token loading is done, redirect to login
    if (!isTokenLoading && !token) {
      window.location.href = '/login';
      return;
    }

    // If we have token but no decoded token, wait
    if (token && !decodedToken?.email) {
      setLoadingMessage("Validating authentication...");
      return;
    }

    // If we have decoded token, start loading dashboard
    if (decodedToken?.email) {
      setLoadingMessage("Loading your dashboard...");
    }
  }, [decodedToken, isTokenLoading, token, setLoadingMessage]);

  // Clear loading state once all data is loaded
  useEffect(() => {
    if (isPageReady && !error) {
      setLoadingMessage("Dashboard ready!");
      // Clear loading state immediately without delay
      setIsLoading(false);
    }
  }, [isPageReady, error, setIsLoading, setLoadingMessage]);

  // Fallback: Clear loading state after a maximum time to prevent getting stuck
  useEffect(() => {
    if (isFullyAuthenticated) {
      const maxLoadingTime = 8000; // 8 seconds max
      const timer = setTimeout(() => {

        setIsLoading(false);
      }, maxLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [isFullyAuthenticated, setIsLoading]);

  // Cleanup effect to reset loading state on unmount
  useEffect(() => {
    return () => {
      // Reset loading state when component unmounts
      setIsLoading(false);
    };
  }, [setIsLoading]);

  const handleTaskCreated = () => {
    // RTK Query will automatically refetch tasks when cache is invalidated
    refetch();
  };

  // Memoize the stats to prevent unnecessary recalculations
  const stats = useMemo(() => ({
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task: Task) => task.is_done).length,
    inProgressTasks: tasks.filter((task: Task) => task.status === TaskStatus.PROGRESS).length,
    pendingTasks: tasks.filter((task: Task) => task.status === TaskStatus.BACKLOG).length,
  }), [tasks]);

  // Show shimmer if anything is still loading or not authenticated
  if (isPageLoading || !isFullyAuthenticated) {
    return <DashboardShimmer />;
  }

  // Show error if tasks failed to load
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to fetch dashboard data</p>
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
    return <DashboardShimmer />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col p-3 md:p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Task Management Dashboard</h1>
          <CreateTaskDialog onTaskCreated={handleTaskCreated} />
        </div>

        <div className="flex-1 grid gap-3 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4  mt-2 h-2">
            <DashboardStats stats={stats} />
          </div>
          
          <ProgressGraphCard tasks={tasks} />
          
          {/* Status Task Boxes */}
          <StatusTaskBoxes tasks={tasks} />
        </div>
      </div>
    </div>
  );
} 