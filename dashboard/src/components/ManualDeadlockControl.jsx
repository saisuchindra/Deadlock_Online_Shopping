import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { AlertCircle, Zap, RefreshCw, Plus, Minus } from 'lucide-react';

function DeadlockButton({ label, onClick, variant = 'default', icon: Icon }) {
  const variants = {
    default: 'bg-accent/15 text-accent border-accent/40 hover:bg-accent/25',
    success: 'bg-success/15 text-success border-success/40 hover:bg-success/25',
    danger: 'bg-danger/15 text-danger border-danger/40 hover:bg-danger/25',
    warning: 'bg-warning/15 text-warning border-warning/40 hover:bg-warning/25',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${variants[variant]}`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </motion.button>
  );
}

export default function ManualDeadlockControl({
  customers,
  resources,
  onSetupDeadlock,
  onRequestResource,
  onReleaseResource,
  onResetGraph,
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={16} className="text-danger" />
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
          Manual Deadlock Creator
        </h2>
      </div>

      {/* Predefined Deadlock Scenarios */}
      <div className="mb-5 pb-5 border-b border-surface-700/30">
        <p className="text-xs text-surface-400 font-medium mb-3 uppercase tracking-wider">
          Deadlock Scenarios
        </p>
        
        {/* Scenario 1: C1 ↔ C2 circular wait */}
        <motion.div className="mb-3 p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
          <p className="text-xs text-surface-300 mb-2 font-medium">
            Scenario 1: C1 & C2 Circular Wait (via R1)
          </p>
          <p className="text-xs text-surface-500 mb-2">
            C1 holds R1, waits for R2 | C2 holds R2, waits for R1
          </p>
          <DeadlockButton
            label="Create Deadlock"
            onClick={() => onSetupDeadlock('scenario1')}
            variant="danger"
            icon={Zap}
          />
        </motion.div>

        {/* Scenario 2: C1 & C2 both want R1 */}
        <motion.div className="mb-3 p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
          <p className="text-xs text-surface-300 mb-2 font-medium">
            Scenario 2: C1 & C2 Both Want R1
          </p>
          <p className="text-xs text-surface-500 mb-2">
            C1 &amp; C2 wait for R1 (resource conflict)
          </p>
          <DeadlockButton
            label="Create Conflict"
            onClick={() => onSetupDeadlock('scenario2')}
            variant="warning"
            icon={Zap}
          />
        </motion.div>

        {/* Scenario 3: Chain deadlock */}
        <motion.div className="mb-3 p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
          <p className="text-xs text-surface-300 mb-2 font-medium">
            Scenario 3: Chain Deadlock (3-way)
          </p>
          <p className="text-xs text-surface-500 mb-2">
            C1 → R1 → C2 → R2 → C3 → R1 (circular)
          </p>
          <DeadlockButton
            label="Create Chain"
            onClick={() => onSetupDeadlock('scenario3')}
            variant="danger"
            icon={Zap}
          />
        </motion.div>
      </div>

      {/* Manual Resource Control */}
      <div className="mb-5 pb-5 border-b border-surface-700/30">
        <p className="text-xs text-surface-400 font-medium mb-3 uppercase tracking-wider">
          Manual Resource Control
        </p>
        
        <div className="space-y-2">
          {/* Customer 1 */}
          <motion.div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
            <p className="text-xs text-surface-400 mb-2">Customer_A</p>
            <div className="flex gap-2">
              <DeadlockButton
                label="Request R1"
                onClick={() => onRequestResource('C0', 'R1')}
                variant="default"
                icon={Plus}
              />
              <DeadlockButton
                label="Release"
                onClick={() => onReleaseResource('C0')}
                variant="success"
                icon={Minus}
              />
            </div>
          </motion.div>

          {/* Customer 2 */}
          <motion.div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
            <p className="text-xs text-surface-400 mb-2">Customer_B</p>
            <div className="flex gap-2">
              <DeadlockButton
                label="Request R1"
                onClick={() => onRequestResource('C1', 'R1')}
                variant="default"
                icon={Plus}
              />
              <DeadlockButton
                label="Release"
                onClick={() => onReleaseResource('C1')}
                variant="success"
                icon={Minus}
              />
            </div>
          </motion.div>

          {/* Customer 3 */}
          <motion.div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
            <p className="text-xs text-surface-400 mb-2">Customer_C</p>
            <div className="flex gap-2">
              <DeadlockButton
                label="Request R2"
                onClick={() => onRequestResource('C2', 'R2')}
                variant="default"
                icon={Plus}
              />
              <DeadlockButton
                label="Release"
                onClick={() => onReleaseResource('C2')}
                variant="success"
                icon={Minus}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reset */}
      <DeadlockButton
        label="Reset to Manual Data"
        onClick={onResetGraph}
        variant="warning"
        icon={RefreshCw}
      />
    </GlassCard>
  );
}
