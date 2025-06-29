"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useCreateTaskMutation } from '../../lib/api/apiSlice';
import { useToken } from '../../lib/token-context';
import { useToast } from '../ui/use-toast';
import { CreateTaskInput } from '../../lib/types';

interface CreateTaskDialogProps {
  onTaskCreated?: () => void;
}

export default function CreateTaskDialog({ onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });
  const { toast } = useToast();

  // Get token data from token context
  const { decodedToken } = useToken();

  // RTK Query mutation
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const taskData: CreateTaskInput = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        progress: 0,
        is_done: false,
        email: decodedToken?.email || '',
        completed_at: null
      };

      await createTask(taskData).unwrap();

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form and close dialog
      setFormData({ title: '', description: '', deadline: '' });
      setOpen(false);
      onTaskCreated?.();
      
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Task</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                  type="date"
                value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                required
              />
              </div>
            </div>
            <DialogFooter>
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 