"use client";

import { motion } from "framer-motion";
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { updateTask, deleteTask } from "@/lib/api";
import { Trash2, Brain, Folder, Briefcase, Dumbbell, BookOpen, Crown, User, List } from "lucide-react";
import EditTaskModal from "./EditTaskModal";

export default function TaskCard({ task, onTaskUpdate }: { task: any, onTaskUpdate?: (updatedTask: any, action: 'update' | 'delete') => void }) {
  const [completed, setCompleted] = useState(task.status === "Completed");
  const [isFading, setIsFading] = useState(false);

  const handleCheck = async (checked: boolean) => {
    setCompleted(checked);
    if (checked) setIsFading(true);
    // Optimistic Update Callback
    if (onTaskUpdate) {
      onTaskUpdate({ ...task, status: checked ? "Completed" : "Pending" }, 'update');
    }

    // API Call
    try {
      await updateTask(task.id, { status: checked ? "Completed" : "Pending" });
    } catch (e) {
      console.error(e);
      setCompleted(!checked);
      setIsFading(false);
      if (onTaskUpdate) {
        onTaskUpdate({ ...task, status: !checked ? "Completed" : "Pending" }, 'update');
      }
    }
  };

  const handleDelete = async () => {
    setIsFading(true);
    
    // Optimistic Delete
    if (onTaskUpdate) {
      onTaskUpdate(task, 'delete');
    }

    try {
      await deleteTask(task.id);
    } catch (e) {
      console.error(e);
      setIsFading(false);
      // We can't easily undo a delete in parent without keeping state, so we just log error or force reload
      window.location.reload();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & Machine Learning": return <Brain className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
      case "Projects": return <Folder className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
      case "Career": return <Briefcase className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
      case "Fitness": return <Dumbbell className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
      case "Reading": return <BookOpen className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
      case "Chess": return <Crown className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
      case "Personal": return <User className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
      case "Other":
      default: return <List className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isFading ? 0.4 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border border-border p-4 flex gap-4 bg-card transition-colors duration-500 ${completed ? 'grayscale opacity-60' : ''}`}
    >
      <div className="pt-1">
        <Checkbox 
          checked={completed} 
          onCheckedChange={handleCheck}
          className="border-border rounded-sm data-[state=checked]:bg-foreground data-[state=checked]:text-background transition-all duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center flex-1 min-w-0 pr-4">
            {getCategoryIcon(task.category)}
            <h3 className={`font-medium truncate ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
            {task.estimated_duration ? `${task.estimated_duration} MINS` : ''}
          </span>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          {task.priority === 'High' && !completed && (
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="High Priority" />
          )}
          <span className="text-[10px] sm:text-xs border border-border px-2 py-1 text-muted-foreground whitespace-nowrap">
            {task.category}
          </span>
          {task.priority && (
            <span className="text-[10px] sm:text-xs border border-border px-2 py-1 text-muted-foreground whitespace-nowrap">
              {task.priority}
            </span>
          )}
          {task.deadline && (
            <span className="text-[10px] sm:text-xs border border-border px-2 py-1 text-muted-foreground whitespace-nowrap">
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
          
          <div className="ml-auto flex items-center gap-4 shrink-0">
            <EditTaskModal task={task} onTaskUpdated={onTaskUpdate} />
            <button 
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
              aria-label="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
