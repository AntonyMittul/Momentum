"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "theme-white" | "theme-black" | "theme-charcoal" | "theme-custom";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper for contrast
function getContrastInfo(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0]+h[0] : h.substring(0,2), 16);
  const g = parseInt(h.length === 3 ? h[1]+h[1] : h.substring(2,4), 16);
  const b = parseInt(h.length === 3 ? h[2]+h[2] : h.substring(4,6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isDark = luminance < 0.5;
  
  return {
    bg: hex,
    fg: isDark ? '#ffffff' : '#111111',
    card: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    border: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    muted: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    mutedFg: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("theme-white");
  const [customColor, setCustomColorState] = useState<string>("#5c6ac4");
  const [mounted, setMounted] = useState(false);

    setMounted(true);
    const savedTheme = localStorage.getItem("app-theme") as Theme;
    const savedColor = localStorage.getItem("app-custom-color");
    
    if (savedColor) {
      setCustomColorState(savedColor);
    }
    
    if (savedTheme) {
      applyTheme(savedTheme, savedColor || customColor);
    } else {
      applyTheme("theme-white", customColor);
    }
  }, []);

  const applyTheme = (newTheme: Theme, color: string) => {
    setThemeState(newTheme);
    localStorage.setItem("app-theme", newTheme);
    
    const root = document.documentElement;
    root.className = newTheme;
    
    if (newTheme === "theme-custom") {
      const vars = getContrastInfo(color);
      root.style.setProperty("--theme-bg", vars.bg);
      root.style.setProperty("--theme-fg", vars.fg);
      root.style.setProperty("--theme-card", vars.card);
      root.style.setProperty("--theme-border", vars.border);
      root.style.setProperty("--theme-muted", vars.muted);
      root.style.setProperty("--theme-muted-fg", vars.mutedFg);
    } else {
      // Remove inline styles to fallback to css classes
      root.style.removeProperty("--theme-bg");
      root.style.removeProperty("--theme-fg");
      root.style.removeProperty("--theme-card");
      root.style.removeProperty("--theme-border");
      root.style.removeProperty("--theme-muted");
      root.style.removeProperty("--theme-muted-fg");
    }
  };

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme, customColor);
  };
  
  const setCustomColor = (color: string) => {
    setCustomColorState(color);
    localStorage.setItem("app-custom-color", color);
    if (theme === "theme-custom") {
      applyTheme("theme-custom", color);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColor, setCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
