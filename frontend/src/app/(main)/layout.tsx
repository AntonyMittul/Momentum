import "../globals.css";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, LineChart, Palette, ShieldCheck, CalendarDays, StickyNote, Bot, Target } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col md:flex-row">
      <MobileNav />
          <aside className="w-64 border-r border-border flex flex-col p-6 hidden md:flex">
            <div className="mb-12 font-bold text-xl tracking-tight">Momentum</div>
            <nav className="flex-1 space-y-4 font-medium text-sm">
              <Link href="/dashboard" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/tasks" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <CheckSquare className="w-4 h-4" /> Tasks
              </Link>
              <Link href="/non-negotiables" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <ShieldCheck className="w-4 h-4" /> Non-Negotiables
              </Link>
              <Link href="/insights" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <LineChart className="w-4 h-4" /> Insights
              </Link>
              <Link href="/goals" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <Target className="w-4 h-4" /> Goals
              </Link>
              <Link href="/calendar" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <CalendarDays className="w-4 h-4" /> Calendar
              </Link>
              <Link href="/notes" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <StickyNote className="w-4 h-4" /> Notes
              </Link>
              <Link href="/assistant" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <Bot className="w-4 h-4" /> Assistant
              </Link>
              <Link href="/appearances" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <Palette className="w-4 h-4" /> Appearances
              </Link>
            </nav>
          </aside>
          <main className="flex-1 overflow-auto bg-background transition-colors duration-500 md:pb-0">
            <div className="max-w-6xl mx-auto p-6 md:p-12">
              {children}
            </div>
          </main>
    </div>
  );
}
