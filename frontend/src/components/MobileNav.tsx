"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, LineChart, Palette, ShieldCheck, CalendarDays, StickyNote, Bot, Target, Menu, X } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/non-negotiables", label: "Non-Negotiables", icon: ShieldCheck },
    { href: "/insights", label: "Insights", icon: LineChart },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/notes", label: "Notes", icon: StickyNote },
    { href: "/assistant", label: "Assistant", icon: Bot },
    { href: "/appearances", label: "Appearances", icon: Palette },
  ];

  return (
    <>
      {/* Mobile Top Bar (Header) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="font-bold text-xl tracking-tight">Momentum</div>
        <button onClick={toggleMenu} className="p-2 rounded-md hover:bg-muted transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Sliding Sidebar Drawer */}
      <div 
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-background border-l border-border shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col p-6 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-12">
          <div className="font-bold text-xl tracking-tight">Menu</div>
          <button onClick={closeMenu} className="p-2 rounded-md hover:bg-muted transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 font-medium text-sm overflow-y-auto">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={closeMenu}
              className="flex items-center gap-3 p-3 hover:bg-muted rounded transition-colors opacity-80 hover:opacity-100"
            >
              <link.icon className="w-5 h-5" /> {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
