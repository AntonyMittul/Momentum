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

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [nonNegotiables, setNonNegotiables] = useState<any[]>([]);

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
    try {
      setNonNegotiables(nonNegotiables.map(nn => nn.id === id ? { ...nn, completed_today: completed } : nn));
      await toggleNonNegotiable(id, completed);
      loadData();
    } catch (e) {
      console.error(e);
      loadData();
    }
  };

  const [currentDate, setCurrentDate] = useState("");

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
    }, 60000 * 60); // Check every hour
    
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning.";
    if (hour < 18) return "Good Afternoon.";
    return "Good Evening.";
  };

  return (
    <div className="space-y-16 pb-24">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {getGreeting()}
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
            <h3 className="font-semibold text-sm">Eyes on the prize!</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Don't forget the promises you made to yourself. Tap here to review your active goals and keep your momentum going!
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
              <TaskCard key={t.id} task={t} onTaskUpdate={loadData} />
            ))}
          </div>
        )}
        </section>
      </div>
    </div>
  );
}
