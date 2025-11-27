
// src/hooks/useTheme.ts
// Wrapper around next-themes to maintain the same API
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidration mismatch - solo renderizar después del mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Usar resolvedTheme para obtener el tema real (resuelve "system" a "light" o "dark")
  const currentTheme = (resolvedTheme || theme) as "light" | "dark" | undefined;

  const toggleTheme = () => {
    if (currentTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  // Retornar "light" como default hasta que se monte para evitar flash
  return {
    theme: mounted ? (currentTheme || "light") : "light",
    toggleTheme,
  };
}