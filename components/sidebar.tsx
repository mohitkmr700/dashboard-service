"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings, BarChart, FileText, Mail } from "lucide-react";
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

const routes = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Analytics", icon: BarChart, href: "/analytics" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Documents", icon: FileText, href: "/documents" },
  { label: "Messages", icon: Mail, href: "/messages" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface DecodedToken {
  profile_picture: string;
  full_name: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [decodedToken, setDecodedToken] = useState<DecodedToken>();
  const { clearToken } = useToken();

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

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
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
