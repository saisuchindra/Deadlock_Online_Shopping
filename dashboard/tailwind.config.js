/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#f0f1f5',
          100: '#d1d5e0',
          200: '#a3aabe',
          300: '#6b7394',
          400: '#4a5278',
          500: '#2d3352',
          600: '#1e2340',
          700: '#161a32',
          800: '#0f1225',
          900: '#0a0d1a',
          950: '#060812',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.3)',
        },
        success: { DEFAULT: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
        danger: { DEFAULT: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
        warning: { DEFAULT: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
        info: { DEFAULT: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.2)',
        glow: '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.15)',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};
