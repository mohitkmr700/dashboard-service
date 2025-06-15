import { Task } from "../lib/types";
import { format } from "date-fns";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

interface TaskTableProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

export function TaskTable({ tasks, onDeleteTask }: TaskTableProps) {
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
          {tasks.map((task) => (
            <tr key={task.id} className="border-b">
              <td className="p-4 align-middle">{task.title}</td>
              <td className="p-4 align-middle">{task.description}</td>
              <td className="p-4 align-middle">
                <Progress value={task.progress} className="w-24" />
              </td>
              <td className="p-4 align-middle">
                {format(new Date(task.deadline), "MMM d, yyyy")}
              </td>
              <td className="p-4 align-middle">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    task.is_done
                      ? "bg-green-100 text-green-800"
                      : task.progress > 0
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {task.is_done
                    ? "Completed"
                    : task.progress > 0
                    ? "In Progress"
                    : "Pending"}
                </span>
              </td>
              <td className="p-4 align-middle">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 