import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', glow = '', animate = true }) {
  const glowClass = glow === 'success'
    ? 'shadow-glow-success'
    : glow === 'danger'
    ? 'shadow-glow-danger'
    : glow === 'accent'
    ? 'shadow-glow'
    : '';

  const Component = animate ? motion.div : 'div';
  const motionProps = animate ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  } : {};

  return (
    <Component
      className={`
        relative rounded-2xl
        bg-surface-800/50 backdrop-blur-glass
        border border-surface-600/30
        shadow-glass
        ${glowClass}
        ${className}
      `}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
