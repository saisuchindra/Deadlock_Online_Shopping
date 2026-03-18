/** @type {import('tailwindcss').Config} */
module.exports = {
  // Define which template files to scan for Tailwind class names
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  
  // Enable dark mode using class strategy (dark mode is activated by adding 'dark' class)
  darkMode: 'class',
  
  theme: {
    extend: {
      // Custom color palette for the application
      colors: {
        // Surface colors: gradient from light to dark for UI backgrounds
        surface: {
          50: '#f0f1f5',
          100: '#d1d5e0',
          200: '#a3aabe',
          300: '#6b7394',
          400: '#4a5278',
          500: '#ffffff',     // Primary white background
          600: '#1e2340',
          700: '#161a32',
          800: '#0f1225',
          900: '#0a0d1a',
          950: '#060812',     // Darkest surface
        },
        // Accent color with variants and glow effect
        accent: {
          DEFAULT: '#6366f1',                      // Primary indigo
          light: '#818cf8',                        // Lighter variant
          dark: '#4f46e5',                         // Darker variant
          glow: 'rgba(99, 102, 241, 0.3)',        // Semi-transparent glow effect
        },
        // Status colors for various states
        success: { DEFAULT: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
        danger: { DEFAULT: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
        warning: { DEFAULT: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
        info: { DEFAULT: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
      },
      
      // Custom font families used throughout the application
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],        // Main body font
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],                 // Code/monospace font
      },
      
      // Custom shadow effects for glass-morphism and glow effects
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',             // Large frosted glass effect
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.2)',       // Small frosted glass effect
        glow: '0 0 20px rgba(99, 102, 241, 0.15)',         // Accent glow
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.15)',    // Success glow
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.15)',      // Danger glow
      },
      
      // Backdrop blur effect for glass-morphism UI
      backdropBlur: {
        glass: '16px',  // 16px blur radius for translucent elements
      },
      
      // Custom animation definitions
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',    // Slow pulsing effect
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',       // Glowing pulse effect
      },
      
      // Custom keyframe definitions for animations
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2)' },      // Starting subtle glow
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },   // Enhanced glow at peak
        },
      },
    },
  },
  
  // List of additional plugins (currently empty)
  plugins: [],
};
