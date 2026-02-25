import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
  BarChart, Bar, Legend,
} from 'recharts';
import GlassCard from './GlassCard';
import { Clock, Zap, CheckCircle, XCircle } from 'lucide-react';

function MetricBadge({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-900/40 border border-surface-700/30">
      <div className={`p-1.5 rounded-lg bg-surface-700/50 ${color}`}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[10px] text-surface-400 font-medium uppercase tracking-widest">{label}</p>
        <p className={`text-base font-bold tabular-nums ${color}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="text-xs font-normal ml-0.5 text-surface-500">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

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

export default function PerformanceMetrics({ perfData, totalGranted, totalDenied, tick }) {
  const latest = perfData[perfData.length - 1] || {};

  return (
    <GlassCard className="p-5">
      <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
        Performance Metrics
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricBadge
          icon={Clock}
          label="Exec Time"
          value={(tick * 1.2).toFixed(1)}
          unit="s"
          color="text-accent-light"
        />
        <MetricBadge
          icon={Zap}
          label="Throughput"
          value={latest.throughput || 0}
          unit="ops/s"
          color="text-warning"
        />
        <MetricBadge
          icon={CheckCircle}
          label="Granted"
          value={totalGranted}
          color="text-success"
        />
        <MetricBadge
          icon={XCircle}
          label="Denied"
          value={totalDenied}
          color="text-danger"
        />
      </div>

      {/* System Load Chart */}
      <div className="mb-5">
        <h3 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">
          System Load Over Time
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={perfData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2340" />
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cpuUsage"
                stroke="#6366f1"
                fill="url(#cpuGrad)"
                strokeWidth={2}
                name="CPU %"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1' }}
              />
              <Area
                type="monotone"
                dataKey="memoryUsage"
                stroke="#10b981"
                fill="url(#memGrad)"
                strokeWidth={2}
                name="Memory %"
                dot={false}
                activeDot={{ r: 4, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Granted vs Denied Chart */}
      <div>
        <h3 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">
          Granted vs Denied Requests
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perfData.slice(-20)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2340" />
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
              />
              <Bar dataKey="granted" fill="#10b981" name="Granted" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="denied" fill="#ef4444" name="Denied" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}
