"use client";

import { useEffect, useState } from "react";
import { fetchTasks, calculateMetrics, fetchNonNegotiables, toggleNonNegotiable } from "@/lib/api";
import TaskCard from "@/components/TaskCard";
import CreateTaskModal from "@/components/CreateTaskModal";
import { Checkbox } from "@/components/ui/checkbox";

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

  useEffect(() => {
    loadData();
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
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          {getGreeting()}
        </h1>
      </section>

      {/* Header Section (Kept without changes below, removed mission) */}

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
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <h3 className={`font-medium ${nn.completed_today ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
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
  );
}
