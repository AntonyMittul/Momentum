"use client";

import { useEffect, useState } from "react";
import { fetchNonNegotiables, createNonNegotiable, deleteNonNegotiable, toggleNonNegotiable } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function NonNegotiablesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");

  const loadData = async () => {
    try {
      const data = await fetchNonNegotiables();
      setItems(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createNonNegotiable({ title, duration_days: parseInt(duration) || 30 });
      setTitle("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNonNegotiable(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      // Optimistic update
      setItems(items.map(item => item.id === id ? { ...item, completed_today: completed } : item));
      await toggleNonNegotiable(id, completed);
      loadData(); // To be completely sure
    } catch (e) {
      console.error(e);
      loadData(); // Revert
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Non-Negotiables</h1>
        <p className="text-sm text-gray-500 mt-2">Daily habits you must follow without question.</p>
      </header>

      <section>
        <form onSubmit={handleCreate} className="flex gap-4 items-end border border-border p-6 bg-muted">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">Habit</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2 liters of water" 
              className="w-full bg-transparent border-b border-gray-300 py-2 outline-none focus:border-black transition-colors"
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">Days</label>
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              className="w-full bg-transparent border-b border-gray-300 py-2 outline-none focus:border-black transition-colors"
            />
          </div>
          <button type="submit" className="bg-foreground text-background px-4 py-2 hover:opacity-80 transition-colors flex items-center gap-2 h-[41px]">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Your Active List</h2>
        {items.length === 0 ? (
          <div className="text-gray-400 italic">No non-negotiables set. Time to build some discipline.</div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="border border-border p-4 flex gap-4 bg-card items-center transition-colors duration-500">
                <div className="pt-0.5">
                  <Checkbox 
                    checked={item.completed_today} 
                    onCheckedChange={(c: boolean) => handleToggle(item.id, c)}
                    className="border-border rounded-sm data-[state=checked]:bg-foreground data-[state=checked]:text-background transition-all duration-300"
                  />
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <h3 className={`font-medium ${item.completed_today ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                      {item.remaining_days} DAYS LEFT
                    </span>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
