import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import {
  Play, Square, Shield, Scale, Search, Flame, RotateCcw,
} from 'lucide-react';

function ControlButton({ icon: Icon, label, onClick, active, variant = 'default', disabled = false }) {
  const base = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border';

  const variants = {
    default: active
      ? 'bg-accent/15 text-accent-light border-accent/40 shadow-glow'
      : 'bg-surface-700/40 text-surface-300 border-surface-600/30 hover:bg-surface-600/40 hover:text-white',
    success: 'bg-success/15 text-success border-success/40 hover:bg-success/25',
    danger: 'bg-danger/15 text-danger border-danger/40 hover:bg-danger/25',
    warning: 'bg-warning/15 text-warning border-warning/40 hover:bg-warning/25',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Icon size={14} />
      {label}
    </motion.button>
  );
}

function ToggleSwitch({ label, enabled, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer group">
      <span className="text-xs font-medium text-surface-300 group-hover:text-white transition-colors">
        {label}
      </span>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
          enabled ? 'bg-accent' : 'bg-surface-600'
        }`}
      >
        <motion.span
          layout
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm`}
          style={{ marginLeft: enabled ? 18 : 3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </label>
  );
}

export default function ControlPanel({
  isRunning,
  stressTestActive,
  preventionEnabled,
  avoidanceEnabled,
  detectionEnabled,
  onStart,
  onStop,
  onReset,
  onToggleStress,
  onPreventionChange,
  onAvoidanceChange,
  onDetectionChange,
}) {
  return (
    <GlassCard className="p-5">
      <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
        Control Panel
      </h2>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <ControlButton
          icon={Play}
          label="Start"
          onClick={onStart}
          disabled={isRunning}
          variant="success"
        />
        <ControlButton
          icon={Square}
          label="Stop"
          onClick={onStop}
          disabled={!isRunning}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <ControlButton
          icon={Flame}
          label={stressTestActive ? 'Stop Stress' : 'Stress Test'}
          onClick={onToggleStress}
          active={stressTestActive}
          variant={stressTestActive ? 'warning' : 'default'}
          disabled={!isRunning}
        />
        <ControlButton
          icon={RotateCcw}
          label="Reset"
          onClick={onReset}
          variant="default"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-700/40 my-4" />

      {/* Strategy Toggles */}
      <h3 className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest mb-3">
        Deadlock Strategies
      </h3>
      <div className="space-y-1">
        <ToggleSwitch
          label="Prevention (Resource Ordering)"
          enabled={preventionEnabled}
          onChange={onPreventionChange}
        />
        <ToggleSwitch
          label="Avoidance (Banker's Algorithm)"
          enabled={avoidanceEnabled}
          onChange={onAvoidanceChange}
        />
        <ToggleSwitch
          label="Detection (Cycle Detection)"
          enabled={detectionEnabled}
          onChange={onDetectionChange}
        />
      </div>

      {/* Status indicators */}
      <div className="mt-4 pt-3 border-t border-surface-700/30">
        <div className="flex flex-col gap-1.5">
          {preventionEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] text-success"
            >
              <Shield size={11} />
              <span>Prevention active — resource ordering enforced</span>
            </motion.div>
          )}
          {avoidanceEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] text-info"
            >
              <Scale size={11} />
              <span>Avoidance active — Banker's algorithm checking</span>
            </motion.div>
          )}
          {detectionEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] text-warning"
            >
              <Search size={11} />
              <span>Detection active — cycle scanning enabled</span>
            </motion.div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
