import type { ReactNode } from "react";
import { ThemeContext, useThemeContext } from "@/hooks/useThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const context = useThemeContext();

  return (
    <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>
  );
}
