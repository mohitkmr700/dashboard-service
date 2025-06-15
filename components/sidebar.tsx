"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings, BarChart, FileText, Mail } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const routes = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Analytics", icon: BarChart, href: "/analytics" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Documents", icon: FileText, href: "/documents" },
  { label: "Messages", icon: Mail, href: "/messages" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

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
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
} 