import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Square,
  User,
  ShoppingCart,
  CreditCard,
  Database,
  Package,
  Wallet,
  Key,
  Truck
} from 'lucide-react';
import GlassCard from './GlassCard';

const resourceIcons = {
  R1: ShoppingCart,
  R2: CreditCard,
  R3: Database,
  R4: Wallet,
  R5: Key,
  R6: Truck,
  R7: Package,
  R8: Key,
};

const SVG_WIDTH = 580;
const SVG_HEIGHT = 380;
const CUSTOMER_RADIUS = 20;
const RESOURCE_RADIUS = 22;

function spreadYPositions(count, top, bottom) {
  if (count <= 0) return [];
  if (count === 1) return [(top + bottom) / 2];
  const step = (bottom - top) / (count - 1);
  return Array.from({ length: count }, (_, index) => top + step * index);
}

function buildColumnLayout(nodes, centerX, top, bottom, maxRowsPerColumn, columnGap) {
  const count = nodes.length;
  if (count === 0) return {};

  const columnCount = Math.ceil(count / maxRowsPerColumn);
  const leftX = centerX - ((columnCount - 1) * columnGap) / 2;
  const positions = {};

  for (let col = 0; col < columnCount; col += 1) {
    const start = col * maxRowsPerColumn;
    const end = Math.min(start + maxRowsPerColumn, count);
    const columnNodes = nodes.slice(start, end);
    const ys = spreadYPositions(columnNodes.length, top, bottom);
    const x = leftX + col * columnGap;

    columnNodes.forEach((node, index) => {
      positions[node.id] = { x, y: ys[index] };
    });
  }

  return positions;
}

function getEdgeRenderData(edge, edges, positions) {
  const from = positions[edge.from];
  const to = positions[edge.to];

  if (!from || !to) {
    return null;
  }

  const siblings = edges
    .filter((candidate) => candidate.to === edge.to)
    .sort((left, right) => left.from.localeCompare(right.from));
  const siblingIndex = siblings.findIndex((candidate) => candidate.from === edge.from);
  const offset = siblings.length > 1
    ? (siblingIndex - (siblings.length - 1) / 2) * 10
    : 0;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;
  const perpX = -unitY;
  const perpY = unitX;

  const startX = from.x + unitX * CUSTOMER_RADIUS + perpX * offset;
  const startY = from.y + unitY * CUSTOMER_RADIUS + perpY * offset;
  const endX = to.x - unitX * RESOURCE_RADIUS + perpX * offset;
  const endY = to.y - unitY * RESOURCE_RADIUS + perpY * offset;
  const controlX = (startX + endX) / 2 + perpX * Math.max(Math.abs(offset) * 1.7, 6);
  const controlY = (startY + endY) / 2 + perpY * Math.max(Math.abs(offset) * 1.7, 6);

  return {
    d: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
  };
}

export default function WaitForGraph({
  graphData,
  systemStatus,
  preventionEnabled,
  avoidanceEnabled,
  renderNode,
  isRunning = false,
  onStop,
}) {
  const { nodes, edges } = graphData;
  const hasDeadlock = systemStatus === 'deadlock';

  const positions = useMemo(() => {
    const map = {};
    const customers = nodes
      .filter((n) => n.type === 'customer')
      .sort((a, b) => a.id.localeCompare(b.id));
    const resources = nodes
      .filter((n) => n.type === 'resource')
      .sort((a, b) => a.id.localeCompare(b.id));

    const topPadding = 70;
    const bottomPadding = SVG_HEIGHT - 55;
    const customerPositions = buildColumnLayout(
      customers,
      SVG_WIDTH * 0.33,
      topPadding,
      bottomPadding,
      6,
      86
    );
    const resourcePositions = buildColumnLayout(
      resources,
      SVG_WIDTH * 0.67,
      topPadding,
      bottomPadding,
      4,
      86
    );

    Object.assign(map, customerPositions, resourcePositions);

    return map;
  }, [nodes]);

  const nodeTypeById = useMemo(
    () => nodes.reduce((acc, node) => ({ ...acc, [node.id]: node.type }), {}),
    [nodes]
  );

  const cycleResourceIds = useMemo(() => {
    if (!hasDeadlock) return new Set();
    const ids = new Set();
    edges.forEach((edge) => {
      if (!edge.cycle) return;
      if (nodeTypeById[edge.from] === 'resource') ids.add(edge.from);
      if (nodeTypeById[edge.to] === 'resource') ids.add(edge.to);
    });
    return ids;
  }, [edges, hasDeadlock, nodeTypeById]);

  const isProtected = preventionEnabled || avoidanceEnabled;

  return (
    <GlassCard className="p-5" glow={hasDeadlock ? 'danger' : isProtected ? 'success' : ''}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
          Wait-For Graph
        </h2>
        <div className="flex items-center gap-2">
          {onStop && (
            <motion.button
              whileHover={isRunning ? { scale: 1.02 } : undefined}
              whileTap={isRunning ? { scale: 0.97 } : undefined}
              onClick={onStop}
              disabled={!isRunning}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                isRunning
                  ? 'bg-danger/15 text-danger border-danger/40 hover:bg-danger/25'
                  : 'bg-surface-800/60 text-surface-500 border-surface-700/50 cursor-not-allowed'
              }`}
            >
              <Square size={13} />
              Stop
            </motion.button>
          )}
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
              {preventionEnabled ? 'PREVENTION ACTIVE' : 'AVOIDANCE ACTIVE'}
            </motion.span>
          )}
        </div>
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
          <span className="w-6 h-0.5 bg-[#10b981]" />
          Connection
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
            id="arrow-held"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
          </marker>
          <marker
            id="arrow-waiting"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
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

        {edges.map((edge, i) => {
          const renderData = getEdgeRenderData(edge, edges, positions);
          if (!renderData) return null;

          const isCycle = edge.cycle;
          const edgeColor = edge.color || (isCycle
            ? '#ef4444'
            : edge.type === 'held' ? '#10b981' : edge.type === 'waiting' ? '#3b82f6' : '#4b5563');
          const markerEnd = edgeColor === '#ef4444'
            ? 'url(#arrow-danger)'
            : edgeColor === '#10b981' || edgeColor === '#22c55e'
              ? 'url(#arrow-held)'
              : edgeColor === '#3b82f6' || edgeColor === '#38bdf8'
                ? 'url(#arrow-waiting)'
                : 'url(#arrow)';
          return (
            <motion.path
              key={`edge-${i}`}
              d={renderData.d}
              stroke={edgeColor}
              strokeWidth={isCycle ? 2.5 : 1.5}
              strokeDasharray={edge.type === 'waiting' ? '6 3' : 'none'}
              markerEnd={markerEnd}
              filter={isCycle ? 'url(#glow-filter)' : 'none'}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            />
          );
        })}

        {nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          if (renderNode) {
            const custom = renderNode(node, pos);
            if (custom) return custom;
          }
          const isCustomer = node.type === 'customer';
          const isDeadlocked = node.state === 'deadlocked';
          const isCycleResource = !isCustomer && cycleResourceIds.has(node.id);

          if (!isCustomer) {
            const Icon = resourceIcons[node.id] || Package;

            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={
                  isCycleResource
                    ? { opacity: [0.95, 1, 0.95], scale: [1, 1.06, 1] }
                    : { opacity: 1, scale: 1 }
                }
                transition={
                  isCycleResource
                    ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                    : { type: 'spring', stiffness: 200, damping: 20 }
                }
              >
                {/* 🔥 VISIBLE ICON */}
                <g transform={`translate(${pos.x - 10}, ${pos.y - 10})`}>
                  <Icon
                    size={20}
                    color={
                      isCycleResource
                        ? '#ef4444'
                        : node.state === 'held'
                        ? '#f59e0b'
                        : '#10b981'
                    }
                  />
                </g>

                {/* 🔥 INVISIBLE CIRCLE FOR LAYOUT */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={RESOURCE_RADIUS}
                  fill="transparent"
                />

                {/* 🔥 LABEL */}
                <text
                  x={pos.x}
                  y={pos.y - 18}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="9"
                  fontFamily="Inter, sans-serif"
                  fontWeight="500"
                >
                  {node.label.length > 14 ? `${node.label.slice(0, 12)}...` : node.label}
                </text>

                {/* 🔥 ID */}
                <text
                  x={pos.x}
                  y={pos.y + 20}
                  textAnchor="middle"
                  fill={isCycleResource ? '#ef4444' : '#e5e7eb'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="500"
                >
                  {node.id}
                </text>
              </motion.g>
            );
          }

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={CUSTOMER_RADIUS}
                fill={isDeadlocked ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.25)'}
                stroke={isDeadlocked ? '#ef4444' : '#38bdf8'}
                strokeWidth={1}
                filter={isDeadlocked ? 'url(#glow-filter)' : 'none'}
              />
              
              <g transform={`translate(${pos.x - 9}, ${pos.y - 9})`}>
                <User size={18} color="#e0e7ef" />
              </g>

              <text
                x={pos.x}
                y={pos.y - 25}
                textAnchor="middle"
                fill={isDeadlocked ? '#fecaca' : '#e0e7ef'}
                fontSize="11"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
              >
                {node.label.length > 10 ? `${node.label.slice(0, 9)}...` : node.label}
              </text>
              
              <text
                x={pos.x}
                y={pos.y + 25}
                textAnchor="middle"
                fill={isDeadlocked ? '#ef4444' : '#a5b4fc'}
                fontSize="8.5"
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
