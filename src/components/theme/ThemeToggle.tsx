/**
 * Theme Toggle Component
 * Allows users to switch between light and dark themes
 */

'use client';

import { useTheme } from '@/lib/theme-provider';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-school-50 hover:bg-school-100 text-school-600 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
