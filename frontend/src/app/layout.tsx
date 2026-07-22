import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, LineChart, Palette, ShieldCheck, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Momentum",
  description: "A distraction-free AI productivity companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground font-sans transition-colors duration-500">
        <ThemeProvider>
          <aside className="w-64 border-r border-border flex flex-col p-6 hidden md:flex">
            <div className="mb-12 font-bold text-xl tracking-tight">Momentum</div>
            <nav className="flex-1 space-y-4 font-medium text-sm">
              <Link href="/" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
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
              <Link href="/calendar" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <CalendarDays className="w-4 h-4" /> Calendar
              </Link>
              <Link href="/appearances" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <Palette className="w-4 h-4" /> Appearances
              </Link>
            </nav>
          </aside>
          <main className="flex-1 overflow-auto bg-background transition-colors duration-500 pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto p-6 md:p-12">
              {children}
            </div>
          </main>
          
          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 w-full border-t border-border bg-background z-50 flex justify-around items-center p-3 pb-safe transition-colors duration-500">
            <Link href="/" className="flex flex-col items-center gap-1 p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <Link href="/tasks" className="flex flex-col items-center gap-1 p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
              <CheckSquare className="w-5 h-5" />
            </Link>
            <Link href="/non-negotiables" className="flex flex-col items-center gap-1 p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </Link>
            <Link href="/insights" className="flex flex-col items-center gap-1 p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
              <LineChart className="w-5 h-5" />
            </Link>
            <Link href="/calendar" className="flex flex-col items-center gap-1 p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
              <CalendarDays className="w-5 h-5" />
            </Link>
            <Link href="/appearances" className="flex flex-col items-center gap-1 p-2 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
              <Palette className="w-5 h-5" />
            </Link>
          </nav>
        </ThemeProvider>
      </body>
    </html>
  );
}
