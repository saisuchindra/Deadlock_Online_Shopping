import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward,
} from 'lucide-react';

/* ───────────── SIMULATION STEPS ───────────── */
const STEPS = [
  {
    id: 0,
    title: 'Program Start — OS Creates Process',
    osAction: 'fork() + exec() → kernel creates process with PCB',
    description:
      'The user runs the compiled binary. The OS creates a new process, allocates a Process Control Block (PCB), and maps the executable into virtual memory (Text, Data, BSS, Heap, Stack segments). Execution begins at main().',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'running', holding: [], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: null, queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: null, queue: [] },
    ],
    arrows: [],
    highlight: 'main',
    codeSnippet: `int main() {\n    init_resources();  // ← OS: Process running main()\n    ...\n}`,
  },
  {
    id: 1,
    title: 'init_resources() — Initialize Mutexes',
    osAction: 'pthread_mutex_init() × N → kernel creates futex objects',
    description:
      'main() calls init_resources(). The OS kernel allocates futex (fast userspace mutex) objects for each resource. These are kernel-level synchronization primitives that threads will compete for.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'running', holding: [], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: null, queue: [], justCreated: true },
      { id: 'R1', label: 'Payment_GW', owner: null, queue: [], justCreated: true },
    ],
    arrows: [],
    highlight: 'resources',
    codeSnippet: `void init_resources() {\n    for(int i = 0; i < NUM_RESOURCES; i++) {\n        pthread_mutex_init(&resource_locks[i], NULL);\n        //  ↑ OS: kernel creates futex object\n    }\n}`,
  },
  {
    id: 2,
    title: 'pthread_create() — Spawn Detection Thread',
    osAction: 'OS allocates kernel thread + stack for detector',
    description:
      'main() calls pthread_create() for the detection thread. The OS allocates a new kernel-level thread with its own stack (typically 8MB). The scheduler adds it to the READY queue. It starts running detection_thread() in the background.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'running', holding: [], waiting: null },
      { id: 'detector', label: 'Detector Thread', state: 'ready', holding: [], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: null, queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: null, queue: [] },
    ],
    arrows: [],
    highlight: 'detector',
    codeSnippet: `pthread_t detector;\npthread_create(&detector, NULL,\n               detection_thread, NULL);\n// OS: new kernel thread created → READY queue`,
  },
  {
    id: 3,
    title: 'pthread_create() × 2 — Spawn Customer Threads',
    osAction: 'OS creates 2 more kernel threads for Customer 0 & 1',
    description:
      'run_prevention() calls pthread_create() for each customer. The OS creates two more kernel threads. Each runs process_order() with its customer ID. All threads are now managed by the OS scheduler.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'sleeping', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'ready', holding: [], waiting: null },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'ready', holding: [], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: null, queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: null, queue: [] },
    ],
    arrows: [],
    highlight: 'customers',
    codeSnippet: `void run_prevention() {\n    for(int i=0; i<NUM_CUSTOMERS; i++) {\n        pthread_create(&threads[i], NULL,\n                       process_order, &ids[i]);\n        // OS: thread i → READY queue\n    }\n    // main thread now calls pthread_join()\n}`,
  },
  {
    id: 4,
    title: 'Customer 0 — Acquires R0 (Cart_Lock)',
    osAction: 'pthread_mutex_trylock(R0) → success! OS grants lock',
    description:
      'The OS scheduler picks Customer 0. Being an even customer, it first tries to lock R0 (Cart_Lock). Since R0 is free, pthread_mutex_trylock() succeeds immediately. The OS marks the mutex as owned by C0.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'sleeping', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'running', holding: ['R0'], waiting: null },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'ready', holding: [], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: 'C0', queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: null, queue: [] },
    ],
    arrows: [{ from: 'R0', to: 'C0', type: 'holds', cycle: false }],
    highlight: 'C0',
    codeSnippet: `// Customer 0 (even):\nrequest1[0] = 1;  // Want R0\nrequest_resources(0, request1);\n// → pthread_mutex_trylock(R0) == 0  ✓ SUCCESS\n// → resource_owner[0] = 0;  // C0 owns R0`,
  },
  {
    id: 5,
    title: 'Customer 1 — Acquires R1 (Payment_GW)',
    osAction: 'pthread_mutex_trylock(R1) → success! OS grants lock',
    description:
      'OS context-switches to Customer 1. Being an odd customer, it first tries R1 (Payment_GW). R1 is free, so trylock succeeds. Now C0 holds R0 and C1 holds R1.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'sleeping', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'sleeping', holding: ['R0'], waiting: null },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'running', holding: ['R1'], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: 'C0', queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: 'C1', queue: [] },
    ],
    arrows: [
      { from: 'R0', to: 'C0', type: 'holds', cycle: false },
      { from: 'R1', to: 'C1', type: 'holds', cycle: false },
    ],
    highlight: 'C1',
    codeSnippet: `// Customer 1 (odd):\nrequest1[1] = 1;  // Want R1\nrequest_resources(1, request1);\n// → pthread_mutex_trylock(R1) == 0  ✓ SUCCESS\n// → resource_owner[1] = 1;  // C1 owns R1`,
  },
  {
    id: 6,
    title: 'Both Threads call sleep(1) — Voluntary CPU Yield',
    osAction: 'sleep() → OS moves both threads to SLEEPING state',
    description:
      'Both customers call sleep(1) after their first lock. The OS moves them from RUNNING to SLEEPING state and sets a timer interrupt. The CPU is free to run other threads (like the detector). After 1 second, the timer interrupt fires and the OS moves them back to READY.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'sleeping', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'sleeping', holding: ['R0'], waiting: null },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'sleeping', holding: ['R1'], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: 'C0', queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: 'C1', queue: [] },
    ],
    arrows: [
      { from: 'R0', to: 'C0', type: 'holds', cycle: false },
      { from: 'R1', to: 'C1', type: 'holds', cycle: false },
    ],
    highlight: 'sleep',
    codeSnippet: `// Both threads:\nsleep(1);\n// OS: thread → SLEEPING state\n// OS: set timer interrupt for 1 second\n// OS: context-switch to another READY thread\n// ... 1 second later ...\n// OS: timer interrupt → thread → READY queue`,
  },
  {
    id: 7,
    title: 'Customer 0 Tries R1 — BLOCKED!',
    osAction: 'pthread_mutex_lock(R1) → R1 held by C1 → OS BLOCKS C0',
    description:
      'sleep(1) expires. Customer 0 now tries to acquire R1 (Payment_GW). But R1 is held by Customer 1! pthread_mutex_trylock fails, so C0 falls through to pthread_mutex_lock() which is BLOCKING. The OS suspends C0 and puts it in R1\'s kernel wait queue.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'sleeping', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'blocked', holding: ['R0'], waiting: 'R1' },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'ready', holding: ['R1'], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: 'C0', queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: 'C1', queue: ['C0'] },
    ],
    arrows: [
      { from: 'R0', to: 'C0', type: 'holds', cycle: false },
      { from: 'R1', to: 'C1', type: 'holds', cycle: false },
      { from: 'C0', to: 'R1', type: 'waits', cycle: false },
    ],
    highlight: 'C0',
    codeSnippet: `// Customer 0 tries R1:\nif(pthread_mutex_trylock(&resource_locks[1]) == 0) {\n    // FAILS — R1 is held by C1\n} else {\n    wait_for[0][1] = 1;  // C0 waits for C1\n    pthread_mutex_lock(&resource_locks[1]);\n    // ⚠ OS: C0 → BLOCKED, added to R1's wait queue\n}`,
  },
  {
    id: 8,
    title: '⚠ Customer 1 Tries R0 — BLOCKED! → DEADLOCK!',
    osAction: 'pthread_mutex_lock(R0) → R0 held by C0 → OS BLOCKS C1 → CIRCULAR WAIT!',
    description:
      'Customer 1 now tries to acquire R0 (Cart_Lock). But R0 is held by Customer 0! The OS blocks C1 and adds it to R0\'s wait queue. NOW: C0 waits for R1 (held by C1), C1 waits for R0 (held by C0). This is a CIRCULAR WAIT — DEADLOCK! Both threads are permanently stuck in the kernel wait queue.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'sleeping', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'deadlocked', holding: ['R0'], waiting: 'R1' },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'deadlocked', holding: ['R1'], waiting: 'R0' },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: 'C0', queue: ['C1'] },
      { id: 'R1', label: 'Payment_GW', owner: 'C1', queue: ['C0'] },
    ],
    arrows: [
      { from: 'R0', to: 'C0', type: 'holds', cycle: true },
      { from: 'R1', to: 'C1', type: 'holds', cycle: true },
      { from: 'C0', to: 'R1', type: 'waits', cycle: true },
      { from: 'C1', to: 'R0', type: 'waits', cycle: true },
    ],
    highlight: 'deadlock',
    codeSnippet: `// Customer 1 tries R0:\nwait_for[1][0] = 1;  // C1 waits for C0\npthread_mutex_lock(&resource_locks[0]);\n// ⚠ OS: C1 → BLOCKED, added to R0's wait queue\n//\n// 💀 DEADLOCK: C0→R1→C1→R0→C0 (circular wait!)\n// Both threads PERMANENTLY stuck in kernel`,
  },
  {
    id: 9,
    title: '🔍 Detection Thread Wakes Up — sleep(2) Expires',
    osAction: 'Timer interrupt → OS wakes detector thread → READY → RUNNING',
    description:
      'The detection thread was sleeping for 2 seconds. The OS timer interrupt fires, moving the detector from SLEEPING to READY. The scheduler picks it up since C0 and C1 are both blocked. The detector starts running DFS cycle detection on the wait_for[][] matrix.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'running', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'deadlocked', holding: ['R0'], waiting: 'R1' },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'deadlocked', holding: ['R1'], waiting: 'R0' },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: 'C0', queue: ['C1'] },
      { id: 'R1', label: 'Payment_GW', owner: 'C1', queue: ['C0'] },
    ],
    arrows: [
      { from: 'R0', to: 'C0', type: 'holds', cycle: true },
      { from: 'R1', to: 'C1', type: 'holds', cycle: true },
      { from: 'C0', to: 'R1', type: 'waits', cycle: true },
      { from: 'C1', to: 'R0', type: 'waits', cycle: true },
    ],
    highlight: 'detector',
    codeSnippet: `void* detection_thread(void* arg) {\n    while(1) {\n        sleep(2);  // ← Timer interrupt wakes this thread\n        // Run DFS on wait_for[][] adjacency matrix\n        for(int i = 0; i < NUM_CUSTOMERS; i++) {\n            if(!visited[i] && dfs_cycle(i)) {\n                printf("🔥 Deadlock Detected!\\n");\n                recover_deadlock();\n            }\n        }\n    }\n}`,
  },
  {
    id: 10,
    title: '🔥 DFS Detects Cycle! → Deadlock Confirmed',
    osAction: 'DFS traversal: C0 → C1 → C0 (back edge = cycle found!)',
    description:
      'The detector runs DFS on the wait_for[][] matrix. Starting from C0: C0 waits for C1 (wait_for[0][1] = 1), C1 waits for C0 (wait_for[1][0] = 1). C0 is already in the recursion stack — BACK EDGE detected! This confirms a cycle = DEADLOCK.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'running', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'deadlocked', holding: ['R0'], waiting: 'R1' },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'deadlocked', holding: ['R1'], waiting: 'R0' },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: 'C0', queue: ['C1'] },
      { id: 'R1', label: 'Payment_GW', owner: 'C1', queue: ['C0'] },
    ],
    arrows: [
      { from: 'R0', to: 'C0', type: 'holds', cycle: true },
      { from: 'R1', to: 'C1', type: 'holds', cycle: true },
      { from: 'C0', to: 'R1', type: 'waits', cycle: true },
      { from: 'C1', to: 'R0', type: 'waits', cycle: true },
    ],
    highlight: 'cycle',
    codeSnippet: `int dfs_cycle(int node) {\n    visited[node] = 1;\n    recursion_stack[node] = 1;\n    for(int i = 0; i < NUM_CUSTOMERS; i++) {\n        if(wait_for[node][i]) {\n            if(recursion_stack[i])  // ← BACK EDGE!\n                return 1;  // CYCLE FOUND = DEADLOCK\n            if(!visited[i] && dfs_cycle(i))\n                return 1;\n        }\n    }\n    recursion_stack[node] = 0;\n    return 0;\n}`,
  },
  {
    id: 11,
    title: '🛠 Recovery — Force-Unlock Victim\'s Mutexes',
    osAction: 'pthread_mutex_unlock(R0) → OS wakes C1 from R0 wait queue',
    description:
      'The detector calls recover_deadlock() with victim = C0 (lowest ID). It force-unlocks all mutexes held by C0. When pthread_mutex_unlock(R0) is called, the OS kernel checks R0\'s wait queue, finds C1 waiting there, and wakes C1 up (BLOCKED → READY). The circular wait is broken!',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'running', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'terminated', holding: [], waiting: null },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'ready', holding: ['R1'], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: null, queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: 'C1', queue: [] },
    ],
    arrows: [
      { from: 'R1', to: 'C1', type: 'holds', cycle: false },
    ],
    highlight: 'recovery',
    codeSnippet: `void recover_deadlock() {\n    int victim = 0;  // Kill C0 (lowest ID)\n    for(int i = 0; i < NUM_RESOURCES; i++) {\n        if(resource_owner[i] == victim) {\n            pthread_mutex_unlock(&resource_locks[i]);\n            // ↑ OS: wake ALL threads in this mutex's\n            //   wait queue → BLOCKED → READY\n            resource_owner[i] = -1;\n        }\n    }\n    // Circular wait is BROKEN!\n}`,
  },
  {
    id: 12,
    title: '✅ Customer 1 Resumes — Acquires R0',
    osAction: 'OS scheduler runs C1 → pthread_mutex_lock(R0) returns → C1 gets R0',
    description:
      'The OS woke C1 from the wait queue. C1\'s blocked pthread_mutex_lock(R0) call finally returns. C1 now holds both R0 and R1, completes its order, and releases both resources. The system is fully recovered.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'waiting', holding: [], waiting: 'join' },
      { id: 'detector', label: 'Detector Thread', state: 'sleeping', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'terminated', holding: [], waiting: null },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'running', holding: ['R0', 'R1'], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: 'C1', queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: 'C1', queue: [] },
    ],
    arrows: [
      { from: 'R0', to: 'C1', type: 'holds', cycle: false },
      { from: 'R1', to: 'C1', type: 'holds', cycle: false },
    ],
    highlight: 'C1',
    codeSnippet: `// C1's blocked lock call returns:\npthread_mutex_lock(&resource_locks[0]);  // ← RETURNS!\nresource_owner[0] = 1;  // C1 now owns R0 too\n\n// C1 finishes, releases everything:\nrelease_resources(1, request1);\nrelease_resources(1, request2);\nprintf("Customer 1 finished.\\n");`,
  },
  {
    id: 13,
    title: '🏁 All Threads Exit — OS Reclaims Process',
    osAction: 'pthread_join() returns → main() exits → OS frees all resources',
    description:
      'Customer 1 finishes and exits. pthread_join() in main() returns. The main thread exits, and the OS reclaims all process resources: virtual memory pages, file descriptors, kernel thread stacks, mutex objects, and the PCB. The process is fully terminated.',
    threads: [
      { id: 'main', label: 'Main Thread', state: 'terminated', holding: [], waiting: null },
      { id: 'detector', label: 'Detector Thread', state: 'terminated', holding: [], waiting: null },
      { id: 'C0', label: 'Customer 0 (Even)', state: 'terminated', holding: [], waiting: null },
      { id: 'C1', label: 'Customer 1 (Odd)', state: 'terminated', holding: [], waiting: null },
    ],
    resources: [
      { id: 'R0', label: 'Cart_Lock', owner: null, queue: [] },
      { id: 'R1', label: 'Payment_GW', owner: null, queue: [] },
    ],
    arrows: [],
    highlight: 'done',
    codeSnippet: `// Back in main():\npthread_join(detector, NULL);  // ← returns\nreturn 0;\n// OS: reclaim virtual memory, destroy mutexes,\n//     free thread stacks, delete PCB\n// Process TERMINATED — exit code 0`,
  },
];

/* ───────────── STATE COLORS ───────────── */
const STATE_COLORS = {
  running: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', label: 'RUNNING', dot: 'bg-emerald-400' },
  ready: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', label: 'READY', dot: 'bg-blue-400' },
  sleeping: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', label: 'SLEEPING', dot: 'bg-amber-400' },
  waiting: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', label: 'WAITING', dot: 'bg-orange-400' },
  blocked: { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400', label: 'BLOCKED', dot: 'bg-rose-400' },
  deadlocked: { bg: 'bg-red-600/25', border: 'border-red-500/60', text: 'text-red-400', label: 'DEADLOCKED', dot: 'bg-red-500' },
  terminated: { bg: 'bg-surface-700/30', border: 'border-surface-600/40', text: 'text-surface-500', label: 'TERMINATED', dot: 'bg-surface-500' },
};

/* ───────────── THREAD BOX COMPONENT ───────────── */
function ThreadBox({ thread, isHighlighted }) {
  const sc = STATE_COLORS[thread.state] || STATE_COLORS.ready;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: isHighlighted ? 1.04 : 1,
        boxShadow: isHighlighted ? '0 0 20px rgba(99,102,241,0.3)' : '0 0 0px transparent',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-xl border-2 p-3 ${sc.bg} ${sc.border} ${isHighlighted ? 'ring-2 ring-accent/40' : ''}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-white truncate">{thread.label}</span>
        <span className="relative flex h-2 w-2 flex-shrink-0">
          {(thread.state === 'running' || thread.state === 'deadlocked') && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-75`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${sc.dot}`} />
        </span>
      </div>
      <div className={`text-[10px] font-bold uppercase tracking-wider ${sc.text}`}>
        {sc.label}
      </div>
      {thread.holding.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {thread.holding.map((r) => (
            <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-700/60 text-surface-300 font-mono">
              🔒 {r}
            </span>
          ))}
        </div>
      )}
      {thread.waiting && (
        <div className="mt-1.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono">
            ⏳ waiting: {thread.waiting}
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ───────────── RESOURCE BOX COMPONENT ───────────── */
function ResourceBox({ resource, isHighlighted }) {
  const isHeld = resource.owner !== null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: isHighlighted ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded-xl border-2 p-3 text-center ${
        resource.justCreated
          ? 'bg-accent/15 border-accent/50 ring-2 ring-accent/30'
          : isHeld
          ? 'bg-amber-500/15 border-amber-500/40'
          : 'bg-surface-700/30 border-surface-600/30'
      }`}
    >
      <div className="text-xs font-bold text-white mb-0.5">{resource.id}</div>
      <div className="text-[10px] text-surface-400 mb-1.5">{resource.label}</div>
      <div className={`text-[10px] font-bold ${isHeld ? 'text-amber-400' : 'text-emerald-400'}`}>
        {isHeld ? `🔒 ${resource.owner}` : '🔓 FREE'}
      </div>
      {resource.queue.length > 0 && (
        <div className="mt-1.5 text-[9px] text-rose-400 font-mono">
          Queue: [{resource.queue.join(', ')}]
        </div>
      )}
    </motion.div>
  );
}

/* ───────────── WAIT-FOR GRAPH SVG ───────────── */
function MiniWaitForGraph({ threads, resources, arrows }) {
  const customerThreads = threads.filter((t) => t.id.startsWith('C'));
  if (customerThreads.length === 0 && arrows.length === 0) return null;

  // Positions
  const positions = {
    C0: { x: 80, y: 50 },
    C1: { x: 280, y: 50 },
    R0: { x: 80, y: 150 },
    R1: { x: 280, y: 150 },
  };

  return (
    <div className="bg-surface-900/60 rounded-xl border border-surface-700/30 p-3">
      <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
        Wait-For Graph
      </div>
      <svg viewBox="0 0 360 200" className="w-full h-auto" style={{ maxHeight: 180 }}>
        <defs>
          <marker id="sim-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
          <marker id="sim-arrow-red" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker id="sim-arrow-green" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
          </marker>
        </defs>

        {/* Arrows */}
        {arrows.map((a, i) => {
          const from = positions[a.from];
          const to = positions[a.to];
          if (!from || !to) return null;
          const isCycle = a.cycle;
          const isHold = a.type === 'holds';
          return (
            <motion.line
              key={`arr-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isCycle ? '#ef4444' : isHold ? '#10b981' : '#6b7280'}
              strokeWidth={isCycle ? 3 : 2}
              strokeDasharray={a.type === 'waits' ? '6 3' : 'none'}
              markerEnd={isCycle ? 'url(#sim-arrow-red)' : isHold ? 'url(#sim-arrow-green)' : 'url(#sim-arrow)'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            />
          );
        })}

        {/* Customer nodes */}
        {customerThreads.map((t) => {
          const pos = positions[t.id];
          if (!pos) return null;
          const sc = STATE_COLORS[t.state] || STATE_COLORS.ready;
          const isDeadlocked = t.state === 'deadlocked';
          const fill = isDeadlocked ? 'rgba(239,68,68,0.25)' : t.state === 'terminated' ? 'rgba(75,85,99,0.2)' : 'rgba(59,130,246,0.2)';
          const stroke = isDeadlocked ? '#ef4444' : t.state === 'terminated' ? '#6b7280' : '#3b82f6';
          return (
            <g key={t.id}>
              <motion.circle
                cx={pos.x} cy={pos.y} r={22}
                fill={fill} stroke={stroke} strokeWidth={isDeadlocked ? 3 : 2}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#e5e7eb" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
                {t.id}
              </text>
            </g>
          );
        })}

        {/* Resource nodes */}
        {resources.map((r) => {
          const pos = positions[r.id];
          if (!pos) return null;
          const isHeld = r.owner !== null;
          return (
            <g key={r.id}>
              <motion.rect
                x={pos.x - 22} y={pos.y - 22} width={44} height={44} rx={8}
                fill={isHeld ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.15)'}
                stroke={isHeld ? '#f59e0b' : '#6366f1'} strokeWidth={2}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#e5e7eb" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
                {r.id}
              </text>
            </g>
          );
        })}

        {/* Labels */}
        <text x={80} y={85} textAnchor="middle" fill="#9ca3af" fontSize="8">Customer 0</text>
        <text x={280} y={85} textAnchor="middle" fill="#9ca3af" fontSize="8">Customer 1</text>
        <text x={80} y={185} textAnchor="middle" fill="#9ca3af" fontSize="8">Cart_Lock</text>
        <text x={280} y={185} textAnchor="middle" fill="#9ca3af" fontSize="8">Payment_GW</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 text-[9px] text-surface-400">
        <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Holds</div>
        <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-surface-400 inline-block" style={{ borderTop: '1px dashed #6b7280' }} /> Waits</div>
        <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Cycle</div>
      </div>
    </div>
  );
}

/* ───────────── MAIN SIMULATION COMPONENT ───────────── */
export default function OSSimulation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000);
  const intervalRef = useRef(null);
  const scrollRef = useRef(null);

  const step = STEPS[currentStep];
  const totalSteps = STEPS.length;

  const goNext = useCallback(() => {
    setCurrentStep((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, [totalSteps]);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleSpeed = useCallback(() => {
    setSpeed((prev) => (prev === 3000 ? 1500 : prev === 1500 ? 800 : 3000));
  }, []);

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  // Scroll timeline into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector(`[data-step="${currentStep}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentStep]);

  const speedLabel = speed === 3000 ? '1×' : speed === 1500 ? '2×' : '3×';

  return (
    <GlassCard className="p-6" glow={step.highlight === 'deadlock' || step.highlight === 'cycle' ? 'danger' : step.highlight === 'recovery' ? '' : ''}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <span className="text-accent-light">▶</span> Interactive OS Execution Simulation
          </h2>
          <p className="text-xs text-surface-400 mt-0.5">
            Step through the exact sequence the OS follows when running the deadlock backend
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400 font-mono tabular-nums bg-surface-800/60 px-2 py-1 rounded-lg border border-surface-700/30">
            Step {currentStep + 1}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto pb-3 mb-5 custom-scrollbar"
      >
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            data-step={i}
            onClick={() => setCurrentStep(i)}
            className={`flex-shrink-0 w-8 h-8 rounded-lg text-[10px] font-bold transition-all duration-200 border ${
              i === currentStep
                ? s.highlight === 'deadlock' || s.highlight === 'cycle'
                  ? 'bg-red-500/25 text-red-400 border-red-500/50 ring-2 ring-red-500/30'
                  : s.highlight === 'recovery'
                  ? 'bg-purple-500/25 text-purple-400 border-purple-500/50 ring-2 ring-purple-500/30'
                  : 'bg-accent/20 text-accent-light border-accent/50 ring-2 ring-accent/30'
                : i < currentStep
                ? 'bg-surface-700/40 text-surface-300 border-surface-600/30'
                : 'bg-surface-800/30 text-surface-500 border-surface-700/20 hover:bg-surface-700/40'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-700/40 text-surface-300 border border-surface-600/30 hover:bg-surface-600/40 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipBack size={13} />
          Prev
        </button>
        <button
          onClick={togglePlay}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isPlaying
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
          }`}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          {isPlaying ? 'Pause' : 'Auto-Play'}
        </button>
        <button
          onClick={goNext}
          disabled={currentStep === totalSteps - 1}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-700/40 text-surface-300 border border-surface-600/30 hover:bg-surface-600/40 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
          <SkipForward size={13} />
        </button>
        <button
          onClick={toggleSpeed}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-700/40 text-surface-300 border border-surface-600/30 hover:bg-surface-600/40 hover:text-white transition-all"
        >
          <FastForward size={13} />
          {speedLabel}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-700/40 text-surface-300 border border-surface-600/30 hover:bg-surface-600/40 hover:text-white transition-all"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      {/* Step Title + OS Action */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`rounded-xl p-4 mb-5 border ${
            step.highlight === 'deadlock' || step.highlight === 'cycle'
              ? 'bg-red-500/5 border-red-500/30'
              : step.highlight === 'recovery'
              ? 'bg-purple-500/5 border-purple-500/30'
              : step.highlight === 'done'
              ? 'bg-emerald-500/5 border-emerald-500/30'
              : 'bg-surface-800/40 border-surface-700/30'
          }`}>
            <h3 className="text-base font-bold text-white mb-1">
              {step.title}
            </h3>
            <div className={`text-xs font-semibold mb-2 px-2 py-1 rounded-lg inline-block ${
              step.highlight === 'deadlock' || step.highlight === 'cycle'
                ? 'bg-red-500/10 text-red-400'
                : step.highlight === 'recovery'
                ? 'bg-purple-500/10 text-purple-400'
                : 'bg-blue-500/10 text-blue-400'
            }`}>
              OS: {step.osAction}
            </div>
            <p className="text-xs text-surface-300 leading-relaxed mt-2">
              {step.description}
            </p>
          </div>

          {/* Visual: Threads + Resources + Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            {/* Threads column */}
            <div className="lg:col-span-1 space-y-2">
              <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
                Threads (OS Kernel View)
              </div>
              {step.threads.map((t) => (
                <ThreadBox
                  key={t.id}
                  thread={t}
                  isHighlighted={
                    step.highlight === t.id ||
                    (step.highlight === 'customers' && t.id.startsWith('C')) ||
                    (step.highlight === 'deadlock' && t.state === 'deadlocked') ||
                    (step.highlight === 'cycle' && t.state === 'deadlocked')
                  }
                />
              ))}
            </div>

            {/* Resources column */}
            <div className="lg:col-span-1 space-y-2">
              <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
                Resources (Mutex State)
              </div>
              {step.resources.map((r) => (
                <ResourceBox
                  key={r.id}
                  resource={r}
                  isHighlighted={step.highlight === 'resources'}
                />
              ))}

              {/* State Legend */}
              <div className="mt-4 p-3 rounded-xl bg-surface-900/40 border border-surface-700/30">
                <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
                  Thread States
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(STATE_COLORS).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${val.dot}`} />
                      <span className={`text-[9px] ${val.text}`}>{val.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Wait-For Graph */}
            <div className="lg:col-span-1">
              <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
                Resource Allocation Graph
              </div>
              <MiniWaitForGraph
                threads={step.threads}
                resources={step.resources}
                arrows={step.arrows}
              />
            </div>
          </div>

          {/* Code Snippet */}
          <div>
            <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
              C Code Being Executed
            </div>
            <pre className="text-[11px] text-surface-300 bg-surface-900/70 rounded-xl p-4 overflow-x-auto font-mono border border-surface-700/30 leading-relaxed">
              {step.codeSnippet}
            </pre>
          </div>
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  );
}
