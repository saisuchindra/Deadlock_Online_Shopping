import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import {
  Users,
  HardDrive,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

const statusConfig = {
  idle: { label: 'Idle', color: 'bg-surface-400', textColor: 'text-surface-300', glow: '' },
  running: { label: 'Running', color: 'bg-success', textColor: 'text-success', glow: 'success' },
  deadlock: { label: 'Deadlock Detected', color: 'bg-danger', textColor: 'text-danger', glow: 'danger' },
  recovery: { label: 'Recovery Active', color: 'bg-warning', textColor: 'text-warning', glow: '' },
};

function StatBox({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/40 border border-surface-700/30 min-w-0">
      <div className={`p-2 rounded-lg bg-surface-700/50 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-surface-400 font-medium uppercase tracking-wider truncate">{label}</p>
        <motion.p
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-xl font-bold tabular-nums ${color}`}
        >
          {value}
        </motion.p>
      </div>
    </div>
  );
}

export default function SystemStatus({
  systemStatus,
  activeCustomers,
  activeResources,
  deadlockCount,
  recoveryCount,
}) {
  const config = statusConfig[systemStatus] || statusConfig.idle;

  return (
    <GlassCard className="p-5" glow={config.glow}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
          System Status
        </h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={systemStatus}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              systemStatus === 'deadlock'
                ? 'border-danger/40 bg-danger/10'
                : systemStatus === 'recovery'
                ? 'border-warning/40 bg-warning/10'
                : systemStatus === 'running'
                ? 'border-success/40 bg-success/10'
                : 'border-surface-600/40 bg-surface-700/30'
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              {systemStatus !== 'idle' && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.color}`} />
            </span>
            <span className={`text-xs font-semibold ${config.textColor}`}>
              {config.label}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox
          icon={Users}
          label="Active Customers"
          value={activeCustomers}
          color="text-info"
        />
        <StatBox
          icon={HardDrive}
          label="Active Resources"
          value={activeResources}
          color="text-accent-light"
        />
        <StatBox
          icon={AlertTriangle}
          label="Deadlocks"
          value={deadlockCount}
          color="text-danger"
        />
        <StatBox
          icon={ShieldCheck}
          label="Recoveries"
          value={recoveryCount}
          color="text-success"
        />
      </div>
    </GlassCard>
  );
}
