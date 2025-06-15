import { Task } from "../lib/types";
import { format, parseISO } from "date-fns";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTask } from "../lib/api";

interface TaskTableProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEdit?: (task: Task) => void;
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
  if (task.is_done) return { color: 'bg-green-500', label: 'Completed' };
  if (task.progress > 0) return { color: 'bg-blue-500', label: 'In Progress' };
  return { color: 'bg-yellow-500', label: 'Pending' };
};

export function TaskTable({ tasks, onDeleteTask }: TaskTableProps) {
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteTask(id);
      if (response.statusCode === 200) {
        toast.success(response.message);
        onDeleteTask(id);
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Progress</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Deadline</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const status = getStatusInfo(task);
            return (
              <tr key={task.id} className="border-b">
                <td className="p-4 align-middle">{task.title}</td>
                <td className="p-4 align-middle">{task.description}</td>
                <td className="p-4 align-middle">
                  <Progress value={task.progress} className="w-24" />
                </td>
                <td className="p-4 align-middle">{formatDate(task.deadline)}</td>
                <td className="p-4 align-middle">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color} text-white`}>
                    {status.label}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 