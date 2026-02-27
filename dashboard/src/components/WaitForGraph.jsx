import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const SVG_WIDTH = 580;
const SVG_HEIGHT = 380;

function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export default function WaitForGraph({ graphData, systemStatus, preventionEnabled, avoidanceEnabled }) {
  const { nodes, edges } = graphData;

  const positions = useMemo(() => {
    const map = {};
    const customers = nodes.filter((n) => n.type === 'customer');
    const resources = nodes.filter((n) => n.type === 'resource');

    const cx = SVG_WIDTH / 2;
    const cy = SVG_HEIGHT / 2;
    const customerRadius = 120;
    const resourceRadius = 155;

    customers.forEach((node, i) => {
      const angle = (360 / Math.max(customers.length, 1)) * i;
      const pos = polarToCartesian(cx, cy, customerRadius, angle);
      map[node.id] = pos;
    });

    resources.forEach((node, i) => {
      const angle = (360 / Math.max(resources.length, 1)) * i + 22.5;
      const pos = polarToCartesian(cx, cy, resourceRadius, angle);
      map[node.id] = pos;
    });

    return map;
  }, [nodes]);

  const hasDeadlock = systemStatus === 'deadlock';
  const isProtected = preventionEnabled || avoidanceEnabled;

  return (
    <GlassCard className="p-5" glow={hasDeadlock ? 'danger' : isProtected ? 'success' : ''}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
          Wait-For Graph
        </h2>
        {hasDeadlock && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-bold text-danger px-2 py-1 rounded-full bg-danger/10 border border-danger/30"
          >
            CYCLE DETECTED
          </motion.span>
        )}
        {!hasDeadlock && isProtected && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-bold text-success px-2 py-1 rounded-full bg-success/10 border border-success/30"
          >
            {preventionEnabled ? '⛔ PREVENTION ACTIVE' : '🛡️ AVOIDANCE ACTIVE'}
          </motion.span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-surface-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-info/60 border border-info/40" />
          Customer
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-accent/60 border border-accent/40" />
          Resource
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-surface-400" />
          Edge
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-danger" />
          Cycle
        </div>
      </div>

      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto"
        style={{ maxHeight: 380 }}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
          <marker
            id="arrow-danger"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;

          const isCycle = edge.cycle;
          return (
            <motion.line
              key={`edge-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isCycle ? '#ef4444' : '#4b5563'}
              strokeWidth={isCycle ? 2.5 : 1.5}
              strokeDasharray={edge.type === 'waiting' ? '6 3' : 'none'}
              markerEnd={isCycle ? 'url(#arrow-danger)' : 'url(#arrow)'}
              filter={isCycle ? 'url(#glow-filter)' : 'none'}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;

          const isCustomer = node.type === 'customer';
          const isDeadlocked = node.state === 'deadlocked';

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {isCustomer ? (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={20}
                  fill={isDeadlocked ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.15)'}
                  stroke={isDeadlocked ? '#ef4444' : '#3b82f6'}
                  strokeWidth={isDeadlocked ? 2.5 : 1.5}
                  filter={isDeadlocked ? 'url(#glow-filter)' : 'none'}
                />
              ) : (
                <rect
                  x={pos.x - 18}
                  y={pos.y - 18}
                  width={36}
                  height={36}
                  rx={6}
                  fill={node.state === 'held' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.12)'}
                  stroke={node.state === 'held' ? '#f59e0b' : '#6366f1'}
                  strokeWidth={1.5}
                />
              )}

              <text
                x={pos.x}
                y={pos.y + (isCustomer ? 35 : 35)}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="9"
                fontFamily="Inter, sans-serif"
                fontWeight="500"
              >
                {node.label.length > 14 ? node.label.slice(0, 12) + '…' : node.label}
              </text>

              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill={isDeadlocked ? '#ef4444' : '#e5e7eb'}
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="500"
              >
                {node.id}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </GlassCard>
  );
}
