import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

function DeadlockButton({ label, onClick, variant = 'default', icon: Icon, disabled = false }) {
  const variants = {
    default: 'bg-accent/15 text-accent border-accent/40 hover:bg-accent/25',
    success: 'bg-success/15 text-success border-success/40 hover:bg-success/25',
    danger: 'bg-danger/15 text-danger border-danger/40 hover:bg-danger/25',
    warning: 'bg-warning/15 text-warning border-warning/40 hover:bg-warning/25',
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
        disabled
          ? 'bg-surface-800/60 text-surface-500 border-surface-700/50 cursor-not-allowed'
          : variants[variant]
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </motion.button>
  );
}

export default function ManualDeadlockControl({
  hasDeadlock,
  isAnimating,
  onCreateSampleDeadlock,
  onPreventDeadlock,
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-danger" />
            <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
              Manual Deadlock Creator
            </h2>
          </div>
          <p className="text-sm text-surface-400 max-w-2xl">
            Connect customers to resources. If two or more customers use the same resource, the UI marks it as a deadlock.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <DeadlockButton
            label={isAnimating ? 'Animating Deadlock...' : 'Create Sample Deadlock'}
            onClick={onCreateSampleDeadlock}
            variant="warning"
            icon={Sparkles}
            disabled={isAnimating}
          />
          <DeadlockButton
            label={
              isAnimating
                ? 'Animation In Progress'
                : hasDeadlock
                  ? 'Auto Resolve'
                  : 'No Deadlock To Resolve'
            }
            onClick={onPreventDeadlock}
            variant="success"
            icon={ShieldCheck}
            disabled={!hasDeadlock || isAnimating}
          />
        </div>
      </div>
    </GlassCard>
  );
}
