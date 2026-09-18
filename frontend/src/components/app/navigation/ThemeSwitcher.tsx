import { motion } from "framer-motion";
import { THEME_ICONS } from "@/components/app/settings/icons";
import type { ThemePreference } from "@/hooks/useThemeContext";

type ThemeSwitcherProps = {
  current: ThemePreference;
  onChoose: (pref: ThemePreference) => void;
};

const BUTTON_SIZE = "w-9 h-9";

export default function ThemeSwitcher({
  current,
  onChoose,
}: ThemeSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5">
      {(["system", "dark", "light"] as ThemePreference[]).map((pref) => (
        <motion.button
          key={pref}
          type="button"
          className={`${BUTTON_SIZE} flex items-center justify-center rounded-full transition-colors`}
          style={current === pref ? { background: "var(--hover)" } : undefined}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChoose(pref)}
          aria-label={`Motyw: ${pref}`}
        >
          <span
            className="text-foreground-secondary"
            style={current === pref ? { color: "var(--primary)" } : undefined}
          >
            {THEME_ICONS[pref]}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
