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
  const [activeTab, setActiveTab] = useState<'tasks' | 'habits'>('tasks');

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
                  py-3 md:py-4 flex items-center justify-center rounded-lg text-sm md:text-base font-medium transition-all duration-300
                  ${isSelected ? "bg-foreground text-background shadow-md" : "bg-muted/30 hover:bg-muted text-foreground"}
                  ${isToday && !isSelected ? "border-2 border-foreground" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </section>

      {/* Detailed View for Selected Date (Modal) */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-2xl font-bold tracking-tight">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button onClick={() => setSelectedDate(null)} className="text-muted-foreground hover:text-foreground transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Toggle Tabs */}
            <div className="flex border-b border-border">
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-colors ${activeTab === 'tasks' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
              >
                Tasks
              </button>
              <button 
                onClick={() => setActiveTab('habits')}
                className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-colors ${activeTab === 'habits' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
              >
                Non-Negotiables
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-muted/10">
              {loading ? (
                <div className="text-muted-foreground animate-pulse font-medium text-center py-10">Loading historical data...</div>
              ) : (
                <div className="space-y-6">
                  {/* Non-Negotiables View */}
                  {activeTab === 'habits' && (
                    <section className="animate-in fade-in duration-300">
                      {nonNegotiables.length === 0 ? (
                        <div className="text-gray-400 italic font-medium text-center py-8">No Non-Negotiables recorded.</div>
                      ) : (
                        <div className="space-y-3">
                          {nonNegotiables.map((nn: any) => (
                            <div key={nn.id} className="border border-border rounded p-4 flex gap-4 bg-card items-center shadow-sm opacity-90 pointer-events-none">
                              <div className="pt-0.5">
                                <Checkbox 
                                  checked={nn.completed_today} 
                                  disabled={true}
                                  className="border-border rounded-sm data-[state=checked]:bg-foreground data-[state=checked]:text-background"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className={`font-medium ${nn.completed_today ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {nn.title}
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Tasks View */}
                  {activeTab === 'tasks' && (
                    <section className="animate-in fade-in duration-300">
                      {tasks.length === 0 ? (
                        <div className="text-gray-400 italic font-medium text-center py-8">No tasks were recorded on this day.</div>
                      ) : (
                        <div className="space-y-3 pointer-events-none opacity-90">
                          {tasks.map((t: any) => (
                            <div key={t.id}>
                              <TaskCard task={t} onTaskUpdate={() => {}} />
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
