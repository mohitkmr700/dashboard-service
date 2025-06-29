import { Shimmer } from "./ui/shimmer";
import { Home, BarChart3, FileText, MessageSquare, Settings, Users } from "lucide-react";

export function SidebarShimmer() {
  // Show all 6 navigation items to match the modules
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo/Header Shimmer - matches exact height and padding */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Shimmer className="h-6 w-24 rounded" />
        <Shimmer className="h-6 w-6 rounded" />
      </div>

      {/* Navigation Items Shimmer - matches exact spacing and padding */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 rounded-lg px-3 py-2">
            <Shimmer className="h-5 w-5 rounded" />
            <Shimmer className="h-4 flex-1 rounded" />
          </div>
        ))}
      </nav>

      {/* Bottom Section Shimmer - matches exact layout */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="mt-auto">
            <div className="flex w-full items-center gap-2 rounded-lg p-2">
              <Shimmer className="h-8 w-8 rounded-full" />
              <Shimmer className="h-4 w-20 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 