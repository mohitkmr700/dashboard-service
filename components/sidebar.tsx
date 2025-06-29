"use client";

import React, { memo, useCallback, useMemo } from 'react';
import { useSidebar } from '../lib/sidebar-context';
import { useToken } from '../lib/token-context';
import { useLoading } from '../lib/loading-context';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, RefreshCw } from 'lucide-react';
import { modules } from '../lib/modules';
import { useLogoutMutation } from '../lib/api/authSlice';
import { store } from '../lib/store';
import { api } from '../lib/api/apiSlice';
import { authApi } from '../lib/api/authSlice';
import { clearTokenCache } from '../lib/token-api';
import { useToast } from "./ui/use-toast";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarShimmer } from "./sidebar-shimmer";
import { ThemeToggle } from "./theme-toggle";

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { clearToken } = useToken();
  const { decodedToken, visibleModules, isLoading, refreshPermissions } = useSidebar();
  const { setIsLoggingOut, setLoadingMessage } = useLoading();
  const { token } = useToken();

  // RTK Query hooks
  const [logout] = useLogoutMutation();

  // Memoize filtered modules to prevent unnecessary re-renders
  const filteredModules = useMemo(() => {
    return modules.filter(module => visibleModules.includes(module.id));
  }, [visibleModules]);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      setLoadingMessage("Logging out...");
      
      await logout().unwrap();

      // Clear all states
      clearToken();
      clearTokenCache();
      
      // Clear RTK Query cache
      store.dispatch(api.util.resetApiState());
      store.dispatch(authApi.util.resetApiState());
      
      // Clear stored permissions on logout
      localStorage.removeItem('visibleModules');
      
      // Show success message
      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      setIsLoggingOut(false);
      toast({
        title: "Error",
        description: `Failed to logout. Please try again. ${error}`,
        variant: "destructive",
      });
    }
  }, [logout, clearToken, toast, setIsLoggingOut, setLoadingMessage]);

  const handleRefreshPermissions = useCallback(() => {
    refreshPermissions();
    toast({
      title: "Refreshing",
      description: "Permissions refreshed",
    });
  }, [refreshPermissions, toast]);

  // Show shimmer if loading, not authenticated, or no token
  if (isLoading || !decodedToken?.email || !token) {
    return <SidebarShimmer />;
  }

  // Additional check: if we don't have valid authentication, don't render
  if (!decodedToken?.email) {
    return <SidebarShimmer />;
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshPermissions}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredModules.length === 0 ? (
          <div className="text-muted-foreground text-sm px-2 py-4">No modules available</div>
        ) : (
          filteredModules.map((module) => {
            const isActive = pathname === module.href;
            return (
              <Link
                key={module.href}
                href={module.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                }`}
              >
                <module.icon className="h-5 w-5" />
                <span>{module.label}</span>
              </Link>
            );
          })
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-accent">
                  <Avatar>
                    <AvatarImage src={decodedToken?.profile_picture} alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{decodedToken?.full_name || 'User'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}); 
