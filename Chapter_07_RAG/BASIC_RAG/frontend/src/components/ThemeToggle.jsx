import { AnimatePresence, motion } from "framer-motion";
import { MonitorIcon, MoonIcon, SunIcon } from "./Icons";

const ICONS = { system: MonitorIcon, light: SunIcon, dark: MoonIcon };
const LABELS = { system: "System theme", light: "Light theme", dark: "Dark theme" };

export default function ThemeToggle({ theme, onCycle }) {
  const Icon = ICONS[theme];

  return (
    <button
      className="icon-btn"
      onClick={onCycle}
      type="button"
      aria-label={`${LABELS[theme]} — click to switch`}
      title={`${LABELS[theme]} — click to switch`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex" }}
        >
          <Icon width={17} height={17} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
