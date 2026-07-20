import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, LineChart, Palette, ShieldCheck } from "lucide-react";
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
      <body className="min-h-full flex bg-background text-foreground font-sans transition-colors duration-500">
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
              <Link href="/appearances" className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100">
                <Palette className="w-4 h-4" /> Appearances
              </Link>
            </nav>
          </aside>
          <main className="flex-1 overflow-auto bg-background transition-colors duration-500">
            <div className="max-w-4xl mx-auto p-8 md:p-12">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
