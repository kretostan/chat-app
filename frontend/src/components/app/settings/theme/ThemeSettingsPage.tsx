import type React from "react";
import type { ThemePreference } from "@/hooks/useThemeContext";
import { useCurrentTheme } from "@/hooks/useThemeContext";
import ThemeCard from "./ThemeCard";

interface ThemeSettingsProps {
  current: ThemePreference;
  onChoose: (pref: ThemePreference) => void;
}

export default function ThemeSettingsPage({
  current,
  onChoose,
}: ThemeSettingsProps): React.ReactNode {
  const { resolvedTheme } = useCurrentTheme();

  const options: { pref: ThemePreference; label: string; desc: string }[] = [
    { pref: "dark", label: "Ciemny", desc: "Stały ciemny motyw" },
    { pref: "light", label: "Jasny", desc: "Stały jasny motyw" },
    { pref: "system", label: "System", desc: "Dopasuj do ustawień systemu" },
  ];

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--foreground-primary)" }}
          >
            Motyw
          </h2>
          <p className="text-sm mt-0.5 text-foreground-muted">
            Wybierz motyw dla aplikacji
          </p>
        </div>

        {/* Theme cards */}
        <div className="flex justify-between items-center gap-8">
          {options.map((opt) => (
            <ThemeCard
              key={opt.pref}
              preference={opt.pref}
              selected={current === opt.pref}
              onClick={() => onChoose(opt.pref)}
            />
          ))}
        </div>

        {/* Resolved indicator */}
        <div
          className="mt-8 flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: "var(--surface-section)" }}
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.7}
            style={{ color: "var(--foreground-secondary)" }}
          >
            <path
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-xs text-foreground-muted leading-relaxed">
            {current === "system"
              ? `Obecnie: ${resolvedTheme.charAt(0).toUpperCase() + resolvedTheme.slice(1)} (zgodnie z systemem)`
              : `Aktualny motyw: ${resolvedTheme.charAt(0).toUpperCase() + resolvedTheme.slice(1)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
