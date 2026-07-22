"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { fetchTasks, fetchNonNegotiables } from "@/lib/api";
import TaskCard from "@/components/TaskCard";
import { Checkbox } from "@/components/ui/checkbox";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Data for the selected date
  const [tasks, setTasks] = useState<any[]>([]);
  const [nonNegotiables, setNonNegotiables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = async (day: number) => {
    const selected = new Date(year, month, day);
    setSelectedDate(selected);
    setLoading(true);
    
    try {
      const tzOffset = selected.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(selected.getTime() - tzOffset)).toISOString().split('T')[0];
      
      const [tData, nnData] = await Promise.all([
        fetchTasks(localISOTime),
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
    } catch (e) {
      console.error("Failed to load historical data", e);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-12 pb-24">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center gap-4">
          <CalendarIcon className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
          Calendar
        </h1>
        <p className="text-muted-foreground text-lg">Review your historical tasks and daily habits.</p>
      </section>

      {/* Calendar UI */}
      <section className="bg-card border border-border p-6 shadow-sm rounded-lg transition-colors duration-500">
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded text-muted-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold tracking-wide">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded text-muted-foreground transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {days.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {/* Empty blocks for days before start of month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 md:p-4" />
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = 
              day === new Date().getDate() && 
              month === new Date().getMonth() && 
              year === new Date().getFullYear();
              
            const isSelected = selectedDate?.getDate() === day && 
                               selectedDate?.getMonth() === month && 
                               selectedDate?.getFullYear() === year;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  p-2 md:p-4 aspect-square flex items-center justify-center rounded-lg text-sm md:text-base font-medium transition-all duration-300
                  ${isSelected ? "bg-foreground text-background scale-105 shadow-md" : "bg-muted/30 hover:bg-muted text-foreground"}
                  ${isToday && !isSelected ? "border-2 border-foreground" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </section>

      {/* Detailed View for Selected Date */}
      {selectedDate && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-border p-6 rounded-lg bg-card shadow-sm transition-colors duration-500">
          <div className="flex justify-between items-end border-b border-border pb-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <button onClick={() => setSelectedDate(null)} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors">
              <X className="w-4 h-4" /> Close
            </button>
          </div>
          
          {loading ? (
            <div className="text-muted-foreground animate-pulse font-medium">Loading historical data...</div>
          ) : (
            <div className="space-y-12">
              {/* Non-Negotiables */}
              {nonNegotiables.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                    Non-Negotiables
                  </h3>
                  <div className="space-y-3">
                    {nonNegotiables.map((nn: any) => (
                      <div key={nn.id} className="border border-border p-4 flex gap-4 bg-card items-center transition-colors opacity-80">
                        <div className="pt-0.5 pointer-events-none">
                          <Checkbox 
                            checked={nn.completed_today} 
                            disabled={true}
                            className="border-border rounded-sm data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                          />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <h3 className={`font-medium ${nn.completed_today ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {nn.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tasks */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  Tasks
                </h3>
                {tasks.length === 0 ? (
                  <div className="text-gray-400 italic font-medium">No tasks were recorded on this day.</div>
                ) : (
                  <div className="space-y-3 pointer-events-none">
                    {tasks.map((t: any) => (
                      <div key={t.id} className="opacity-80 transition-opacity">
                         {/* We pass a no-op onTaskUpdate since it's a historical view */}
                        <TaskCard task={t} onTaskUpdate={() => {}} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
