"use client";

import { Task, TaskStatus } from "../../lib/types";
import { StatusTaskBox } from "./status-task-box";
import { useMemo } from "react";

interface StatusTaskBoxesProps {
  tasks: Task[];
  className?: string;
}

export function StatusTaskBoxes({ tasks, className }: StatusTaskBoxesProps) {
  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {
      [TaskStatus.BACKLOG]: [] as Task[],
      [TaskStatus.PROGRESS]: [] as Task[],
      [TaskStatus.COMPLETED]: [] as Task[],
    };

    tasks.forEach((task) => {
      // Use the new status field if available, otherwise fall back to old logic
      let status = task.status;
      
      if (!status) {
        // Fallback logic for backward compatibility
        if (task.is_done) {
          status = TaskStatus.COMPLETED;
        } else if (task.progress > 0) {
          status = TaskStatus.PROGRESS;
        } else {
          status = TaskStatus.BACKLOG;
        }
      }

      if (grouped[status]) {
        grouped[status].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 ${className || ''}`}>
      <StatusTaskBox 
        status={TaskStatus.BACKLOG} 
        tasks={tasksByStatus[TaskStatus.BACKLOG]} 
      />
      <StatusTaskBox 
        status={TaskStatus.PROGRESS} 
        tasks={tasksByStatus[TaskStatus.PROGRESS]} 
      />
      <StatusTaskBox 
        status={TaskStatus.COMPLETED} 
        tasks={tasksByStatus[TaskStatus.COMPLETED]} 
      />
    </div>
  );
} 