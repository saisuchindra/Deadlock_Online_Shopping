import React, { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import {
  Play, Cpu, Lock, Unlock, Clock, AlertTriangle, ShieldCheck,
  Activity, Zap, Eye, EyeOff, MemoryStick, Terminal,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   LIVE OS-LEVEL MONITOR
   
   Connected to the main dashboard simulation (useSimulation).
   Translates customer/resource state into an OS kernel view:
   - PCB (Process Control Block) table
   - Thread scheduling & context switches
   - Mutex ownership and kernel wait queues
   - Live Resource Allocation Graph (RAG) from OS perspective
   - Kernel event stream
   ══════════════════════════════════════════════════════════════ */

/* ─── Map sim customer state → OS thread state ─── */
function mapOsState(customerState) {
  const map = {
    idle: { label: 'NEW', color: 'bg-slate-500', text: 'text-slate-400', icon: '○', priority: 0 },
    running: { label: 'RUNNING', color: 'bg-emerald-500', text: 'text-emerald-400', icon: '▶', priority: 3 },
    waiting: { label: 'BLOCKED', color: 'bg-rose-500', text: 'text-rose-400', icon: '⏸', priority: 2 },
    deadlocked: { label: 'DEADLOCKED', color: 'bg-red-600', text: 'text-red-400', icon: '💀', priority: 4 },
  };
  return map[customerState] || map.idle;
}

/* ─── Mutex state from resource ─── */
function mutexInfo(resource) {
  if (!resource.available && resource.owner) {
    return { state: 'LOCKED', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '🔒' };
  }
  return { state: 'UNLOCKED', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '🔓' };
}

/* ─── Tiny SVG for live RAG ─── */
function LiveRAG({ customers, resources }) {
  const activeCustomers = customers.filter(c => c.state !== 'idle');
  const activeResources = resources.filter(r => !r.available || r.waitingThreads?.length > 0);

  // Layout: customers on top, resources on bottom
  const cNodes = activeCustomers.slice(0, 8).map((c, i) => ({
    id: c.name, type: 'thread',
    x: 50 + i * 75, y: 40,
    state: c.state,
    holding: c.holding || [],
    waiting: c.waiting,
  }));

  const rNodes = activeResources.slice(0, 8).map((r, i) => ({
    id: r.id, type: 'resource',
    x: 50 + i * 75, y: 160,
    owner: r.owner,
    waitQueue: r.waitingThreads || [],
  }));

  const nodeMap = {};
  cNodes.forEach(n => { nodeMap[n.id] = n; });
  rNodes.forEach(n => { nodeMap[n.id] = n; });

  // Build edges: holds (resource → thread) and waits (thread → resource)
  const edges = [];
  cNodes.forEach(cn => {
    cn.holding.forEach(rid => {
      if (nodeMap[rid]) {
        edges.push({ from: nodeMap[rid], to: cn, type: 'holds', cycle: cn.state === 'deadlocked' });
      }
    });
    if (cn.waiting && nodeMap[cn.waiting]) {
      edges.push({ from: cn, to: nodeMap[cn.waiting], type: 'waits', cycle: cn.state === 'deadlocked' });
    }
  });

  const svgWidth = Math.max(400, Math.max(cNodes.length, rNodes.length) * 75 + 50);

  return (
    <svg viewBox={`0 0 ${svgWidth} 200`} className="w-full h-auto" style={{ minHeight: 180 }}>
      <defs>
        <marker id="lm-arrow-hold" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="6" markerHeight="4" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
        <marker id="lm-arrow-wait" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="6" markerHeight="4" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
        <marker id="lm-arrow-cycle" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="6" markerHeight="4" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
        </marker>
        <filter id="lm-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((e, i) => (
        <line
          key={`e${i}`}
          x1={e.from.x} y1={e.from.y}
          x2={e.to.x} y2={e.to.y}
          stroke={e.cycle ? '#ef4444' : e.type === 'holds' ? '#10b981' : '#6b7280'}
          strokeWidth={e.cycle ? 2.5 : 1.5}
          strokeDasharray={e.type === 'waits' ? '5 3' : 'none'}
          markerEnd={e.cycle ? 'url(#lm-arrow-cycle)' : e.type === 'holds' ? 'url(#lm-arrow-hold)' : 'url(#lm-arrow-wait)'}
          filter={e.cycle ? 'url(#lm-glow)' : 'none'}
          opacity={0.8}
        />
      ))}

      {/* Customer nodes (circles) */}
      {cNodes.map(n => {
        const os = mapOsState(n.state);
        const colors = {
          running: { fill: 'rgba(16,185,129,0.2)', stroke: '#10b981' },
          waiting: { fill: 'rgba(244,63,94,0.2)', stroke: '#f43f5e' },
          deadlocked: { fill: 'rgba(239,68,68,0.3)', stroke: '#ef4444' },
          idle: { fill: 'rgba(100,116,139,0.2)', stroke: '#64748b' },
        };
        const c = colors[n.state] || colors.idle;
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={20} fill={c.fill} stroke={c.stroke} strokeWidth={n.state === 'deadlocked' ? 3 : 1.5} filter={n.state === 'deadlocked' ? 'url(#lm-glow)' : 'none'} />
            <text x={n.x} y={n.y - 4} textAnchor="middle" fill="#e5e7eb" fontSize="8" fontWeight="bold" fontFamily="monospace">
              {n.id.replace('Customer ', 'T')}
            </text>
            <text x={n.x} y={n.y + 7} textAnchor="middle" fill={c.stroke} fontSize="6" fontWeight="600">
              {os.label}
            </text>
          </g>
        );
      })}

      {/* Resource nodes (rectangles) */}
      {rNodes.map(n => {
        const isLocked = n.owner !== null;
        return (
          <g key={n.id}>
            <rect x={n.x - 20} y={n.y - 16} width={40} height={32} rx={6}
              fill={isLocked ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)'}
              stroke={isLocked ? '#f59e0b' : '#6366f1'}
              strokeWidth={1.5}
            />
            <text x={n.x} y={n.y - 2} textAnchor="middle" fill="#e5e7eb" fontSize="9" fontWeight="bold" fontFamily="monospace">
              {n.id}
            </text>
            <text x={n.x} y={n.y + 9} textAnchor="middle" fill="#9ca3af" fontSize="6">
              {isLocked ? `🔒${n.owner?.replace('Customer ', 'T')}` : '🔓free'}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(8, 192)">
        <line x1="0" y1="0" x2="14" y2="0" stroke="#10b981" strokeWidth="1.5" />
        <text x="17" y="3" fill="#9ca3af" fontSize="6">Holds</text>
        <line x1="55" y1="0" x2="69" y2="0" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="72" y="3" fill="#9ca3af" fontSize="6">Waits</text>
        <line x1="107" y1="0" x2="121" y2="0" stroke="#ef4444" strokeWidth="2.5" />
        <text x="124" y="3" fill="#9ca3af" fontSize="6">Cycle</text>
      </g>
    </svg>
  );
}

/* ─── Kernel event translator ─── */
function translateToOsEvent(ev) {
  const typeMap = {
    request: { osType: 'SYSCALL', icon: '📞', badge: 'bg-blue-500/15 text-blue-400' },
    allocate: { osType: 'MUTEX_LOCK', icon: '🔒', badge: 'bg-emerald-500/15 text-emerald-400' },
    release: { osType: 'MUTEX_UNLOCK', icon: '🔓', badge: 'bg-teal-500/15 text-teal-400' },
    block: { osType: 'BLOCK', icon: '⏸', badge: 'bg-amber-500/15 text-amber-400' },
    deadlock: { osType: 'DEADLOCK', icon: '💀', badge: 'bg-red-500/15 text-red-400' },
    recovery: { osType: 'RECOVERY', icon: '🛠', badge: 'bg-orange-500/15 text-orange-400' },
    prevention: { osType: 'PREVENT', icon: '🛡', badge: 'bg-emerald-500/15 text-emerald-400' },
    avoidance_safe: { osType: 'BANKER_OK', icon: '✅', badge: 'bg-blue-500/15 text-blue-400' },
    avoidance_denied: { osType: 'BANKER_DENY', icon: '⛔', badge: 'bg-amber-500/15 text-amber-400' },
  };
  return typeMap[ev.type] || { osType: 'KERNEL', icon: '⚙', badge: 'bg-surface-500/15 text-surface-400' };
}

/* ─── Kernel Event Feed ─── */
function KernelEventFeed({ events }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [events.length]);

  const recent = events.slice(0, 30);

  return (
    <div ref={scrollRef} className="overflow-y-auto space-y-1 pr-1 custom-scrollbar" style={{ maxHeight: 350 }}>
      {recent.length === 0 ? (
        <div className="text-center text-surface-500 text-xs py-8">
          Press <span className="text-accent-light font-bold">Start</span> on the Dashboard to begin
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {recent.map((ev, i) => {
            const os = translateToOsEvent(ev);
            return (
              <motion.div
                key={ev.id || i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 py-1.5 px-2.5 rounded-lg bg-surface-900/30 border-l-2 border-surface-700/40"
              >
                <span className="text-sm mt-0.5 flex-shrink-0">{os.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${os.badge}`}>
                      {os.osType}
                    </span>
                    <span className="text-[8px] text-surface-500 font-mono">{ev.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-surface-300 font-mono leading-relaxed truncate" title={ev.message}>
                    {ev.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function OSLiveMonitor({ sim }) {
  const {
    isRunning, tick, systemStatus, customers, resources,
    eventLog, graphData, deadlockCount, recoveryCount,
    preventionEnabled, avoidanceEnabled, detectionEnabled,
  } = sim;

  // Derive OS-level stats
  const threadStats = useMemo(() => {
    const states = { running: 0, waiting: 0, deadlocked: 0, idle: 0 };
    customers.forEach(c => { states[c.state] = (states[c.state] || 0) + 1; });
    return states;
  }, [customers]);

  const mutexStats = useMemo(() => {
    const locked = resources.filter(r => !r.available).length;
    const free = resources.filter(r => r.available).length;
    const contended = resources.filter(r => r.waitingThreads?.length > 0).length;
    return { locked, free, contended, total: resources.length };
  }, [resources]);

  const statusConfig = {
    idle: { label: 'OFFLINE', color: 'text-surface-400', bg: 'bg-surface-800/50', border: 'border-surface-600/30', glow: '' },
    running: { label: 'EXECUTING', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'success' },
    deadlock: { label: 'DEADLOCK!', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'danger' },
    recovery: { label: 'RECOVERING', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: '' },
  };

  const sc = statusConfig[systemStatus] || statusConfig.idle;

  return (
    <GlassCard className="p-6" glow={sc.glow}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${sc.bg} border ${sc.border}`}>
            <Terminal size={20} className={sc.color} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              Live OS Execution Monitor
              {isRunning && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
              )}
            </h2>
            <p className="text-xs text-surface-400 mt-0.5">
              {isRunning
                ? `Kernel view of running simulation — Tick ${tick}`
                : 'Press Start on the Dashboard to see OS execution in real-time'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* System Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${sc.bg} ${sc.border} ${sc.color}`}>
            {systemStatus === 'deadlock' ? <AlertTriangle size={13} /> : systemStatus === 'running' ? <Activity size={13} /> : <Clock size={13} />}
            {sc.label}
          </div>

          {/* Strategy Indicators */}
          {preventionEnabled && (
            <span className="text-[9px] font-bold px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              🛡 PREVENTION
            </span>
          )}
          {avoidanceEnabled && (
            <span className="text-[9px] font-bold px-2 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              🏦 AVOIDANCE
            </span>
          )}
          {detectionEnabled && (
            <span className="text-[9px] font-bold px-2 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400">
              🔍 DETECTION
            </span>
          )}
        </div>
      </div>

      {!isRunning && systemStatus === 'idle' ? (
        /* Idle state - prompt */
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-2xl bg-surface-800/40 border border-surface-700/30 mb-4">
            <Cpu size={40} className="text-surface-500" />
          </div>
          <h3 className="text-sm font-bold text-surface-300 mb-2">Simulation Not Running</h3>
          <p className="text-xs text-surface-500 max-w-md leading-relaxed">
            Go to the <span className="text-accent-light font-semibold">Dashboard</span> tab and press{' '}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">
              <Play size={10} /> Start
            </span>{' '}
            to begin the simulation. Then come back here to see OS-level execution in real-time.
          </p>
        </div>
      ) : (
        /* Live monitoring grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Thread Table + Scheduler */}
          <div className="lg:col-span-4 space-y-3">
            {/* OS Stats Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-surface-900/40 border border-surface-700/30 p-2.5 text-center">
                <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider">Threads</div>
                <div className="text-lg font-extrabold text-white mt-0.5">{customers.length}</div>
                <div className="text-[8px] text-surface-500">{threadStats.running} running</div>
              </div>
              <div className="rounded-xl bg-surface-900/40 border border-surface-700/30 p-2.5 text-center">
                <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider">Mutexes</div>
                <div className="text-lg font-extrabold text-white mt-0.5">{mutexStats.total}</div>
                <div className="text-[8px] text-surface-500">{mutexStats.locked} locked</div>
              </div>
              <div className="rounded-xl bg-surface-900/40 border border-surface-700/30 p-2.5 text-center">
                <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider">Deadlocks</div>
                <div className={`text-lg font-extrabold mt-0.5 ${deadlockCount > 0 ? 'text-red-400' : 'text-white'}`}>{deadlockCount}</div>
                <div className="text-[8px] text-surface-500">{recoveryCount} recovered</div>
              </div>
              <div className="rounded-xl bg-surface-900/40 border border-surface-700/30 p-2.5 text-center">
                <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider">Contended</div>
                <div className={`text-lg font-extrabold mt-0.5 ${mutexStats.contended > 0 ? 'text-amber-400' : 'text-white'}`}>{mutexStats.contended}</div>
                <div className="text-[8px] text-surface-500">wait queues</div>
              </div>
            </div>

            {/* Process Control Block Table */}
            <div className="rounded-xl bg-surface-900/40 border border-surface-700/30 p-3">
              <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu size={10} /> Process Control Block (PCB)
              </div>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {customers.map((c, i) => {
                  const os = mapOsState(c.state);
                  return (
                    <motion.div
                      key={c.name}
                      layout
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-300 ${
                        c.state === 'deadlocked'
                          ? 'bg-red-500/10 border border-red-500/30'
                          : c.state === 'waiting'
                          ? 'bg-rose-500/5 border border-rose-500/20'
                          : c.state === 'running'
                          ? 'bg-emerald-500/5 border border-emerald-500/20'
                          : 'bg-surface-800/20 border border-surface-700/20'
                      }`}
                    >
                      {/* PID */}
                      <span className="text-[9px] font-mono text-surface-500 w-8">T{i}</span>

                      {/* Thread Name */}
                      <span className="text-[10px] font-semibold text-surface-200 flex-1 truncate" title={c.name}>
                        {c.name}
                      </span>

                      {/* State indicator */}
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        {(c.state === 'running' || c.state === 'deadlocked') && (
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${os.color} opacity-75`} />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${os.color}`} />
                      </span>

                      {/* State label */}
                      <span className={`text-[8px] font-bold uppercase tracking-wider w-16 text-right ${os.text}`}>
                        {os.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Mutex Table */}
            <div className="rounded-xl bg-surface-900/40 border border-surface-700/30 p-3">
              <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock size={10} /> Kernel Mutex Table
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {resources.map((r) => {
                  const mi = mutexInfo(r);
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg border transition-all ${mi.bg} ${mi.border}`}
                    >
                      <span className="text-sm flex-shrink-0">{mi.icon}</span>
                      <span className="text-[10px] font-bold text-surface-200 flex-1 truncate" title={r.name}>{r.name || r.id}</span>
                      <span className={`text-[8px] font-bold ${mi.color}`}>{mi.state}</span>
                      {r.owner && (
                        <span className="text-[8px] text-amber-400 font-mono truncate max-w-[60px]" title={r.owner}>
                          {r.owner.replace('Customer ', 'T')}
                        </span>
                      )}
                      {r.waitingThreads?.length > 0 && (
                        <span className="text-[7px] text-rose-400 font-mono">
                          Q[{r.waitingThreads.length}]
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center: Live Resource Allocation Graph */}
          <div className="lg:col-span-4">
            <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity size={10} /> Live Resource Allocation Graph
            </div>
            <div className={`rounded-xl border p-3 transition-all duration-500 ${
              systemStatus === 'deadlock'
                ? 'bg-red-500/5 border-red-500/30'
                : systemStatus === 'recovery'
                ? 'bg-orange-500/5 border-orange-500/20'
                : preventionEnabled || avoidanceEnabled
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-surface-900/50 border-surface-700/30'
            }`}>
              <LiveRAG customers={customers} resources={resources} />

              {/* Status indicator below graph */}
              <AnimatePresence mode="wait">
                {systemStatus === 'deadlock' && (
                  <motion.div
                    key="deadlock"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center mt-2"
                  >
                    <span className="text-xs font-bold text-red-400 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 animate-pulse">
                      💀 CIRCULAR WAIT → DEADLOCK DETECTED
                    </span>
                  </motion.div>
                )}
                {systemStatus === 'recovery' && (
                  <motion.div
                    key="recovery"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center mt-2"
                  >
                    <span className="text-xs font-bold text-orange-400 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
                      🛠 OS Recovery: preempting victim thread...
                    </span>
                  </motion.div>
                )}
                {(preventionEnabled || avoidanceEnabled) && systemStatus === 'running' && (
                  <motion.div
                    key="protected"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center mt-2"
                  >
                    <span className="text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      {preventionEnabled ? '🛡 Resource Ordering Active' : '🏦 Banker\'s Algorithm Active'} — No Deadlock
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scheduler Info */}
            <div className="mt-3 rounded-xl bg-surface-900/40 border border-surface-700/30 p-3">
              <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock size={10} /> OS Scheduler
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-surface-400">Policy</span>
                  <span className="text-[10px] font-bold text-blue-400">CFS (Completely Fair Scheduler)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-surface-400">Time Quantum</span>
                  <span className="text-[10px] font-bold text-surface-200 font-mono">1.2s (TICK_INTERVAL)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-surface-400">Ready Queue</span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">{threadStats.running} threads</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-surface-400">Wait Queue</span>
                  <span className={`text-[10px] font-bold font-mono ${threadStats.waiting > 0 ? 'text-rose-400' : 'text-surface-400'}`}>
                    {threadStats.waiting + (threadStats.deadlocked || 0)} threads
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-surface-400">Context Switches</span>
                  <span className="text-[10px] font-bold text-surface-200 font-mono">~{tick * 2}/s</span>
                </div>
              </div>
            </div>

            {/* Kernel Call Stack */}
            <div className="mt-3 rounded-xl bg-surface-900/40 border border-surface-700/30 p-3">
              <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MemoryStick size={10} /> Current Kernel Activity
              </div>
              <div className="font-mono text-[9px] text-surface-300 space-y-0.5 p-2 rounded bg-surface-950/60 border border-surface-800/40">
                {systemStatus === 'deadlock' ? (
                  <>
                    <div className="text-red-400">→ detect_deadlock(wait_for[][])</div>
                    <div className="text-red-400">  → DFS: cycle found!</div>
                    <div className="text-orange-400">  → select_victim(lowest_priority)</div>
                    <div className="text-orange-400">  → preempt_resources(victim)</div>
                  </>
                ) : systemStatus === 'recovery' ? (
                  <>
                    <div className="text-orange-400">→ recover_deadlock()</div>
                    <div className="text-orange-400">  → pthread_mutex_unlock(victim)</div>
                    <div className="text-emerald-400">  → wake_blocked_threads()</div>
                    <div className="text-blue-400">  → reschedule()</div>
                  </>
                ) : preventionEnabled ? (
                  <>
                    <div className="text-emerald-400">→ acquire_resource_ordered(tid, rid)</div>
                    <div className="text-emerald-400">  → check_ordering(held_max, rid)</div>
                    <div className="text-blue-400">  → pthread_mutex_trylock(mutex[rid])</div>
                    <div className="text-surface-400">  → schedule_next()</div>
                  </>
                ) : avoidanceEnabled ? (
                  <>
                    <div className="text-blue-400">→ bankers_check(tid, rid)</div>
                    <div className="text-blue-400">  → compute_safe_sequence()</div>
                    <div className="text-emerald-400">  → safe_state ? grant() : deny()</div>
                    <div className="text-surface-400">  → schedule_next()</div>
                  </>
                ) : (
                  <>
                    <div className="text-blue-400">→ schedule_tick()</div>
                    <div className="text-surface-400">  → for_each_thread(try_acquire)</div>
                    <div className="text-surface-400">  → update_wait_queues()</div>
                    <div className="text-surface-400">  → context_switch(next_thread)</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Kernel Event Feed */}
          <div className="lg:col-span-4">
            <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap size={10} /> Kernel Event Stream (Live)
            </div>
            <div className="rounded-xl border border-surface-700/30 bg-surface-900/40 p-3">
              <KernelEventFeed events={eventLog} />
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
