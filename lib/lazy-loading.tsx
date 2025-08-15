"use client";

import React, { Suspense, lazy } from 'react';
import { PageShimmer } from '../components/page-shimmer';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Simple lazy loading wrapper
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<any>,
  componentName: string
): React.ComponentType<T> {
  const LazyComponent = lazy(async () => {
    const moduleData = await importFunc();
    const Component = moduleData[componentName] || moduleData.default;
    return { default: Component };
  });

  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<PageShimmer />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Lazy loading for page components
export const LazyExpenseManagement = withLazyLoading(
  () => import('../components/expense/expense-management'),
  'ExpenseManagement'
);

// Lazy loading for plan components
export const LazyPlanSummaryCard = withLazyLoading(
  () => import('../components/plan/plan-summary-card'),
  'PlanSummaryCard'
);

export const LazyPlanProgressChart = withLazyLoading(
  () => import('../components/plan/plan-progress-chart'),
  'PlanProgressChart'
);

export const LazyPlanHistoryTable = withLazyLoading(
  () => import('../components/plan/plan-history-table'),
  'PlanHistoryTable'
);

export const LazySyncPlanButton = withLazyLoading(
  () => import('../components/plan/sync-plan-button'),
  'SyncPlanButton'
);

export const LazyPlanSelector = withLazyLoading(
  () => import('../components/plan/plan-selector'),
  'PlanSelector'
);

export const LazyPlanDetailsBox = withLazyLoading(
  () => import('../components/plan/plan-details-box'),
  'PlanDetailsBox'
);

// Lazy loading for task components
export const LazyTaskTable = withLazyLoading(
  () => import('../components/tasks/task-table'),
  'TaskTable'
);

export const LazyCreateTaskDialog = withLazyLoading(
  () => import('../components/tasks/create-task-dialog'),
  'default'
);

export const LazyEditTaskDialog = withLazyLoading(
  () => import('../components/tasks/edit-task-dialog'),
  'EditTaskDialog'
);

export const LazyProgressGraphCard = withLazyLoading(
  () => import('../components/tasks/progress-graph-card'),
  'ProgressGraphCard'
);

export const LazyStatusTaskBoxes = withLazyLoading(
  () => import('../components/tasks/status-task-boxes'),
  'StatusTaskBoxes'
);

export const LazyDashboardStats = withLazyLoading(
  () => import('../components/DashboardStats'),
  'DashboardStats'
);

// Lazy loading for user components
export const LazyUserPermissionsDialog = withLazyLoading(
  () => import('../components/users/user-permissions-dialog'),
  'UserPermissionsDialog'
);

export const LazyViewUserPermissionsDialog = withLazyLoading(
  () => import('../components/users/view-user-permissions-dialog'),
  'ViewUserPermissionsDialog'
);

export const LazyEditUserPermissionsDialog = withLazyLoading(
  () => import('../components/users/edit-user-permissions-dialog'),
  'EditUserPermissionsDialog'
);

export const LazySignupDialog = withLazyLoading(
  () => import('../components/users/signup-dialog'),
  'SignupDialog'
);

// Lazy loading for layout components
export const LazySidebar = withLazyLoading(
  () => import('../components/sidebar'),
  'Sidebar'
);

export const LazySharedLayout = withLazyLoading(
  () => import('../components/shared-layout'),
  'SharedLayout'
);

export const LazyPageContainer = withLazyLoading(
  () => import('../components/page-container'),
  'PageContainer'
);

export const LazyThemeToggle = withLazyLoading(
  () => import('../components/theme-toggle'),
  'ThemeToggle'
);

// Lazy loading for shimmer components
export const LazyDashboardShimmer = withLazyLoading(
  () => import('../components/dashboard-shimmer'),
  'DashboardShimmer'
);

export const LazyUsersShimmer = withLazyLoading(
  () => import('../components/users-shimmer'),
  'UsersShimmer'
);

export const LazySidebarShimmer = withLazyLoading(
  () => import('../components/sidebar-shimmer'),
  'SidebarShimmer'
);
