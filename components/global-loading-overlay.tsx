"use client";

import { useLoading } from '../lib/loading-context';
import { useToken } from '../lib/token-context';
import { useSidebar } from '../lib/sidebar-context';
import { memo, useEffect, useState } from 'react';

export const GlobalLoadingOverlay = memo(function GlobalLoadingOverlay() {
  const { isLoading, loadingMessage, isLoggingOut } = useLoading();
  const { isLoading: isTokenLoading } = useToken();
  const { isLoading: isSidebarLoading } = useSidebar();
  
  const [showOverlay, setShowOverlay] = useState(false);

  // Show loading overlay when any of these are loading
  const shouldShow = isLoading || isTokenLoading || isSidebarLoading || isLoggingOut;

  // Add a small delay to prevent flickering and ensure smooth transitions
  useEffect(() => {
    if (shouldShow) {
      setShowOverlay(true);
    } else {
      // Clear overlay immediately when shouldShow becomes false
      setShowOverlay(false);
    }
  }, [shouldShow]);

  // Force clear overlay after a maximum time to prevent getting stuck
  useEffect(() => {
    if (showOverlay) {
      const maxLoadingTime = 10000; // 10 seconds max
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, maxLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [showOverlay]);

  if (!showOverlay) {
    return null;
  }

  // Determine the appropriate message
  const getMessage = () => {
    if (isLoggingOut) return 'Logging out...';
    if (isTokenLoading) return 'Authenticating...';
    if (isSidebarLoading) return 'Loading permissions...';
    return loadingMessage || 'Please wait...';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-sm text-muted-foreground">
            {getMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}); 