import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "system" | "dark" | "light";

interface ThemeContextValue {
  /** The user's stored preference */
  theme: ThemePreference;
  /** The resolved theme after applying system vs explicit choice */
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemePreference) => void;
}

const STORAGE_KEY = "chat-theme-preference";
const DATA_ATTR = "data-theme";

function getSystemPreference(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(preference: ThemePreference): "dark" | "light" {
  return preference === "system" ? getSystemPreference() : preference;
}

export function useThemeContext(): ThemeContextValue {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light" || stored === "system")
        return stored;
    } catch {}
    return "system";
  });

  // Set html data attribute on mount and when preference changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.setAttribute(DATA_ATTR, resolved);
  }, [theme]);

  // Listen for system preference changes only when in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute(DATA_ATTR, getSystemPreference());
    };
    mq.addEventListener("change", handler);
    handler(); // initial run

    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setThemeCb = useCallback((value: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    setThemeState(value);
  }, []);

  return useMemo(
    () => ({ theme, resolvedTheme: resolveTheme(theme), setTheme: setThemeCb }),
    [theme, setThemeCb],
  );
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useCurrentTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useCurrentTheme must be used within ThemeProvider");
  return ctx;
}
