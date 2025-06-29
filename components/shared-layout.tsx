"use client";

import React, { memo } from 'react';
import { Sidebar } from './sidebar';
import { SidebarProvider } from '../lib/sidebar-context';
import { useToken } from '../lib/token-context';
import { DashboardShimmer } from './dashboard-shimmer';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export const SharedLayout = memo(function SharedLayout({ children }: SharedLayoutProps) {
  const { token, isLoading: isTokenLoading, decodedToken } = useToken();
  
  // Check if we're fully authenticated
  const isFullyAuthenticated = !isTokenLoading && !!token && !!decodedToken?.email;

  // If still loading token, show shimmer
  if (isTokenLoading) {
    return <DashboardShimmer />;
  }

  // If not authenticated and token loading is done, redirect to login
  if (!isFullyAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return <DashboardShimmer />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}); 