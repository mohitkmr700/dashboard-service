"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { useToken } from "../lib/token-context";
import { modules } from "../lib/modules";
import { getUserPermissions } from "../lib/api";

interface DecodedToken {
  profile_picture: string;
  full_name: string;
  email: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [decodedToken, setDecodedToken] = useState<DecodedToken>();
  const [visibleModules, setVisibleModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { clearToken } = useToken();

  // Fetch permissions from API on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Get the logged-in user's email from token
        const tokenResponse = await fetch('/api/auth/token');
        const tokenData = await tokenResponse.json();
        const userEmail = tokenData.decoded?.email;
        
        if (userEmail) {
          const apiResponse = await getUserPermissions(userEmail);
          const apiPermissions = apiResponse.data;
          
          // Extract visible modules for sidebar control
          const visibleModuleIds = modules.filter(module => 
            apiPermissions.modules[module.id] === true
          ).map(module => module.id);
          
          console.log('Fetched permissions from API for', userEmail, ':', visibleModuleIds);
          
          setVisibleModules(visibleModuleIds);
          
          // Store in localStorage for persistence
          localStorage.setItem('visibleModules', JSON.stringify(visibleModuleIds));
        } else {
          console.error('No user email found in token');
          // Default to all modules if no email
          setVisibleModules(modules.map(m => m.id));
        }
      } catch (error) {
        console.error('Error fetching permissions from API:', error);
        
        // Fallback to localStorage if API fails
        const storedModules = localStorage.getItem('visibleModules');
        if (storedModules) {
          try {
            const parsedModules = JSON.parse(storedModules);
            setVisibleModules(parsedModules);
          } catch (error) {
            console.error('Error parsing stored modules:', error);
            // Default to all modules if parsing fails
            setVisibleModules(modules.map(m => m.id));
          }
        } else {
          // Default to all modules if no stored data
          setVisibleModules(modules.map(m => m.id));
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch permissions after a short delay to ensure token is loaded
    const timer = setTimeout(() => {
      fetchPermissions();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Listen for permission updates
  useEffect(() => {
    const handlePermissionsUpdate = (event: CustomEvent) => {
      const { visibleModules: newVisibleModules } = event.detail;
      setVisibleModules(newVisibleModules);
      console.log('Sidebar updated with new permissions:', newVisibleModules);
    };

    window.addEventListener('permissionsUpdated', handlePermissionsUpdate as EventListener);

    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdate as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear token using context
      clearToken();
      
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
      toast({
        title: "Error",
        description: `Failed to logout. Please try again. ${error}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const getToken = async () => {
      const response = await fetch('/api/auth/token');
      const data = await response.json();
      if (data.decoded) {
        setDecodedToken(data.decoded);
      }
    }
    getToken();
  }, []);

  // Filter modules based on permissions
  const filteredModules = modules.filter(module => 
    visibleModules.includes(module.id)
  );

  if (loading) {
    return (
      <div className="flex h-screen w-64 flex-col border-r bg-background">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <ThemeToggle />
        </div>

        {/* Loading Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading permissions...</p>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="mt-auto">
              <div className="flex w-full items-center gap-2 rounded-lg p-2">
                <Avatar>
                  <AvatarImage src={decodedToken?.profile_picture || 'U'} alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{decodedToken?.full_name || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredModules.map((module) => {
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
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-accent">
                  <Avatar>
                    <AvatarImage src={decodedToken?.profile_picture || 'U'} alt="User" />
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
} 
