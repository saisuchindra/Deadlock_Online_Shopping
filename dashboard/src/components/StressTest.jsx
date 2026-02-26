import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';
import GlassCard from './GlassCard';
import { Flame, Activity, Lock, Timer, ChevronUp, ChevronDown, Gauge } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface-800/95 backdrop-blur-sm border border-surface-600/40 rounded-xl p-3 shadow-lg">
      <p className="text-xs text-surface-400 mb-1.5 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

function StressMetric({ icon: Icon, label, value, color }) {
  return (
    <div className="text-center p-3 rounded-xl bg-surface-900/40 border border-surface-700/30">
      <Icon size={16} className={`mx-auto mb-1 ${color}`} />
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] text-surface-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function StressTest({ stressData, active, stressLevel = 5, onAdjustLevel }) {
  const latest = stressData[stressData.length - 1] || {};

  const levelColor =
    stressLevel <= 3 ? 'text-success' :
    stressLevel <= 6 ? 'text-warning' :
    'text-danger';

  const levelBarColor =
    stressLevel <= 3 ? 'bg-success' :
    stressLevel <= 6 ? 'bg-warning' :
    'bg-danger';

  return (
    <GlassCard className="p-5" glow={active ? 'accent' : ''}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
          Stress Test Visualization
        </h2>
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/30"
            >
              <Flame size={12} className="text-warning animate-pulse" />
              <span className="text-xs font-semibold text-warning">ACTIVE</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stress Level Control */}
      <div className="mb-5 p-3 rounded-xl bg-surface-900/50 border border-surface-700/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gauge size={14} className={levelColor} />
            <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">
              Stress Level
            </span>
          </div>
          <span className={`text-lg font-bold tabular-nums ${levelColor}`}>
            {stressLevel}<span className="text-xs text-surface-500 font-normal">/10</span>
          </span>
        </div>

        {/* Level Bar */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i < stressLevel ? levelBarColor : 'bg-surface-700/40'
              }`}
            />
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onAdjustLevel && onAdjustLevel(-1)}
            disabled={stressLevel <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-surface-800/60 border border-surface-600/30 text-surface-300
              hover:bg-surface-700/60 hover:text-white hover:border-surface-500/40
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200 active:scale-95"
          >
            <ChevronDown size={14} />
            Decrease
          </button>

          <span className="text-[10px] text-surface-500 uppercase tracking-widest font-medium min-w-[60px] text-center">
            {stressLevel <= 3 ? 'Low' : stressLevel <= 6 ? 'Medium' : stressLevel <= 8 ? 'High' : 'Extreme'}
          </span>

          <button
            onClick={() => onAdjustLevel && onAdjustLevel(1)}
            disabled={stressLevel >= 10}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-surface-800/60 border border-surface-600/30 text-surface-300
              hover:bg-surface-700/60 hover:text-white hover:border-surface-500/40
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200 active:scale-95"
          >
            Increase
            <ChevronUp size={14} />
          </button>
        </div>
      </div>

      {!active && stressData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-surface-500 text-sm">
          Enable stress test to see contention metrics
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <StressMetric
              icon={Activity}
              label="Thread Spawns"
              value={latest.threadSpawns || 0}
              color="text-info"
            />
            <StressMetric
              icon={Flame}
              label="Contention %"
              value={latest.contentionLevel || 0}
              color="text-danger"
            />
            <StressMetric
              icon={Lock}
              label="Lock Fails"
              value={latest.lockFailures || 0}
              color="text-warning"
            />
            <StressMetric
              icon={Timer}
              label="Avg Wait (ms)"
              value={latest.avgWaitTime || 0}
              color="text-accent-light"
            />
          </div>

          {/* Thread activity chart */}
          <div className="mb-4">
            <h3 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">
              Thread Activity & Contention
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stressData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="threadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="contentionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2340" />
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="threadSpawns"
                    stroke="#f59e0b"
                    fill="url(#threadGrad)"
                    strokeWidth={2}
                    name="Threads"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="contentionLevel"
                    stroke="#ef4444"
                    fill="url(#contentionGrad)"
                    strokeWidth={2}
                    name="Contention %"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lock attempts chart */}
          <div>
            <h3 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">
              Lock Attempts vs Failures
            </h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stressData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2340" />
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="lockAttempts"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Lock Attempts"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lockFailures"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Lock Failures"
                    dot={false}
                    strokeDasharray="5 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  );
}
