"use client";

import { useState, useEffect } from "react";
import { Task } from "../../lib/types";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { Slider } from "../ui/slider";
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
  const [loading, setLoading] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(0);

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
    } else {
      setProgress(previousProgress);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setLoading(true);
    try {
      const response = await fetch('/api/proxy/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: task.id,
          title,
          description,
          progress,
          deadline,
          is_done: is_done ? true : false, // Explicitly set to false when not done
          completed_at: is_done ? new Date().toISOString() : null,
          email: task.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Task updated successfully');
        onTaskUpdated(data);
        onOpenChange(false);
      } else {
        toast.error(data.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 