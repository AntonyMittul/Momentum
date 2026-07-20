"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { updateTask } from "@/lib/api";

const CATEGORIES = ["AI & Machine Learning", "Projects", "Career", "Fitness", "Reading", "Chess", "Personal", "Other"];

export default function EditTaskModal({ task, onTaskUpdated }: { task: any, onTaskUpdated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [category, setCategory] = useState(task.category || "Other");
  const [priority, setPriority] = useState(task.priority || "Medium");
  const [duration, setDuration] = useState(task.estimated_duration ? task.estimated_duration.toString() : "");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await updateTask(task.id, {
        title,
        description: description || null,
        category,
        priority,
        estimated_duration: duration ? parseInt(duration) : null,
      });
      
      setOpen(false);
      if (onTaskUpdated) onTaskUpdated();
    } catch (error: any) {
      console.error("Failed to update task:", error);
      alert("Failed to update task. Please try again. Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none" aria-label="Edit Task">
        <PenLine className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-none shadow-none">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl tracking-tight">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</Label>
            <Input 
              id="edit-title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="border-b border-border border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground shadow-none" 
              placeholder="What needs to be done?" 
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-desc" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description (Optional)</Label>
            <Input 
              id="edit-desc" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="border-b border-border border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground shadow-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</Label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-foreground"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration (Mins)</Label>
              <Input 
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="border-b border-border border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground shadow-none" 
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</Label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 text-sm focus:outline-none focus:border-foreground"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-none hover:bg-muted mr-2 text-muted-foreground" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-none bg-foreground text-background hover:opacity-80 px-8" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
