"use client";

import { useTheme, Theme } from "@/components/ThemeProvider";

export default function AppearancesPage() {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme, name: string, description: string, previewClass: string }[] = [
    {
      id: "theme-white",
      name: "White",
      description: "Clean, minimal, and bright.",
      previewClass: "bg-[#ffffff] border-[#ececec] text-[#111111]"
    },
    {
      id: "theme-black",
      name: "Black",
      description: "Deep, pure black for true dark mode.",
      previewClass: "bg-[#000000] border-[#333333] text-[#ffffff]"
    },
    {
      id: "theme-charcoal",
      name: "Charcoal Grey",
      description: "A soft, easy-on-the-eyes standard charcoal.",
      previewClass: "bg-[#36454F] border-[#555555] text-[#ffffff]"
    }
  ];

  return (
    <div className="space-y-12 pb-24 transition-colors duration-500">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Appearances</h1>
        <p className="text-sm opacity-60 mt-2">Customize the look and feel of your environment.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((t) => (
          <div 
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`border p-6 cursor-pointer transition-all duration-300 bg-card ${
              theme === t.id ? "ring-2 ring-foreground border-transparent" : "border-border hover:border-foreground/50"
            }`}
          >
            <div className={`w-full h-32 mb-4 border ${t.previewClass} flex items-center justify-center font-medium shadow-sm transition-colors duration-500`}>
              Aa
            </div>
            <h3 className="font-semibold text-lg">{t.name}</h3>
            <p className="text-sm opacity-60 mt-1">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
