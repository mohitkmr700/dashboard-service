"use client";

import { Task } from "../../lib/types";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteTask } from "../../lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { EditTaskDialog } from "./edit-task-dialog";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onTaskUpdated: () => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No deadline';
  
  try {
    const date = parseISO(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

const getStatusInfo = (task: Task) => {
  if (task.is_done) {
    return {
      color: 'bg-green-500/10',
      border: 'border border-green-500/20',
      text: 'text-green-500',
      label: 'Completed'
    };
  }
  if (task.progress > 0) {
    return {
      color: 'bg-blue-500/10',
      border: 'border border-blue-500/20',
      text: 'text-blue-500',
      label: 'In Progress'
    };
  }
  return {
    color: 'bg-yellow-500/10',
    border: 'border border-yellow-500/20',
    text: 'text-yellow-500',
    label: 'Pending'
  };
};

const getDeadlineColor = (task: Task) => {
  if (!task.deadline || !task.updated) return 'text-muted-foreground';
  
  try {
    const deadline = parseISO(task.deadline);
    const updated = parseISO(task.updated);
    
    // Set both dates to start of day for comparison
    const deadlineStart = startOfDay(deadline);
    const updatedStart = startOfDay(updated);
    
    if (updatedStart > deadlineStart) {
      return 'text-red-500';
    } else if (updatedStart < deadlineStart) {
      return 'text-green-500';
    }
    return 'text-muted-foreground';
  } catch {
    return 'text-muted-foreground';
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 100) return {
    bg: 'bg-green-500',
    glow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]',
    text: 'text-white'
  };
  if (progress >= 75) return {
    bg: 'bg-blue-500',
    glow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    text: 'text-white'
  };
  if (progress >= 50) return {
    bg: 'bg-yellow-500',
    glow: 'shadow-[0_0_10px_rgba(234,179,8,0.5)]',
    text: 'text-black'
  };
  if (progress >= 25) return {
    bg: 'bg-orange-500',
    glow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]',
    text: 'text-white'
  };
  return {
    bg: 'bg-red-500',
    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    text: 'text-white'
  };
};

export function TaskTable({ tasks, onEdit, onDelete, onTaskUpdated }: TaskTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Update local tasks when props change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Sort tasks by updated timestamp in descending order
  const sortedTasks = useMemo(() => {
    return [...localTasks].sort((a, b) => {
      const dateA = a.updated ? new Date(a.updated).getTime() : 0;
      const dateB = b.updated ? new Date(b.updated).getTime() : 0;
      return dateB - dateA;
    });
  }, [localTasks]);

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setEditDialogOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setLocalTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    onTaskUpdated();
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      const response = await deleteTask(taskToDelete);
      if (response.statusCode === 200) {
        toast.success(response.message || 'Task deleted successfully');
        setLocalTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
        onDelete(taskToDelete);
        onTaskUpdated();
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border h-full flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/50 z-10">
              <tr className="border-b bg-background">
                <th className="h-10 px-3 text-left align-middle font-medium text-xs">Title</th>
                <th className="h-10 px-3 text-left align-middle font-medium text-xs">Status</th>
                <th className="h-10 px-3 text-left align-middle font-medium text-xs">Progress</th>
                <th className="h-10 px-3 text-left align-middle font-medium text-xs">Deadline</th>
                <th className="h-10 px-3 text-left align-middle font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => {
                const status = getStatusInfo(task);
                const deadlineColor = getDeadlineColor(task);
                const progressColors = getProgressColor(task.progress);
                return (
                  <tr key={task.id} className="border-b">
                    <td className="p-3">
                      <div>
                        <div className="font-mono text-sm tracking-wide">
                          {task.title.split(' ').map((word, index) => (
                            <span key={index}>
                              {index === 0 ? (
                                <span className="text-base font-semibold">{word.charAt(0).toUpperCase()}</span>
                              ) : (
                                word.charAt(0)
                              )}
                              {word.slice(1)}
                              {' '}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-muted-foreground/85 mt-0.5 line-clamp-1 font-medium">
                          {task.description}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${status.color} ${status.border} ${status.text} text-[9px] px-1.5 py-0.5 rounded-sm font-medium transition-all duration-300 whitespace-nowrap min-w-[60px] text-center`}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-[100px] h-4">
                          <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${progressColors.bg} ${progressColors.glow} transition-all duration-300`}
                              style={{ width: `${task.progress}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-[9px] font-medium ${progressColors.text} whitespace-nowrap`}>
                                {task.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`${deadlineColor} text-[9px] font-medium`}>
                        {formatDate(task.deadline)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(task)}
                          className="h-7 w-7"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(task.id)}
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditTaskDialog
        task={taskToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  );
} 