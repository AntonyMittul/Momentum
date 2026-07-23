"use client";

import { useEffect, useState } from "react";
import { getMetrics, calculateMetrics } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, parseISO } from "date-fns";

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const isSunday = new Date().getDay() === 0;

  const handleDownloadReport = () => {
    window.open("http://localhost:8000/api/reports/weekly", "_blank");
  };

  useEffect(() => {
    async function load() {
      await calculateMetrics(); // Ensure metrics are fully up to date for today before fetching
      const data = await getMetrics();
      if (data) {
        // Reverse so chronological order for graph
        setMetrics(data.reverse());
      }
    }
    load();
  }, []);

  const currentStreak = metrics.length > 0 ? metrics[metrics.length - 1].streak : 0;
  const longestStreak = metrics.length > 0 ? Math.max(...metrics.map(m => m.longest_streak)) : 0;

  // Generate last 30 days for contribution calendar
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }).map((_, i) => {
    const d = subDays(today, 29 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const metric = metrics.find(m => m.date === dateStr);
    return {
      date: dateStr,
      metric,
      // Color logic: White=No activity, Light Gray=Partial, Black=Completed all
      status: !metric || metric.tasks_completed === 0 ? "none" 
        : metric.completion_percentage >= 100 ? "full" 
        : "partial"
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 text-sm transition-colors duration-500">
          <p className="font-bold mb-1">{data.date}</p>
          <p>Consistency: <span className="font-semibold">{data.consistency_score}</span></p>
          <p>Completed: {data.tasks_completed}</p>
          <p>Created: {data.tasks_created}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-16 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Insights</h1>
          <p className="text-sm text-gray-500 mt-2">Track your momentum and get your weekly AI review.</p>
        </div>
        <div>
          <button 
            onClick={handleDownloadReport}
            disabled={!isSunday}
            className={`px-4 py-2 flex items-center gap-2 text-sm font-medium ${isSunday ? 'bg-foreground text-background hover:opacity-80' : 'bg-muted text-muted-foreground border border-border cursor-not-allowed'} transition-colors duration-500`}
            title={!isSunday ? "Available on Sundays" : "Download Weekly AI Report"}
          >
            Download Weekly Report
          </button>
        </div>
      </header>

      {/* Section 1: Daily Consistency Graph */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">
          Daily Consistency Graph
        </h2>
        <div className="h-64 w-full">
          {metrics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => format(parseISO(val), "MMM d")}
                  tick={{ fontSize: 12, fill: '#888' }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888' }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)' }} />
                <Line 
                  type="monotone" 
                  dataKey="consistency_score" 
                  stroke="currentColor" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: "currentColor" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 italic">
              Not enough data yet.
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Streak & Contribution */}
      <section>
        <div className="flex gap-12 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Current Streak</div>
            <div className="text-3xl font-bold">{currentStreak} <span className="text-sm font-normal text-gray-400">days</span></div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Longest Streak</div>
            <div className="text-3xl font-bold">{longestStreak} <span className="text-sm font-normal text-gray-400">days</span></div>
          </div>
        </div>

        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Contribution Calendar (Last 30 Days)
        </h2>
        <div className="flex gap-1 flex-wrap max-w-lg">
          {calendarDays.map((day, i) => (
            <div 
              key={i} 
              title={`${day.date} - ${day.metric ? `Score: ${day.metric.consistency_score}` : 'No activity'}`}
              className={`w-4 h-4 border border-border ${
                day.status === "full" ? "bg-foreground" :
                day.status === "partial" ? "bg-muted" :
                "bg-card"
              } transition-all hover:ring-2 hover:ring-muted-foreground`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 border border-border bg-card transition-colors duration-500" /> No activity</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 border border-border bg-muted transition-colors duration-500" /> Partial</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 border border-border bg-foreground transition-colors duration-500" /> Completed</div>
        </div>
      </section>
    </div>
  );
}
