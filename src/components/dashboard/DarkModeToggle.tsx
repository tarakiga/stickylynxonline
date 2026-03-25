"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    setMounted(true);
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("theme") : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    setTheme(initial);
    const root = document.documentElement;
    if (initial === "dark") root.classList.add("dark"); else root.classList.remove("dark");
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-background border border-divider shadow-sm" />;
  }

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    if (next === "dark") root.classList.add("dark"); else root.classList.remove("dark");
    window.localStorage.setItem("theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-10 h-10 rounded-xl border border-divider bg-background text-text-secondary hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center cursor-pointer shadow-sm"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
