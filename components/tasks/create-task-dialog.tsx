"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { createTask } from '../../lib/api';

interface CreateTaskDialogProps {
  onTaskCreated: () => void;
}

export default function CreateTaskDialog({ onTaskCreated }: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Format the deadline to ISO string
      const deadlineDate = new Date(formData.deadline);
      const taskData = {
        title: formData.title,
        description: formData.description,
        deadline: deadlineDate.toISOString(),
        progress: 0,
        is_done: false,
        email: 'mohit2010sm@gmail.com',
        completed_at: null
      };

      await createTask(taskData);

      // Reset form and close dialog
      setFormData({ title: '', description: '', deadline: '' });
      setIsOpen(false);
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Create Task</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium mb-1">
                Deadline
              </label>
              <Input
                id="deadline"
                name="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 