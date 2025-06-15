"use client";

import { Task } from "../../lib/types";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteTask } from "../../lib/api";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const getStatusInfo = (task: Task) => {
  if (task.is_done) {
    return { color: 'bg-green-500', label: 'Completed' };
  }
  if (task.progress > 0) {
    return { color: 'bg-blue-500', label: 'In Progress' };
  }
  return { color: 'bg-yellow-500', label: 'Pending' };
};

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      onDelete(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Progress</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Deadline</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const status = getStatusInfo(task);
            return (
              <tr key={task.id} className="border-b">
                <td className="p-4">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className={`${status.color} text-white`}>
                    {status.label}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="w-[100px]" />
                    <span className="text-sm">{task.progress}%</span>
                  </div>
                </td>
                <td className="p-4">
                  {format(new Date(task.deadline), 'MMM d, yyyy')}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 