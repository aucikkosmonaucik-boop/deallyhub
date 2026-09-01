"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export default function ThemeToggle({ compact = false, className = "" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const isDark = resolvedTheme === "dark";
  const tooltipText = isDark
    ? t("theme.switchToLight", "Switch to light mode")
    : t("theme.switchToDark", "Switch to dark mode");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center justify-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all duration-200 cursor-pointer select-none active:scale-95 ${
        isDark
          ? "bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 shadow-sm"
          : "bg-gray-50 hover:bg-gray-100 text-slate-700 border-gray-200 shadow-2xs"
      } ${className}`}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 animate-in spin-in-90 duration-200" />
        ) : (
          <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 animate-in -spin-in-90 duration-200" />
        )}
      </div>
      {!compact && (
        <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {isDark ? t("theme.dark", "Dark") : t("theme.light", "Light")}
        </span>
      )}
    </button>
  );
}
