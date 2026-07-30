"use client";

import { useState, useEffect } from "react";
import { Target, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchGoals, createGoal, updateGoal, deleteGoal } from "@/lib/api";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [weeklyTitle, setWeeklyTitle] = useState("");
  const [monthlyTitle, setMonthlyTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await fetchGoals();
      if (Array.isArray(data)) {
        setGoals(data);
      } else {
        setGoals([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent, type: "weekly" | "monthly") => {
    e.preventDefault();
    const title = type === "weekly" ? weeklyTitle : monthlyTitle;
    if (!title.trim()) return;

    try {
      await createGoal({ title: title.trim(), type });
      if (type === "weekly") setWeeklyTitle("");
      else setMonthlyTitle("");
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await deleteGoal(id);
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (goal: any) => {
    // Current flow: Pending -> Ongoing -> Completed -> Pending
    let newStatus = "Ongoing";
    if (goal.status === "Pending") newStatus = "Ongoing";
    else if (goal.status === "Ongoing") newStatus = "Completed";
    else newStatus = "Pending";

    try {
      await updateGoal(goal.id, { status: newStatus });
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const startEditing = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditingTitle(goal.title);
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setEditingTitle("");
  };

  const handleEditSave = async (id: number) => {
    if (!editingTitle.trim()) return;
    try {
      await updateGoal(id, { title: editingTitle.trim() });
      setEditingGoalId(null);
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const weeklyGoals = goals.filter((g) => g.type === "weekly");
  const monthlyGoals = goals.filter((g) => g.type === "monthly");

  const renderGoalList = (list: any[]) => {
    if (list.length === 0 && !loading) {
      return (
        <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <p>No goals set yet.</p>
        </div>
      );
    }

    // Sort: Pending -> Ongoing -> Completed
    const sortedList = [...list].sort((a, b) => {
      const order: any = { Pending: 0, Ongoing: 1, Completed: 2 };
      return (order[a.status] || 0) - (order[b.status] || 0);
    });

    return (
      <div className="space-y-3">
        {sortedList.map((g) => (
          <div 
            key={g.id} 
            className={`border border-border p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${g.status === "Completed" ? 'bg-muted/50 opacity-60' : 'bg-card hover:shadow-md'}`}
          >
            {editingGoalId === g.id ? (
              <div className="flex items-center gap-2 w-full">
                <input 
                  type="text" 
                  value={editingTitle} 
                  onChange={(e) => setEditingTitle(e.target.value)} 
                  className="flex-1 bg-background border border-border rounded p-2 focus:outline-none focus:ring-2 focus:ring-foreground/50" 
                  autoFocus 
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSave(g.id)}
                />
                <button onClick={() => handleEditSave(g.id)} className="p-2 text-green-600 hover:bg-green-600/10 rounded transition-colors">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={cancelEditing} className="p-2 text-muted-foreground hover:bg-muted rounded transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <button 
                    onClick={() => handleToggleStatus(g)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                      g.status === "Completed" ? "bg-foreground text-background" : 
                      g.status === "Ongoing" ? "border-2 border-blue-500 bg-blue-500/20" : 
                      "border-2 border-border hover:border-foreground/50"
                    }`}
                  >
                    {g.status === "Completed" && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                    {g.status === "Ongoing" && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm animate-pulse" />
                    )}
                  </button>
                  
                  <div className="flex flex-col min-w-0">
                    <span className={`font-medium truncate ${g.status === "Completed" ? 'line-through text-muted-foreground' : ''}`}>
                      {g.title}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${g.status === "Completed" ? "bg-muted-foreground" : g.status === "Ongoing" ? "bg-blue-500" : "bg-yellow-500"}`} />
                      {g.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => startEditing(g)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(g.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-24">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center gap-4">
          <Target className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
          Goals
        </h1>
        <p className="text-muted-foreground text-lg">Define and track your weekly and monthly objectives.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Weekly Goals */}
        <section className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-2xl font-bold tracking-tight">Weekly Goals</h2>
            <p className="text-sm text-muted-foreground mt-1">Short-term targets for the week</p>
          </div>

          <form onSubmit={(e) => handleCreate(e, "weekly")} className="flex gap-2 relative">
            <input
              type="text"
              value={weeklyTitle}
              onChange={(e) => setWeeklyTitle(e.target.value)}
              placeholder="Add a weekly goal..."
              className="flex-1 bg-background border border-border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-foreground/50 transition-shadow"
            />
            <button 
              type="submit" 
              disabled={!weeklyTitle.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-foreground text-background rounded disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {renderGoalList(weeklyGoals)}
        </section>

        {/* Monthly Goals */}
        <section className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-2xl font-bold tracking-tight">Monthly Goals</h2>
            <p className="text-sm text-muted-foreground mt-1">Broader objectives for the month</p>
          </div>

          <form onSubmit={(e) => handleCreate(e, "monthly")} className="flex gap-2 relative">
            <input
              type="text"
              value={monthlyTitle}
              onChange={(e) => setMonthlyTitle(e.target.value)}
              placeholder="Add a monthly goal..."
              className="flex-1 bg-background border border-border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-foreground/50 transition-shadow"
            />
            <button 
              type="submit"
              disabled={!monthlyTitle.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-foreground text-background rounded disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {renderGoalList(monthlyGoals)}
        </section>

      </div>
    </div>
  );
}
