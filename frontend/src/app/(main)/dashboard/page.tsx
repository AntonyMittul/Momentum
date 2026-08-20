"use client";

import { useEffect, useState } from "react";
import { fetchTasks, calculateMetrics, fetchNonNegotiables, toggleNonNegotiable } from "@/lib/api";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Droplets, Sun, Pizza, Activity, Moon, BookOpen, Target } from "lucide-react";

const getNNIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('water') || lower.includes('drink')) return <Droplets className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
  if (lower.includes('sun') || lower.includes('light')) return <Sun className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
  if (lower.includes('junk') || lower.includes('sugar') || lower.includes('oil') || lower.includes('diet')) return <Pizza className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
  if (lower.includes('physical') || lower.includes('activity') || lower.includes('exercise') || lower.includes('workout') || lower.includes('gym') || lower.includes('run')) return <Activity className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
  if (lower.includes('sleep') || lower.includes('rest') || lower.includes('bed')) return <Moon className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
  if (lower.includes('read') || lower.includes('book')) return <BookOpen className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
  return <ShieldCheck className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />;
};

const motivationalMessages = [
  {
    title: "Eyes on the prize!",
    body: "Don't forget the promises you made to yourself. Tap here to review your active goals and keep your momentum going!"
  },
  {
    title: "Small steps, big results.",
    body: "Every action you take today builds the future you want tomorrow. Check your goals and see what's next!"
  },
  {
    title: "Stay focused.",
    body: "Distractions are everywhere, but so is your potential. Take a quick look at your goals to realign your focus."
  },
  {
    title: "You've got this!",
    body: "Consistency is your superpower. Review your weekly and monthly goals to make sure you're on the right track."
  },
  {
    title: "Build the habit.",
    body: "Motivation gets you started, but habit keeps you going. Check in on your goals and plan your next move."
  },
  {
    title: "One day at a time.",
    body: "Don't overwhelm yourself. Just focus on what you can do today to move closer to your monthly goals!"
  },
  {
    title: "Protect your momentum.",
    body: "You've worked hard to get here. Keep the streak alive by reviewing and tackling your current objectives."
  }
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [nonNegotiables, setNonNegotiables] = useState<any[]>([]);
  const [dailyMessage, setDailyMessage] = useState(motivationalMessages[0]);

  const loadData = async () => {
    try {
      // Create YYYY-MM-DD string in local timezone
      const today = new Date();
      const tzOffset = today.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(today.getTime() - tzOffset)).toISOString().split('T')[0];
      
      const [tData, nnData] = await Promise.all([
        fetchTasks(), // Fetch all (up to 1000) and strictly filter locally
        fetchNonNegotiables(localISOTime)
      ]);
      
      const priorityWeight: Record<string, number> = { "High": 3, "Medium": 2, "Low": 1 };
      const sortedTData = (tData || [])
        .filter((t: any) => {
          if (!t.created_at) return false;
          
          const tDate = new Date(t.created_at + (t.created_at.endsWith('Z') ? '' : 'Z'));
          const tOffset = tDate.getTimezoneOffset() * 60000;
          const tLocalISO = new Date(tDate.getTime() - tOffset).toISOString().split('T')[0];
          return tLocalISO === localISOTime;
        })
        .sort((a: any, b: any) => {
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        return weightB - weightA;
      });
      
      setTasks(sortedTData);
      setNonNegotiables(nnData || []);
      await calculateMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleNN = async (id: number, completed: boolean) => {
    const original = [...nonNegotiables];
    setNonNegotiables(original.map(nn => nn.id === id ? { ...nn, completed_today: completed } : nn));
    
    try {
      await toggleNonNegotiable(id, completed);
      calculateMetrics(); // Background calculation, no await/reload needed
    } catch (e) {
      console.error(e);
      setNonNegotiables(original); // Rollback on error
    }
  };

  const handleTaskUpdate = (updatedTask: any, action: 'update' | 'delete') => {
    if (action === 'delete') {
      setTasks(prev => prev.filter(t => t.id !== updatedTask.id));
    } else {
      setTasks(prev => {
        const newTasks = prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t);
        const priorityWeight: Record<string, number> = { "High": 3, "Medium": 2, "Low": 1 };
        return newTasks.sort((a: any, b: any) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
      });
    }
  };

  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");

  const getFormattedDate = () => {
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    
    let suffix = 'th';
    if (day % 10 === 1 && day !== 11) suffix = 'st';
    if (day % 10 === 2 && day !== 12) suffix = 'nd';
    if (day % 10 === 3 && day !== 13) suffix = 'rd';
    
    return `${month} ${day}${suffix}, ${year}`;
  };

  useEffect(() => {
    loadData();
    setCurrentDate(getFormattedDate());
    
    // Update the date at midnight if the user leaves the tab open
    const interval = setInterval(() => {
      setCurrentDate(getFormattedDate());
      
      // Update daily message based on the new day
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      setDailyMessage(motivationalMessages[dayOfYear % motivationalMessages.length]);
    }, 60000 * 60); // Check every hour
    
    // Set initial message on mount
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    setDailyMessage(motivationalMessages[dayOfYear % motivationalMessages.length]);
    
    // Set dynamic greeting
    const getDynamicGreeting = () => {
      const hour = new Date().getHours();
      let options = [];
      if (hour < 12) {
        options = [
          "Good Morning, Antony.", 
          "Morning, Antony.", 
          "Ready to crush it, Antony?", 
          "Let's get to work, Antony.",
          "A fresh start, Antony."
        ];
      } else if (hour < 18) {
        options = [
          "Good Afternoon, Antony.", 
          "Antony Returns.", 
          "Keep the momentum, Antony.", 
          "Halfway there, Antony.", 
          "Stay focused, Antony."
        ];
      } else {
        options = [
          "Good Evening, Antony.", 
          "Winding down, Antony?", 
          "Great work today, Antony.", 
          "Evening, Antony.", 
          "Time to recharge, Antony."
        ];
      }
      return options[Math.floor(Math.random() * options.length)];
    };
    
    setGreeting(getDynamicGreeting());
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16 pb-24">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground transition-opacity duration-500">
            {greeting || "Welcome back."}
          </h1>
          <p className="text-muted-foreground text-lg font-medium tracking-wide">
            {currentDate}
          </p>
        </div>
        
        <Link href="/goals" className="bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-all group max-w-sm flex items-start gap-4">
          <div className="bg-muted p-2 rounded-lg group-hover:scale-110 transition-transform shrink-0">
            <Target className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{dailyMessage.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {dailyMessage.body}
            </p>
          </div>
        </Link>
      </section>

      {/* Header Section (Kept without changes below, removed mission) */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Non-Negotiables */}
        {nonNegotiables.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Non-Negotiables
          </h2>
          <div className="space-y-3">
            {nonNegotiables.map((nn: any) => (
              <div key={nn.id} className="border border-border p-4 flex gap-4 bg-card items-center transition-colors duration-500">
                <div className="pt-0.5">
                  <Checkbox 
                    checked={nn.completed_today} 
                    onCheckedChange={(c: boolean) => handleToggleNN(nn.id, c)}
                    className="border-border rounded-sm data-[state=checked]:bg-foreground data-[state=checked]:text-background transition-all duration-300"
                  />
                </div>
                <div className="flex-1 flex justify-between items-center min-w-0 pr-4">
                  <div className="flex items-center min-w-0">
                    {getNNIcon(nn.title)}
                    <h3 className={`font-medium truncate ${nn.completed_today ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {nn.title}
                    </h3>
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                    {nn.remaining_days} DAYS LEFT
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Logs */}
      <section className="space-y-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Today's Tasks
        </h2>
        {tasks.length === 0 ? (
          <div className="text-gray-400 italic">No tasks recorded yet. Click the + button to plan your day.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t: any) => (
              <TaskCard key={t.id} task={t} onTaskUpdate={handleTaskUpdate} />
            ))}
          </div>
        )}
        </section>
      </div>
    </div>
  );
}
