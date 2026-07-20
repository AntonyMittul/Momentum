"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { createTask } from "@/lib/api";

const CATEGORIES = ["AI & Machine Learning", "Projects", "Career", "Fitness", "Reading", "Chess", "Personal", "Other"];

export default function CreateTaskModal({ onTaskCreated }: { onTaskCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [priority, setPriority] = useState("Medium");
  const [duration, setDuration] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createTask({
        title,
        description: description || null,
        category,
        priority,
        estimated_duration: duration ? parseInt(duration) : null,
      });
      
      setTitle("");
      setDescription("");
      setCategory("Other");
      setPriority("Medium");
      setDuration("");
      setOpen(false);
      if (onTaskCreated) onTaskCreated();
    } catch (error: any) {
      console.error("Failed to save task:", error);
      alert("Failed to save task. Please try again. Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="fixed bottom-12 right-12 w-14 h-14 bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-colors shadow-none outline-none border border-transparent">
        <Plus className="w-6 h-6" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-none shadow-none">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl tracking-tight">New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="border-b border-border border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground shadow-none" 
              placeholder="What needs to be done?" 
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description (Optional)</Label>
            <Input 
              id="desc" 
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
