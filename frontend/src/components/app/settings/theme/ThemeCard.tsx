import { motion } from "framer-motion";
import type React from "react";

type ThemePreference = "system" | "dark" | "light";

interface ThemeCardProps {
  preference: ThemePreference;
  selected: boolean;
  onClick: () => void;
}

const CARD_COLORS: Record<"light" | "dark", string[]> = {
  light: ["#9ea69a", "#7a8078", "#5c645c"],
  dark: ["#e4e1dc", "#7a7570", "#5c5852"],
};

export default function ThemeCard({
  preference,
  selected,
  onClick,
}: ThemeCardProps): React.ReactNode {
  const mode = previewMode(preference);
  const fg = CARD_COLORS[mode];

  return (
    <motion.button
      type="button"
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
      layout
      whileHover={{ scale: selected ? 1 : 1.015 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.84] }}
      style={selectedStyle(selected, preference)}
      onClick={onClick}
    >
      {/* Mini preview strip */}
      <div
        className="h-7 mx-3 mt-3 rounded-lg flex overflow-hidden"
        style={{ background: "#0d0e13" }}
      >
        {/* FIX: Źle ustawia tło - system dark, to preview dark jest biale a light szare. jak wlaczam recznie jasne, to ciemnie i system(dark) jest szare jak w pierwszym przypadku. Coś dziwnie wybiera colory z CARD_COLORS */}
        <div className="flex-1" style={{ background: fg[0] }} />
        <div className="flex-1" style={{ background: fg[1] }} />
      </div>

      {/* Label row */}
      <div className="flex items-center justify-between mx-3 mb-3">
        <p
          className="font-display font-semibold text-lg"
          style={{ color: fg[2] }}
        >
          {cardLabel(preference)}
        </p>
      </div>
    </motion.button>
  );
}

function previewMode(pref: ThemePreference): "light" | "dark" {
  if (pref === "system")
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  return pref;
}

function selectedStyle(
  selected: boolean,
  pref: ThemePreference,
): React.CSSProperties {
  const mode = previewMode(pref);
  const cardBg = CARD_COLORS[mode][0];
  if (!selected) return { background: cardBg };

  return mode === "dark"
    ? { background: "#04150d", boxShadow: `inset 0 0 0 1.2px var(--primary)` }
    : { background: "#f0f6f0", boxShadow: `inset 0 0 0 1.2px var(--primary)` };
}

function cardLabel(pref: ThemePreference): "System" | "Ciemny" | "Jasny" {
  return pref === "system" ? "System" : pref === "dark" ? "Ciemny" : "Jasny";
}
