"use client";

import { useEffect, useState } from "react";
import { StickyNote, Plus, X, Trash2, Edit2 } from "lucide-react";
import { fetchNotes, createNote, deleteNote, updateNote } from "@/lib/api";

const pastels = [
  "bg-yellow-200 text-yellow-950", 
  "bg-blue-200 text-blue-950", 
  "bg-pink-200 text-pink-950", 
  "bg-emerald-200 text-emerald-950", 
  "bg-purple-200 text-purple-950", 
  "bg-orange-200 text-orange-950"
];

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      setNotes(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      if (editingNote) {
        await updateNote(editingNote.id, { title: title.trim() || null, content: content.trim() });
      } else {
        const randomColor = pastels[Math.floor(Math.random() * pastels.length)];
        await createNote({ title: title.trim() || null, content: content.trim(), color: randomColor });
      }
      
      setTitle("");
      setContent("");
      setEditingNote(null);
      setIsModalOpen(false);
      loadNotes();
    } catch (e: any) {
      console.error(e);
      alert("Failed to save note. Make sure your Render backend has finished deploying!");
    }
  };

  const handleEditClick = (note: any) => {
    setEditingNote(note);
    setTitle(note.title || "");
    setContent(note.content || "");
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(id);
      loadNotes();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12 pb-24 relative min-h-[80vh]">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center gap-4">
          <StickyNote className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
          Notes
        </h1>
        <p className="text-muted-foreground text-lg">Your quick thoughts and flashcards.</p>
      </section>

      {/* Masonry-style Grid */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <StickyNote className="w-12 h-12 mb-4 opacity-50" />
          <p>No notes yet. Click the + button to create one!</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div 
              key={note.id} 
              className={`relative group p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${note.color}`}
            >
              {/* Folded corner effect */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-black/10 rounded-bl-xl transition-all duration-300 group-hover:w-10 group-hover:h-10" />
              
              <div className="flex justify-between items-start mb-3">
                {note.title ? (
                  <h3 className="font-bold text-lg leading-tight pr-6">{note.title}</h3>
                ) : (
                  <div className="h-6" /> // spacer if no title
                )}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClick(note)}
                    className="p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed font-medium opacity-90 text-sm md:text-base">
                {note.content}
              </p>
              <div className="mt-6 pt-4 border-t border-black/10 text-xs font-semibold opacity-60 tracking-wider">
                {new Date(note.created_at + (note.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={handleOpenCreate}
        className="fixed bottom-24 md:bottom-8 right-6 md:right-12 w-16 h-16 bg-foreground text-background rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold">{editingNote ? "Edit Note" : "New Sticky Note"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded p-3 focus:outline-none focus:ring-2 focus:ring-foreground/50 transition-shadow"
                  placeholder="Note title..."
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Content</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-background border border-border rounded p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-foreground/50 transition-shadow resize-y"
                  placeholder="Jot something down..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded font-medium hover:bg-muted text-muted-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="px-6 py-2 rounded font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
