"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUpdateTaskMutation } from '../../lib/api/apiSlice';
import { useToast } from '../ui/use-toast';
import { Task, TaskStatus } from '../../lib/types';
import { format, parseISO, startOfDay } from 'date-fns';

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (task: Task) => void;
}

export function EditTaskDialog({ task, open, onOpenChange, onTaskUpdated }: EditTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [is_done, setIsDone] = useState(false);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.BACKLOG);
  const [previousProgress, setPreviousProgress] = useState(0);
  const { toast } = useToast();

  // RTK Query mutation
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // Get today's date in YYYY-MM-DD format
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setProgress(task.progress);
      setPreviousProgress(task.progress);
      setDeadline(task.deadline ? format(parseISO(task.deadline), 'yyyy-MM-dd') : '');
      setIsDone(task.is_done || false);
      setStatus(task.status || TaskStatus.BACKLOG);
    }
  }, [task]);

  const handleProgressChange = (value: number[]) => {
    if (is_done) return; // Don't allow progress changes if task is completed
    setProgress(value[0]);
  };

  const handleCompletionChange = (checked: boolean) => {
    setIsDone(checked);
    if (checked) {
      setPreviousProgress(progress);
      setProgress(100);
      setStatus(TaskStatus.COMPLETED);
    } else {
      setProgress(previousProgress);
      // Reset status to previous state or default when unchecking completion
      setStatus(TaskStatus.BACKLOG);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    try {
      // Ensure status is set to COMPLETED if task is done
      const finalStatus = is_done ? TaskStatus.COMPLETED : status;
      
      const updatedTask = await updateTask({
          id: task.id,
        task: {
          title,
          description,
          progress,
          deadline,
          is_done: is_done ? true : false, // Explicitly set to false when not done
          status: finalStatus, // Use the final status
          completed_at: is_done ? new Date().toISOString() : null,
          email: task.email
        }
      }).unwrap();

      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      onTaskUpdated(updatedTask);
        onOpenChange(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            {`Make changes to your task here. Click save when you're done.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: TaskStatus) => setStatus(value)}
                disabled={is_done}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                  <SelectItem value={TaskStatus.PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
              {is_done && (
                <p className="text-xs text-muted-foreground">
                  Status automatically set to &quot;Completed&quot; when task is marked as done
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="progress">Progress</Label>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Slider
                id="progress"
                value={[progress]}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                disabled={is_done}
                className="relative"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_done"
                checked={is_done}
                onCheckedChange={handleCompletionChange}
              />
              <Label htmlFor="is_done">Mark as completed</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 