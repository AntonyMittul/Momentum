"use client";

import { useEffect, useState } from "react";
import { fetchTasks } from "@/lib/api";
import TaskCard from "@/components/TaskCard";
import CreateTaskModal from "@/components/CreateTaskModal";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const data = await fetchTasks();
      
      const today = new Date();
      const tzOffset = today.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(today.getTime() - tzOffset)).toISOString().split('T')[0];

      // Only show tasks strictly created today in local timezone
      const todaysTasks = (data || []).filter((t: any) => {
        if (!t.created_at) return false;
        const tDate = new Date(t.created_at + (t.created_at.endsWith('Z') ? '' : 'Z'));
        const tOffset = tDate.getTimezoneOffset() * 60000;
        const tLocalISO = new Date(tDate.getTime() - tOffset).toISOString().split('T')[0];
        return tLocalISO === localISOTime;
      });
      
      const priorityWeight: Record<string, number> = { "High": 3, "Medium": 2, "Low": 1 };
      todaysTasks.sort((a: any, b: any) => {
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        return weightB - weightA;
      });
      
      setTasks(todaysTasks);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== "Completed");
  const completedTasks = tasks.filter(t => t.status === "Completed");

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Tasks</h1>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Pending</h2>
        {pendingTasks.length === 0 ? (
          <div className="text-gray-400 italic">No tasks pending.</div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map(t => (
              <TaskCard key={t.id} task={t} onTaskUpdate={loadData} />
            ))}
          </div>
        )}
      </section>

      {completedTasks.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Completed</h2>
          <div className="space-y-3 opacity-70">
            {completedTasks.map(t => (
              <TaskCard key={t.id} task={t} onTaskUpdate={loadData} />
            ))}
          </div>
        </section>
      )}

      <CreateTaskModal onTaskCreated={loadData} />
    </div>
  );
}
