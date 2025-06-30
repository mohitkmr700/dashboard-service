"use client";

import { Card, CardContent } from "./ui/card";
import { CheckCircle2, Clock, AlertCircle, ListTodo } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: ListTodo,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    },
    {
      title: "Pending",
      value: stats.pendingTasks,
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10"
    }
  ];

  return (
    <>
      {items.map((item) => (
        <Card key={item.title} className="border-none shadow-sm">
          <CardContent className="p-3 h-20 flex items-center justify-center">
            <div className="flex items-center justify-center gap-3">
              <div className={`p-1.5 rounded-lg ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
} 