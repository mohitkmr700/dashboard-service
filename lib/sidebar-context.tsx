"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { modules } from './modules';
import { useGetUserPermissionsQuery } from './api/apiSlice';
import { useToken } from './token-context';

interface SidebarContextType {
  decodedToken: {
    profile_picture: string;
    full_name: string;
    email: string;
  } | null;
  visibleModules: string[];
  isLoading: boolean;
  setVisibleModules: (modules: string[]) => void;
  refreshPermissions: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [visibleModules, setVisibleModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Get token data from token context
  const { decodedToken, isLoading: isTokenLoading } = useToken();

  // Only fetch permissions when token is loaded and email is available
  const shouldFetchPermissions = !isTokenLoading && !!decodedToken?.email;
  const { data: userPermissionsData, isLoading: isLoadingPermissions, refetch } =
    useGetUserPermissionsQuery(decodedToken?.email || '', { 
      skip: !shouldFetchPermissions,
      // Add polling to keep permissions fresh
      pollingInterval: 30000, // Poll every 30 seconds
    });

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    decodedToken,
    visibleModules,
    isLoading,
    setVisibleModules,
    refreshPermissions: () => {
      setForceRefresh(prev => prev + 1);
      if (shouldFetchPermissions) {
        refetch();
      }
    }
  }), [decodedToken, visibleModules, isLoading, shouldFetchPermissions, refetch]);

  // Handle permissions data when loaded - ONLY show modules from API
  useEffect(() => {
    if (!shouldFetchPermissions) {
      // Don't do anything until token is loaded and email is available
      return;
    }

    if (userPermissionsData?.data) {
      const apiPermissions = userPermissionsData.data;
      
      // Only show modules that are explicitly set to true in the API response
      const visibleModuleIds = modules.filter(module => {
        const isVisible = apiPermissions.modules[module.id] === true;
        return isVisible;
      }).map(module => module.id);
      
      setVisibleModules(visibleModuleIds);
      localStorage.setItem('visibleModules', JSON.stringify(visibleModuleIds));
    } else if (!isLoadingPermissions && shouldFetchPermissions) {
      // If API returns no data, show NO modules (not all)
      setVisibleModules([]);
      localStorage.setItem('visibleModules', JSON.stringify([]));
    }
  }, [userPermissionsData, decodedToken?.email, isLoadingPermissions, shouldFetchPermissions, forceRefresh]);

  // Update loading state based on token and permissions loading
  useEffect(() => {
    setIsLoading(isTokenLoading || (!!decodedToken?.email && isLoadingPermissions));
  }, [isTokenLoading, decodedToken?.email, isLoadingPermissions]);

  // Listen for permission updates from the permissions dialog
  useEffect(() => {
    const handlePermissionsUpdate = (event: CustomEvent) => {
      const { visibleModules: newVisibleModules } = event.detail;
      setVisibleModules(newVisibleModules);
      localStorage.setItem('visibleModules', JSON.stringify(newVisibleModules));
      
      // Force a refresh of the permissions API to ensure consistency
      setTimeout(() => {
        if (shouldFetchPermissions) {
          refetch();
        }
      }, 1000);
    };

    const handlePermissionsRefresh = () => {
      // Force a refresh of the permissions API
      if (shouldFetchPermissions) {
        refetch();
      }
    };

    window.addEventListener('permissionsUpdated', handlePermissionsUpdate as EventListener);
    window.addEventListener('permissionsRefresh', handlePermissionsRefresh);

    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdate as EventListener);
      window.removeEventListener('permissionsRefresh', handlePermissionsRefresh);
    };
  }, [shouldFetchPermissions, refetch]);

  // Listen for route changes to refresh permissions
  useEffect(() => {
    const handleRouteChange = () => {
      // Refresh permissions when route changes
      if (shouldFetchPermissions) {
        refetch();
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('pushstate', handleRouteChange);
    window.addEventListener('replacestate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('pushstate', handleRouteChange);
      window.removeEventListener('replacestate', handleRouteChange);
    };
  }, [shouldFetchPermissions, refetch]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 