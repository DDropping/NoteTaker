import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        background: 'var(--bg-hover)',
        color: 'var(--text-primary)',
        fontSize: 12,
        border: '1px solid var(--border-color)',
      }}
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
