'use client';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
        aria-label="Toggle theme"
      >
        <span className="sr-only">Toggle theme</span>
        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          theme === "dark" ? "translate-x-6" : "translate-x-1"
        }`}
      />
      <Sun
        className={`absolute left-1 h-3 w-3 text-yellow-500 transition-opacity ${
          theme === "dark" ? "opacity-0" : "opacity-100"
        }`}
      />
      <Moon
        className={`absolute right-1 h-3 w-3 text-gray-700 transition-opacity dark:text-gray-300 ${
          theme === "dark" ? "opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
} 