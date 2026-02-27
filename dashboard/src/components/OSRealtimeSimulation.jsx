import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import { Play, Square, RotateCcw, Shield } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   REAL-TIME OS DEADLOCK SIMULATION
   
   This simulates the exact kernel-level execution:
   - Threads transition between OS states in real-time
   - Mutexes are acquired/blocked with visual feedback
   - Wait-For Graph builds edge-by-edge
   - Deadlock cycle is detected via animated DFS
   - Recovery preempts victim and wakes blocked threads
   ══════════════════════════════════════════════════════════════ */

const THREAD_STATES = {
  new: { color: 'bg-slate-500', text: 'text-slate-400', label: 'NEW', ring: 'ring-slate-500/30' },
  ready: { color: 'bg-blue-500', text: 'text-blue-400', label: 'READY', ring: 'ring-blue-500/30' },
  running: { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'RUNNING', ring: 'ring-emerald-500/30' },
  sleeping: { color: 'bg-amber-500', text: 'text-amber-400', label: 'SLEEPING', ring: 'ring-amber-500/30' },
  blocked: { color: 'bg-rose-500', text: 'text-rose-400', label: 'BLOCKED', ring: 'ring-rose-500/30' },
  deadlocked: { color: 'bg-red-600', text: 'text-red-400', label: 'DEADLOCKED', ring: 'ring-red-600/40' },
  terminated: { color: 'bg-gray-600', text: 'text-gray-500', label: 'TERMINATED', ring: 'ring-gray-600/20' },
};

/* ─── Initial state factory ─── */
function createInitialState() {
  return {
    phase: 'idle', // idle, running, paused, done
    tick: 0,
    threads: {
      main: { id: 'main', label: 'Main Thread', state: 'new', holding: [], waiting: null, progress: 0, action: '' },
      detector: { id: 'detector', label: 'Detector', state: 'new', holding: [], waiting: null, progress: 0, action: '' },
      C0: { id: 'C0', label: 'Customer 0', state: 'new', holding: [], waiting: null, progress: 0, action: '' },
      C1: { id: 'C1', label: 'Customer 1', state: 'new', holding: [], waiting: null, progress: 0, action: '' },
    },
    resources: {
      R0: { id: 'R0', label: 'Cart_Lock', owner: null, queue: [], state: 'free' },
      R1: { id: 'R1', label: 'Payment_GW', owner: null, queue: [], state: 'free' },
      R2: { id: 'R2', label: 'Inventory_DB', owner: null, queue: [], state: 'free' },
    },
    edges: [],
    events: [],
    cpuQueue: [],
    kernelAction: '',
    detectionScan: null, // { visiting: string, stack: string[] } for DFS animation
    cycleFound: false,
    recoveryTarget: null,
    preventionMode: false,
  };
}

/* ─── Event creator ─── */
let eventCounter = 0;
function mkEvent(type, message) {
  eventCounter++;
  const now = new Date();
  const ts = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
  return { id: eventCounter, ts, type, message };
}

/* ─── Scenario phases (timed sequence) ─── */
// Each item: [delayMs, (state) => newState]
function buildScenario(prevention) {
  const steps = [];
  const d = (ms, fn) => steps.push([ms, fn]);

  // ── Phase 1: Process start ──
  d(400, (s) => {
    s.threads.main.state = 'running';
    s.threads.main.action = 'main() starts';
    s.kernelAction = 'OS: Process created → main() executing';
    s.events.push(mkEvent('os', 'OS: fork() + exec() → process created, main() executing'));
    s.cpuQueue = ['main'];
  });

  d(800, (s) => {
    s.threads.main.action = 'init_resources()';
    s.kernelAction = 'pthread_mutex_init() × 3 → kernel creates futex objects';
    s.resources.R0.state = 'initialized';
    s.resources.R1.state = 'initialized';
    s.resources.R2.state = 'initialized';
    s.events.push(mkEvent('mutex', 'Mutex initialized: Cart_Lock, Payment_GW, Inventory_DB'));
  });

  // ── Phase 2: Thread creation ──
  d(700, (s) => {
    s.threads.detector.state = 'ready';
    s.threads.detector.action = 'spawned → READY queue';
    s.kernelAction = 'pthread_create(detector) → new kernel thread + 8MB stack';
    s.events.push(mkEvent('thread', 'OS: pthread_create() → Detector thread → READY queue'));
    s.cpuQueue = ['main', 'detector'];
  });

  d(600, (s) => {
    s.threads.C0.state = 'ready';
    s.threads.C0.action = 'spawned → READY queue';
    s.kernelAction = 'pthread_create(C0) → Customer 0 thread created';
    s.events.push(mkEvent('thread', 'OS: pthread_create() → Customer 0 → READY queue'));
    s.cpuQueue = ['main', 'detector', 'C0'];
  });

  d(600, (s) => {
    s.threads.C1.state = 'ready';
    s.threads.C1.action = 'spawned → READY queue';
    s.kernelAction = 'pthread_create(C1) → Customer 1 thread created';
    s.events.push(mkEvent('thread', 'OS: pthread_create() → Customer 1 → READY queue'));
    s.cpuQueue = ['main', 'detector', 'C0', 'C1'];
  });

  d(500, (s) => {
    s.threads.main.state = 'waiting';
    s.threads.main.action = 'pthread_join() — waiting for threads';
    s.threads.detector.state = 'sleeping';
    s.threads.detector.action = 'sleep(2) — periodic scan';
    s.kernelAction = 'OS: main → WAITING (join), detector → SLEEPING (timer: 2s)';
    s.events.push(mkEvent('os', 'Main thread blocked on pthread_join(), Detector sleeping for 2s'));
    s.cpuQueue = ['C0', 'C1'];
  });

  // ── Phase 3: Resource acquisition ──
  if (prevention) {
    // Prevention mode: both acquire in order R0 → R1 → R2
    d(800, (s) => {
      s.threads.C0.state = 'running';
      s.threads.C0.action = 'trylock(R0) — enforced ordering';
      s.kernelAction = 'PREVENTION: C0 acquires R0 (lowest ID first)';
      s.resources.R0.owner = 'C0';
      s.resources.R0.state = 'locked';
      s.threads.C0.holding = ['R0'];
      s.edges.push({ from: 'R0', to: 'C0', type: 'holds', cycle: false });
      s.events.push(mkEvent('lock', '🛡 Prevention: C0 locks R0 (Cart_Lock) — ordered acquisition'));
    });

    d(700, (s) => {
      s.threads.C1.state = 'running';
      s.threads.C0.state = 'sleeping';
      s.threads.C0.action = 'sleep(1)';
      s.threads.C1.action = 'trylock(R0) — R0 held → WAIT';
      s.kernelAction = 'PREVENTION: C1 must also start from R0 (ordering enforced)';
      s.threads.C1.state = 'blocked';
      s.threads.C1.waiting = 'R0';
      s.resources.R0.queue = ['C1'];
      s.edges.push({ from: 'C1', to: 'R0', type: 'waits', cycle: false });
      s.events.push(mkEvent('block', '🛡 Prevention: C1 waits for R0 (same ordering) — NO circular wait possible'));
    });

    d(1000, (s) => {
      s.threads.C0.state = 'running';
      s.threads.C0.action = 'trylock(R1) — next in order';
      s.kernelAction = 'C0 acquires R1 (next in global order)';
      s.resources.R1.owner = 'C0';
      s.resources.R1.state = 'locked';
      s.threads.C0.holding = ['R0', 'R1'];
      s.edges.push({ from: 'R1', to: 'C0', type: 'holds', cycle: false });
      s.events.push(mkEvent('lock', '🛡 C0 locks R1 (Payment_GW) — still following global order'));
    });

    d(900, (s) => {
      s.threads.C0.action = 'order complete → releasing';
      s.kernelAction = 'C0 finished → unlock(R0), unlock(R1) → OS wakes C1';
      s.resources.R0.owner = null; s.resources.R0.state = 'free'; s.resources.R0.queue = [];
      s.resources.R1.owner = null; s.resources.R1.state = 'free';
      s.threads.C0.holding = [];
      s.threads.C0.state = 'terminated';
      s.threads.C0.action = 'finished ✓';
      s.threads.C1.state = 'running';
      s.threads.C1.waiting = null;
      s.threads.C1.action = 'woke up → lock(R0)';
      s.resources.R0.owner = 'C1'; s.resources.R0.state = 'locked';
      s.threads.C1.holding = ['R0'];
      s.edges = [{ from: 'R0', to: 'C1', type: 'holds', cycle: false }];
      s.events.push(mkEvent('unlock', '✓ C0 releases R0, R1 → finished'));
      s.events.push(mkEvent('os', 'OS: wakes C1 from R0 wait queue → RUNNING'));
    });

    d(800, (s) => {
      s.threads.C1.action = 'lock(R1) → success';
      s.resources.R1.owner = 'C1'; s.resources.R1.state = 'locked';
      s.threads.C1.holding = ['R0', 'R1'];
      s.edges = [
        { from: 'R0', to: 'C1', type: 'holds', cycle: false },
        { from: 'R1', to: 'C1', type: 'holds', cycle: false },
      ];
      s.kernelAction = 'C1 acquires R1 — global order maintained';
      s.events.push(mkEvent('lock', '🛡 C1 locks R1 (Payment_GW) — ordered, no deadlock'));
    });

    d(800, (s) => {
      s.threads.C1.state = 'terminated';
      s.threads.C1.action = 'finished ✓';
      s.threads.C1.holding = [];
      s.resources.R0.owner = null; s.resources.R0.state = 'free';
      s.resources.R1.owner = null; s.resources.R1.state = 'free';
      s.edges = [];
      s.kernelAction = 'All customer threads completed — no deadlock occurred!';
      s.events.push(mkEvent('unlock', '✓ C1 releases all resources → finished'));
      s.events.push(mkEvent('success', '🛡 PREVENTION SUCCESS: No deadlock — resource ordering works!'));
    });

    d(600, (s) => {
      s.threads.main.state = 'terminated';
      s.threads.main.action = 'exit(0)';
      s.threads.detector.state = 'terminated';
      s.threads.detector.action = 'terminated';
      s.kernelAction = 'OS: all threads exit → process terminated (exit code 0)';
      s.events.push(mkEvent('os', 'OS: Process terminated — all resources reclaimed'));
      s.cpuQueue = [];
    });

  } else {
    // Normal mode → deadlock
    d(800, (s) => {
      s.threads.C0.state = 'running';
      s.threads.C0.action = 'trylock(R0)';
      s.kernelAction = 'OS scheduler picks C0 → pthread_mutex_trylock(R0) = SUCCESS';
      s.resources.R0.owner = 'C0';
      s.resources.R0.state = 'locked';
      s.threads.C0.holding = ['R0'];
      s.edges.push({ from: 'R0', to: 'C0', type: 'holds', cycle: false });
      s.events.push(mkEvent('lock', 'C0 acquires R0 (Cart_Lock) — mutex locked'));
    });

    d(600, (s) => {
      s.threads.C1.state = 'running';
      s.threads.C0.state = 'ready';
      s.kernelAction = 'OS context-switch: C0 → C1 (time-slice expired)';
      s.events.push(mkEvent('os', 'OS: Context switch → C1 gets CPU'));
      s.cpuQueue = ['C1', 'C0'];
    });

    d(700, (s) => {
      s.threads.C1.action = 'trylock(R1)';
      s.kernelAction = 'C1: pthread_mutex_trylock(R1) = SUCCESS';
      s.resources.R1.owner = 'C1';
      s.resources.R1.state = 'locked';
      s.threads.C1.holding = ['R1'];
      s.edges.push({ from: 'R1', to: 'C1', type: 'holds', cycle: false });
      s.events.push(mkEvent('lock', 'C1 acquires R1 (Payment_GW) — mutex locked'));
    });

    d(900, (s) => {
      s.threads.C0.state = 'sleeping';
      s.threads.C0.action = 'sleep(1) — CPU yield';
      s.threads.C1.state = 'sleeping';
      s.threads.C1.action = 'sleep(1) — CPU yield';
      s.kernelAction = 'Both threads call sleep(1) → OS: RUNNING → SLEEPING, set timer interrupt';
      s.events.push(mkEvent('os', 'OS: C0, C1 → SLEEPING (timer: 1s), CPU idle'));
      s.cpuQueue = [];
    });

    d(1200, (s) => {
      s.threads.C0.state = 'running';
      s.threads.C0.action = 'woke up → trylock(R1)';
      s.kernelAction = 'Timer interrupt → OS wakes C0 → tries R1 (held by C1!)';
      s.events.push(mkEvent('os', 'OS: Timer interrupt → C0 wakes → READY → RUNNING'));
    });

    d(800, (s) => {
      s.threads.C0.state = 'blocked';
      s.threads.C0.action = 'BLOCKED on R1';
      s.threads.C0.waiting = 'R1';
      s.resources.R1.queue = ['C0'];
      s.edges.push({ from: 'C0', to: 'R1', type: 'waits', cycle: false });
      s.kernelAction = '⚠ pthread_mutex_lock(R1) → R1 held by C1 → OS BLOCKS C0!';
      s.events.push(mkEvent('block', '⚠ C0 BLOCKED — waiting for R1 (held by C1)'));
      s.events.push(mkEvent('os', 'OS: C0 → BLOCKED, added to R1 kernel wait queue'));
    });

    d(700, (s) => {
      s.threads.C1.state = 'running';
      s.threads.C1.action = 'woke up → trylock(R0)';
      s.kernelAction = 'Timer interrupt → OS wakes C1 → tries R0 (held by C0!)';
      s.events.push(mkEvent('os', 'OS: Timer interrupt → C1 wakes → READY → RUNNING'));
      s.cpuQueue = ['C1'];
    });

    d(800, (s) => {
      s.threads.C1.state = 'blocked';
      s.threads.C1.action = 'BLOCKED on R0';
      s.threads.C1.waiting = 'R0';
      s.resources.R0.queue = ['C1'];
      s.edges.push({ from: 'C1', to: 'R0', type: 'waits', cycle: false });
      s.kernelAction = '⚠ pthread_mutex_lock(R0) → R0 held by C0 → OS BLOCKS C1!';
      s.events.push(mkEvent('block', '⚠ C1 BLOCKED — waiting for R0 (held by C0)'));
      s.cpuQueue = [];
    });

    // ── DEADLOCK ──
    d(600, (s) => {
      s.threads.C0.state = 'deadlocked';
      s.threads.C1.state = 'deadlocked';
      s.edges = s.edges.map((e) => ({ ...e, cycle: true }));
      s.cycleFound = true;
      s.kernelAction = '💀 DEADLOCK! C0→R1→C1→R0→C0 — circular wait in kernel!';
      s.events.push(mkEvent('deadlock', '💀 DEADLOCK: C0 holds R0, waits R1 | C1 holds R1, waits R0'));
      s.events.push(mkEvent('deadlock', 'Both threads PERMANENTLY blocked in OS kernel wait queue'));
    });

    // ── Detection thread wakes ──
    d(1500, (s) => {
      s.threads.detector.state = 'running';
      s.threads.detector.action = 'DFS scan starting...';
      s.kernelAction = 'Timer interrupt → Detector wakes → starts DFS on wait_for[][]';
      s.events.push(mkEvent('detect', '🔍 Detector thread wakes — sleep(2) expired'));
      s.cpuQueue = ['detector'];
    });

    d(700, (s) => {
      s.detectionScan = { visiting: 'C0', stack: ['C0'] };
      s.threads.detector.action = 'DFS: visiting C0...';
      s.kernelAction = 'DFS: visit(C0) → recursion_stack = [C0]';
      s.events.push(mkEvent('detect', 'DFS: visit C0 → wait_for[0][1]=1 → follow edge to C1'));
    });

    d(700, (s) => {
      s.detectionScan = { visiting: 'C1', stack: ['C0', 'C1'] };
      s.threads.detector.action = 'DFS: visiting C1...';
      s.kernelAction = 'DFS: visit(C1) → recursion_stack = [C0, C1]';
      s.events.push(mkEvent('detect', 'DFS: visit C1 → wait_for[1][0]=1 → follow edge to C0'));
    });

    d(800, (s) => {
      s.detectionScan = { visiting: 'C0', stack: ['C0', 'C1', 'C0'] };
      s.threads.detector.action = '🔥 CYCLE FOUND!';
      s.kernelAction = '🔥 DFS: C0 already in recursion stack → BACK EDGE → CYCLE CONFIRMED!';
      s.events.push(mkEvent('deadlock', '🔥 DFS: C0 in recursion_stack → CYCLE DETECTED! Deadlock confirmed!'));
    });

    // ── Recovery ──
    d(1000, (s) => {
      s.detectionScan = null;
      s.recoveryTarget = 'C0';
      s.threads.detector.action = 'recover_deadlock(victim=C0)';
      s.kernelAction = 'Recovery: select victim=C0 (lowest ID) → force-unlock R0';
      s.events.push(mkEvent('recovery', '🛠 Recovery: preempt C0 (victim) → force-unlock R0 mutex'));
    });

    d(800, (s) => {
      s.resources.R0.owner = null;
      s.resources.R0.state = 'free';
      s.resources.R0.queue = [];
      s.threads.C0.state = 'terminated';
      s.threads.C0.action = 'killed (victim)';
      s.threads.C0.holding = [];
      s.threads.C0.waiting = null;
      s.kernelAction = 'pthread_mutex_unlock(R0) → OS wakes C1 from R0 wait queue';
      s.events.push(mkEvent('recovery', 'OS: R0 unlocked → wake C1 from kernel wait queue (BLOCKED → READY)'));
    });

    d(700, (s) => {
      s.threads.C1.state = 'running';
      s.threads.C1.action = 'woke up! lock(R0) returns';
      s.threads.C1.waiting = null;
      s.resources.R0.owner = 'C1';
      s.resources.R0.state = 'locked';
      s.threads.C1.holding = ['R1', 'R0'];
      s.cycleFound = false;
      s.recoveryTarget = null;
      s.edges = [
        { from: 'R0', to: 'C1', type: 'holds', cycle: false },
        { from: 'R1', to: 'C1', type: 'holds', cycle: false },
      ];
      s.kernelAction = '✅ C1 acquires R0 — deadlock broken! C1 holds both resources';
      s.events.push(mkEvent('os', '✅ C1 wakes → pthread_mutex_lock(R0) returns → C1 owns R0+R1'));
      s.cpuQueue = ['C1', 'detector'];
    });

    d(900, (s) => {
      s.threads.C1.state = 'running';
      s.threads.C1.action = 'order complete → releasing';
      s.kernelAction = 'C1 finishes order → release_resources()';
      s.events.push(mkEvent('unlock', 'C1 releases R0 (Cart_Lock) and R1 (Payment_GW)'));
      s.resources.R0.owner = null; s.resources.R0.state = 'free';
      s.resources.R1.owner = null; s.resources.R1.state = 'free';
      s.threads.C1.holding = [];
      s.edges = [];
    });

    d(700, (s) => {
      s.threads.C1.state = 'terminated';
      s.threads.C1.action = 'finished ✓';
      s.threads.detector.state = 'sleeping';
      s.threads.detector.action = 'sleep(2)';
      s.kernelAction = 'C1 terminates → pthread_join() unblocks main thread';
      s.events.push(mkEvent('thread', 'C1 finished — thread exits'));
      s.cpuQueue = ['main'];
    });

    d(600, (s) => {
      s.threads.main.state = 'running';
      s.threads.main.action = 'join() returns → exit(0)';
      s.threads.detector.state = 'terminated';
      s.threads.detector.action = 'terminated';
      s.kernelAction = 'main() returns 0 → OS destroys process, reclaims all resources';
      s.events.push(mkEvent('os', 'OS: All threads terminated → process exit(0) → resources reclaimed'));
      s.cpuQueue = [];
    });

    d(500, (s) => {
      s.threads.main.state = 'terminated';
      s.threads.main.action = 'exit(0)';
    });
  }

  return steps;
}

/* ═══════════════════ SVG WAIT-FOR GRAPH ═══════════════════ */
function LiveGraph({ threads, resources, edges, detectionScan, cycleFound }) {
  const positions = {
    C0: { x: 100, y: 60 },
    C1: { x: 300, y: 60 },
    R0: { x: 100, y: 180 },
    R1: { x: 300, y: 180 },
    R2: { x: 200, y: 240 },
  };

  return (
    <svg viewBox="0 0 400 280" className="w-full h-auto">
      <defs>
        <marker id="rt-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
        <marker id="rt-arrow-green" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
        <marker id="rt-arrow-red" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
        </marker>
        <filter id="rt-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="rt-scan-glow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      <AnimatePresence>
        {edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          const isCycle = e.cycle;
          const isHold = e.type === 'holds';
          return (
            <motion.line
              key={`e-${e.from}-${e.to}-${e.type}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isCycle ? '#ef4444' : isHold ? '#10b981' : '#6b7280'}
              strokeWidth={isCycle ? 3 : 2}
              strokeDasharray={e.type === 'waits' ? '6 3' : 'none'}
              markerEnd={isCycle ? 'url(#rt-arrow-red)' : isHold ? 'url(#rt-arrow-green)' : 'url(#rt-arrow)'}
              filter={isCycle ? 'url(#rt-glow)' : 'none'}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          );
        })}
      </AnimatePresence>

      {/* Customer nodes */}
      {['C0', 'C1'].map((cid) => {
        const t = threads[cid];
        const pos = positions[cid];
        if (!t || !pos) return null;
        const sc = THREAD_STATES[t.state] || THREAD_STATES.ready;
        const isDeadlocked = t.state === 'deadlocked';
        const isScanning = detectionScan && detectionScan.visiting === cid;
        const fill = isDeadlocked ? 'rgba(239,68,68,0.3)' : t.state === 'terminated' ? 'rgba(75,85,99,0.2)' : 'rgba(59,130,246,0.2)';
        const stroke = isDeadlocked ? '#ef4444' : isScanning ? '#a855f7' : t.state === 'terminated' ? '#6b7280' : '#3b82f6';
        return (
          <g key={cid}>
            <motion.circle
              cx={pos.x} cy={pos.y} r={25}
              fill={fill} stroke={stroke}
              strokeWidth={isDeadlocked ? 3.5 : isScanning ? 3 : 2}
              filter={isDeadlocked || isScanning ? 'url(#rt-glow)' : 'none'}
              animate={{ r: isDeadlocked ? [25, 28, 25] : 25 }}
              transition={isDeadlocked ? { repeat: Infinity, duration: 0.8 } : {}}
            />
            {isScanning && (
              <motion.circle
                cx={pos.x} cy={pos.y} r={30}
                fill="none" stroke="#a855f7" strokeWidth={2}
                filter="url(#rt-scan-glow)"
                initial={{ r: 25, opacity: 1 }}
                animate={{ r: 40, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
            <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#e5e7eb" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              {cid}
            </text>
            <text x={pos.x} y={pos.y + 42} textAnchor="middle" fill={stroke} fontSize="8" fontWeight="600">
              {sc.label}
            </text>
          </g>
        );
      })}

      {/* Resource nodes */}
      {['R0', 'R1', 'R2'].map((rid) => {
        const r = resources[rid];
        const pos = positions[rid];
        if (!r || !pos) return null;
        const isHeld = r.owner !== null;
        return (
          <g key={rid}>
            <motion.rect
              x={pos.x - 25} y={pos.y - 22} width={50} height={44} rx={8}
              fill={isHeld ? 'rgba(245,158,11,0.2)' : r.state === 'initialized' ? 'rgba(99,102,241,0.2)' : 'rgba(55,65,81,0.3)'}
              stroke={isHeld ? '#f59e0b' : r.state === 'initialized' ? '#6366f1' : '#4b5563'}
              strokeWidth={isHeld ? 2.5 : 1.5}
              animate={{ opacity: r.state === 'free' && !isHeld ? 0.6 : 1 }}
            />
            <text x={pos.x} y={pos.y - 2} textAnchor="middle" fill="#e5e7eb" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              {rid}
            </text>
            <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill="#9ca3af" fontSize="7">
              {r.label}
            </text>
            {isHeld && (
              <text x={pos.x} y={pos.y + 34} textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">
                🔒 {r.owner}
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(10, 268)">
        <line x1="0" y1="0" x2="16" y2="0" stroke="#10b981" strokeWidth="2" />
        <text x="20" y="3" fill="#9ca3af" fontSize="7">Holds</text>
        <line x1="65" y1="0" x2="81" y2="0" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 2" />
        <text x="85" y="3" fill="#9ca3af" fontSize="7">Waits</text>
        <line x1="125" y1="0" x2="141" y2="0" stroke="#ef4444" strokeWidth="3" />
        <text x="145" y="3" fill="#9ca3af" fontSize="7">Cycle</text>
      </g>
    </svg>
  );
}

/* ═══════════════════ LIVE EVENT LOG ═══════════════════ */
const EVENT_STYLES = {
  os: { bg: 'bg-blue-500/5', border: 'border-blue-500/30', badge: 'bg-blue-500/15 text-blue-400', icon: '⚙' },
  thread: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/30', badge: 'bg-indigo-500/15 text-indigo-400', icon: '🧵' },
  mutex: { bg: 'bg-purple-500/5', border: 'border-purple-500/30', badge: 'bg-purple-500/15 text-purple-400', icon: '🔧' },
  lock: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/30', badge: 'bg-emerald-500/15 text-emerald-400', icon: '🔒' },
  unlock: { bg: 'bg-teal-500/5', border: 'border-teal-500/30', badge: 'bg-teal-500/15 text-teal-400', icon: '🔓' },
  block: { bg: 'bg-amber-500/5', border: 'border-amber-500/30', badge: 'bg-amber-500/15 text-amber-400', icon: '⏸' },
  deadlock: { bg: 'bg-red-500/5', border: 'border-red-500/30', badge: 'bg-red-500/15 text-red-400', icon: '💀' },
  detect: { bg: 'bg-violet-500/5', border: 'border-violet-500/30', badge: 'bg-violet-500/15 text-violet-400', icon: '🔍' },
  recovery: { bg: 'bg-orange-500/5', border: 'border-orange-500/30', badge: 'bg-orange-500/15 text-orange-400', icon: '🛠' },
  success: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/30', badge: 'bg-emerald-500/15 text-emerald-400', icon: '✅' },
};

function LiveEventLog({ events }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [events.length]);

  return (
    <div ref={scrollRef} className="overflow-y-auto space-y-1 pr-1 custom-scrollbar" style={{ maxHeight: 320 }}>
      <AnimatePresence initial={false}>
        {events.slice().reverse().map((ev) => {
          const style = EVENT_STYLES[ev.type] || EVENT_STYLES.os;
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-2 py-2 px-3 rounded-lg border-l-2 ${style.bg} ${style.border}`}
            >
              <span className="text-sm mt-0.5 flex-shrink-0">{style.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
                    {ev.type}
                  </span>
                  <span className="text-[9px] text-surface-500 font-mono tabular-nums">{ev.ts}</span>
                </div>
                <p className="text-[11px] text-surface-300 font-mono leading-relaxed">{ev.message}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ THREAD STATE BOX ═══════════════════ */
function ThreadStateBox({ thread, isRecoveryTarget }) {
  const sc = THREAD_STATES[thread.state] || THREAD_STATES.new;
  return (
    <motion.div
      layout
      className={`rounded-xl border-2 p-2.5 transition-all duration-300 ${
        isRecoveryTarget
          ? 'bg-orange-500/15 border-orange-500/50 ring-2 ring-orange-500/30'
          : thread.state === 'deadlocked'
          ? 'bg-red-500/10 border-red-500/40 ring-2 ring-red-500/30'
          : thread.state === 'running'
          ? 'bg-emerald-500/10 border-emerald-500/40'
          : thread.state === 'blocked'
          ? 'bg-rose-500/10 border-rose-500/40'
          : 'bg-surface-800/40 border-surface-600/30'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold text-white">{thread.label}</span>
        <span className="relative flex h-2.5 w-2.5">
          {(thread.state === 'running' || thread.state === 'deadlocked') && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sc.color} opacity-75`} />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sc.color}`} />
        </span>
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider ${sc.text}`}>{sc.label}</div>
      {thread.action && (
        <div className="text-[9px] text-surface-400 mt-1 font-mono truncate" title={thread.action}>
          {thread.action}
        </div>
      )}
      {thread.holding.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {thread.holding.map((r) => (
            <span key={r} className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono">🔒{r}</span>
          ))}
        </div>
      )}
      {thread.waiting && (
        <div className="mt-1">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono">⏳ {thread.waiting}</span>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function OSRealtimeSimulation() {
  const [state, setState] = useState(createInitialState);
  const [prevention, setPrevention] = useState(false);
  const stepIndex = useRef(0);
  const timerRef = useRef(null);
  const scenarioRef = useRef([]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const runNextStep = useCallback(() => {
    const scenario = scenarioRef.current;
    const idx = stepIndex.current;

    if (idx >= scenario.length) {
      setState((s) => ({ ...s, phase: 'done' }));
      return;
    }

    const [delay, fn] = scenario[idx];
    timerRef.current = setTimeout(() => {
      setState((s) => {
        const next = JSON.parse(JSON.stringify(s));
        next.tick = idx + 1;
        fn(next);
        return next;
      });
      stepIndex.current = idx + 1;
      runNextStep();
    }, delay);
  }, []);

  const handleStart = useCallback(() => {
    eventCounter = 0;
    const initial = createInitialState();
    initial.phase = 'running';
    initial.preventionMode = prevention;
    setState(initial);
    scenarioRef.current = buildScenario(prevention);
    stepIndex.current = 0;
    clearTimers();
    // Start after a small delay
    timerRef.current = setTimeout(() => runNextStep(), 300);
  }, [prevention, clearTimers, runNextStep]);

  const handleStop = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, phase: 'paused' }));
  }, [clearTimers]);

  const handleReset = useCallback(() => {
    clearTimers();
    setState(createInitialState());
    stepIndex.current = 0;
  }, [clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const isRunning = state.phase === 'running';
  const isDone = state.phase === 'done';
  const isIdle = state.phase === 'idle';
  const threadList = Object.values(state.threads);

  return (
    <GlassCard className="p-6" glow={state.cycleFound ? 'danger' : ''}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span className="text-rose-400">⚡</span> Real-Time OS Execution
          </h2>
          <p className="text-xs text-surface-400 mt-0.5">
            Watch the OS execute threads, acquire mutexes, and {prevention ? 'prevent' : 'encounter'} deadlocks in real-time
          </p>
        </div>
        {state.kernelAction && (
          <motion.div
            key={state.kernelAction}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border max-w-xs text-right ${
              state.cycleFound
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : state.recoveryTarget
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            {state.kernelAction}
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25 transition-all"
          >
            <Play size={13} />
            {isDone || state.phase === 'paused' ? 'Restart' : 'Start Simulation'}
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/40 hover:bg-rose-500/25 transition-all"
          >
            <Square size={13} />
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-surface-700/40 text-surface-300 border border-surface-600/30 hover:bg-surface-600/40 hover:text-white transition-all"
        >
          <RotateCcw size={13} />
          Reset
        </button>

        <div className="w-px h-6 bg-surface-700/40 mx-1" />

        {/* Prevention toggle */}
        <button
          onClick={() => { if (isIdle) setPrevention((p) => !p); }}
          disabled={!isIdle}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
            prevention
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              : 'bg-surface-700/40 text-surface-400 border-surface-600/30'
          } ${isIdle ? 'cursor-pointer hover:bg-surface-600/40' : 'opacity-50 cursor-not-allowed'}`}
        >
          <Shield size={13} />
          Prevention: {prevention ? 'ON' : 'OFF'}
        </button>

        {isDone && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              prevention
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : 'text-surface-300 bg-surface-700/40 border-surface-600/30'
            }`}
          >
            {prevention ? '✅ No Deadlock — Prevention Worked!' : '✅ Simulation Complete'}
          </motion.span>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Thread states */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
            OS Thread Table
          </div>
          {threadList.map((t) => (
            <ThreadStateBox key={t.id} thread={t} isRecoveryTarget={state.recoveryTarget === t.id} />
          ))}

          {/* CPU Ready Queue */}
          <div className="mt-3 p-3 rounded-xl bg-surface-900/40 border border-surface-700/30">
            <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-1.5">CPU Ready Queue</div>
            <div className="flex flex-wrap gap-1">
              {state.cpuQueue.length === 0 ? (
                <span className="text-[9px] text-surface-500 italic">empty</span>
              ) : (
                state.cpuQueue.map((id, i) => (
                  <span key={id} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    i === 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-surface-700/50 text-surface-400'
                  }`}>
                    {i === 0 ? '▶' : ''} {id}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* State Legend */}
          <div className="p-3 rounded-xl bg-surface-900/40 border border-surface-700/30">
            <div className="text-[9px] font-bold text-surface-400 uppercase tracking-wider mb-1.5">States</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(THREAD_STATES).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${val.color}`} />
                  <span className={`text-[8px] ${val.text}`}>{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Resource Allocation Graph */}
        <div className="lg:col-span-4">
          <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
            Resource Allocation Graph (Live)
          </div>
          <div className={`rounded-xl border p-3 transition-all duration-500 ${
            state.cycleFound
              ? 'bg-red-500/5 border-red-500/30'
              : state.preventionMode && state.phase !== 'idle'
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-surface-900/50 border-surface-700/30'
          }`}>
            <LiveGraph
              threads={state.threads}
              resources={state.resources}
              edges={state.edges}
              detectionScan={state.detectionScan}
              cycleFound={state.cycleFound}
            />
            {state.cycleFound && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-2"
              >
                <span className="text-xs font-bold text-red-400 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                  💀 CIRCULAR WAIT DETECTED
                </span>
              </motion.div>
            )}
            {state.detectionScan && !state.cycleFound && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-2">
                <span className="text-xs font-bold text-violet-400 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 animate-pulse">
                  🔍 DFS Scanning: {state.detectionScan.stack.join(' → ')}
                </span>
              </motion.div>
            )}
            {state.preventionMode && state.phase !== 'idle' && !state.cycleFound && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-2">
                <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  🛡 Resource Ordering Enforced — No Cycle Possible
                </span>
              </motion.div>
            )}
          </div>

          {/* Resource Mutex State */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {Object.values(state.resources).map((r) => (
              <div
                key={r.id}
                className={`rounded-lg border p-2 text-center transition-all duration-300 ${
                  r.owner
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : r.state === 'initialized'
                    ? 'bg-indigo-500/10 border-indigo-500/30'
                    : 'bg-surface-800/30 border-surface-700/20'
                }`}
              >
                <div className="text-[10px] font-bold text-white">{r.id}</div>
                <div className="text-[8px] text-surface-400">{r.label}</div>
                <div className={`text-[9px] font-bold mt-1 ${r.owner ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {r.owner ? `🔒 ${r.owner}` : '🔓 Free'}
                </div>
                {r.queue.length > 0 && (
                  <div className="text-[8px] text-rose-400 mt-0.5 font-mono">
                    Queue: [{r.queue.join(',')}]
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Event Log */}
        <div className="lg:col-span-5">
          <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
            Real-Time Kernel Event Log
          </div>
          <div className="rounded-xl border border-surface-700/30 bg-surface-900/40 p-3" style={{ maxHeight: 500 }}>
            {state.events.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-surface-500 text-xs">
                Press "Start Simulation" to begin
              </div>
            ) : (
              <LiveEventLog events={state.events} />
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
