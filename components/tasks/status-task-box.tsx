"use client";

import { Task, TaskStatus } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";

interface StatusTaskBoxProps {
  status: TaskStatus;
  tasks: Task[];
  className?: string;
}

interface StatusConfig {
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon?: string;
}

const statusConfigs: Record<TaskStatus, StatusConfig> = {
  [TaskStatus.BACKLOG]: {
    title: "Backlog",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  [TaskStatus.PROGRESS]: {
    title: "In Progress",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  [TaskStatus.COMPLETED]: {
    title: "Completed",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
};

export function StatusTaskBox({ status, tasks, className }: StatusTaskBoxProps) {
  const config = statusConfigs[status];

  return (
    <Card className={cn(
      "h-64 border-2 transition-all duration-200 hover:shadow-md flex flex-col",
      config.borderColor,
      className
    )}>
      <CardHeader className={cn("pb-3 flex-shrink-0", config.bgColor)}>
        <CardTitle className={cn("text-sm font-semibold flex items-center justify-between", config.color)}>
          {config.title}
          <Badge variant="secondary" className={cn("text-xs", config.color, config.bgColor)}>
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 pb-4 pt-2">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              No tasks
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer min-h-[60px] flex items-center"
                >
                  <h4 className="text-sm font-medium text-foreground overflow-hidden text-ellipsis whitespace-nowrap w-full">
                    {task.title}
                  </h4>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 