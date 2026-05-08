"use client";

import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ size = 36 }: { size?: number }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative flex items-center justify-center text-warrior-text hover:text-mdcat-yellow hover:bg-warrior-gray/50 rounded-lg transition-all duration-200"
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1 }}
            exit={{    opacity: 0, rotate: 90,  scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon size={17} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90,  scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1 }}
            exit={{    opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun size={17} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
