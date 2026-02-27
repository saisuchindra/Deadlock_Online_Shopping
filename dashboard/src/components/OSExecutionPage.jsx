import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import OSSimulation from './OSSimulation';
import OSRealtimeSimulation from './OSRealtimeSimulation';
import {
  Cpu,
  Layers,
  GitBranch,
  Lock,
  Unlock,
  Clock,
  MemoryStick,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Activity,
  Zap,
  Server,
  RefreshCw,
  Terminal,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 mt-0.5">
        <Icon size={18} className="text-accent-light" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && (
          <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function StepCard({ number, title, description, code, color = 'accent' }) {
  const colorMap = {
    accent: 'border-accent/30 bg-accent/5',
    blue: 'border-blue-400/30 bg-blue-400/5',
    green: 'border-emerald-400/30 bg-emerald-400/5',
    amber: 'border-amber-400/30 bg-amber-400/5',
    rose: 'border-rose-400/30 bg-rose-400/5',
    purple: 'border-purple-400/30 bg-purple-400/5',
  };
  const numColor = {
    accent: 'bg-accent/20 text-accent-light border-accent/30',
    blue: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
    green: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
    amber: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
    rose: 'bg-rose-400/20 text-rose-400 border-rose-400/30',
    purple: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
  };
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${numColor[color]}`}
        >
          {number}
        </span>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-xs text-surface-300 leading-relaxed mb-3">
        {description}
      </p>
      {code && (
        <pre className="text-[11px] text-surface-300 bg-surface-900/60 rounded-lg p-3 overflow-x-auto font-mono border border-surface-700/30">
          {code}
        </pre>
      )}
    </div>
  );
}

function ThreadBox({ name, role, color, status }) {
  const colorMap = {
    blue: 'border-blue-400/40 bg-blue-400/10 text-blue-400',
    green: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400',
    amber: 'border-amber-400/40 bg-amber-400/10 text-amber-400',
    rose: 'border-rose-400/40 bg-rose-400/10 text-rose-400',
    purple: 'border-purple-400/40 bg-purple-400/10 text-purple-400',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]} text-center`}>
      <div className="text-xs font-bold mb-1">{name}</div>
      <div className="text-[10px] text-surface-400 mb-2">{role}</div>
      <span className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full bg-surface-800/60 border border-surface-600/30 text-surface-300">
        {status}
      </span>
    </div>
  );
}

export default function OSExecutionPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div {...fadeUp}>
        <GlassCard className="p-8 text-center" glow="accent">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20">
              <Cpu size={32} className="text-accent-light" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            How the OS Executes This Application
          </h1>
          <p className="text-surface-300 text-sm max-w-2xl mx-auto leading-relaxed">
            A deep dive into how the operating system manages{' '}
            <span className="text-accent-light font-semibold">processes</span>,{' '}
            <span className="text-blue-400 font-semibold">threads</span>,{' '}
            <span className="text-amber-400 font-semibold">synchronization</span>, and{' '}
            <span className="text-rose-400 font-semibold">deadlock scenarios</span>{' '}
            when running our C backend.
          </p>
        </GlassCard>
      </motion.div>

      {/* Interactive Simulation */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
        <OSSimulation />
      </motion.div>

      {/* Real-Time Deadlock Simulation */}
      <motion.div {...fadeUp} transition={{ delay: 0.07 }}>
        <OSRealtimeSimulation />
      </motion.div>

      {/* 1. Process Creation */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={Server}
            title="1. Process Creation"
            subtitle="How the OS loads and starts our program"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3 text-xs text-surface-300 leading-relaxed">
              <p>
                When you execute the compiled binary, the OS performs these steps:
              </p>
              <ul className="space-y-2">
                {[
                  'The shell calls fork() to create a new child process',
                  'exec() replaces the child\'s memory image with our program binary',
                  'The OS loader maps code, data, BSS, heap, and stack segments into virtual memory',
                  'The kernel creates a Process Control Block (PCB) with PID, state, registers, and page tables',
                  'Execution begins at main() — our program\'s entry point',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent-light mt-0.5 font-bold">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface-900/60 rounded-xl p-4 border border-surface-700/30">
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <MemoryStick size={14} className="text-accent-light" />
                Process Memory Layout
              </h4>
              <div className="space-y-1 font-mono text-[11px]">
                {[
                  { segment: 'Stack', desc: 'Local vars, function calls', color: 'text-rose-400', arrow: '↓ grows down' },
                  { segment: '   ↕', desc: '', color: 'text-surface-600', arrow: '' },
                  { segment: 'Heap', desc: 'Dynamic allocations (malloc)', color: 'text-amber-400', arrow: '↑ grows up' },
                  { segment: 'BSS', desc: 'Uninitialized globals (wait_for[][])', color: 'text-blue-400', arrow: '' },
                  { segment: 'Data', desc: 'Initialized globals (available[])', color: 'text-emerald-400', arrow: '' },
                  { segment: 'Text', desc: 'Compiled C code (read-only)', color: 'text-purple-400', arrow: '' },
                ].map(({ segment, desc, color, arrow }, i) => (
                  <div key={i} className={`flex items-center justify-between py-1.5 px-3 rounded ${i !== 2 ? 'bg-surface-800/50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${color} w-12`}>{segment}</span>
                      <span className="text-surface-400">{desc}</span>
                    </div>
                    {arrow && <span className="text-surface-500 text-[10px]">{arrow}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* 2. Thread Architecture */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={GitBranch}
            title="2. Multi-Thread Architecture"
            subtitle="POSIX Threads (pthreads) — kernel-level concurrency"
          />
          <p className="text-xs text-surface-300 leading-relaxed mb-4">
            Our application uses <span className="text-white font-semibold">pthread_create()</span> to
            spawn OS-level kernel threads. Each thread gets its own stack but shares the process's
            heap, data, and code segments. The OS scheduler independently manages these threads
            on available CPU cores.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <ThreadBox name="Main Thread" role="Entry point, menu, coordination" color="blue" status="pthread_join()" />
            <ThreadBox name="Detection Thread" role="Background DFS cycle scan" color="rose" status="Loops forever" />
            <ThreadBox name="Customer 0" role="Even — lock R0 → R1" color="green" status="pthread_create()" />
            <ThreadBox name="Customer 1" role="Odd — lock R1 → R0" color="amber" status="pthread_create()" />
          </div>

          <pre className="text-[11px] text-surface-300 bg-surface-900/60 rounded-lg p-4 overflow-x-auto font-mono border border-surface-700/30">
{`int main() {
    init_resources();                          // Initialize mutexes & shared data

    pthread_t detector;
    pthread_create(&detector, NULL,            // OS allocates a new kernel thread
                   detection_thread, NULL);     // → runs DFS cycle detection in background

    run_prevention();                          // Spawns NUM_CUSTOMERS threads
    // Each thread calls process_order() which acquires mutexes

    pthread_join(detector, NULL);              // Main thread waits for detector to finish
    return 0;
}`}
          </pre>
        </GlassCard>
      </motion.div>

      {/* 3. Synchronization */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={Lock}
            title="3. OS Synchronization Primitives"
            subtitle="How the kernel manages concurrent access to shared resources"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StepCard
              number="A"
              title="pthread_mutex_init()"
              description="Initializes a mutex — the OS creates a kernel futex (fast userspace mutex) for each shopping resource. Our program creates NUM_RESOURCES mutexes to protect Cart_Lock, Payment_Gateway, etc."
              code={`pthread_mutex_t resource_locks[NUM_RESOURCES];\n\nvoid init_resources() {\n    for(int i = 0; i < NUM_RESOURCES; i++) {\n        pthread_mutex_init(&resource_locks[i], NULL);\n        resource_owner[i] = -1;\n    }\n}`}
              color="blue"
            />
            <StepCard
              number="B"
              title="pthread_mutex_trylock()"
              description="Non-blocking lock attempt. The OS immediately returns 0 (success) or EBUSY (already held). This lets customers check resource availability without blocking."
              code={`if(pthread_mutex_trylock(&resource_locks[i]) == 0) {\n    resource_owner[i] = customer_id;  // Got it!\n    available[i]--;\n} else {\n    // Resource is held by someone else\n    int owner = resource_owner[i];\n    wait_for[customer_id][owner] = 1; // Record dependency\n}`}
              color="green"
            />
            <StepCard
              number="C"
              title="pthread_mutex_lock() — BLOCKING"
              description="The OS suspends the calling thread and puts it in a kernel wait queue. The thread stays in BLOCKED state until the mutex owner calls unlock. This is where deadlocks happen — two threads can block forever waiting for each other."
              code={`pthread_mutex_lock(&resource_locks[i]);\n// ⚠ Thread is BLOCKED here until the lock is released\n// OS context-switches this thread out\n// If two threads wait for each other → DEADLOCK`}
              color="rose"
            />
            <StepCard
              number="D"
              title="pthread_mutex_unlock()"
              description="Releases the mutex. The OS checks if any threads are waiting in the queue for this mutex, and if so, wakes one of them up (moves it from BLOCKED → READY state). The scheduler then picks it up."
              code={`void release_resources(int customer_id, int request[]) {\n    for(int i = 0; i < NUM_RESOURCES; i++) {\n        if(request[i] == 1) {\n            pthread_mutex_unlock(&resource_locks[i]);\n            resource_owner[i] = -1;  // Release ownership\n            available[i]++;          // Mark available\n        }\n    }\n}`}
              color="amber"
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* 4. Thread Scheduling */}
      <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={Clock}
            title="4. OS Thread Scheduling & Context Switching"
            subtitle="How the kernel decides which thread runs and when"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Activity size={14} className="text-blue-400" />
                Thread State Transitions
              </h3>
              <div className="bg-surface-900/60 rounded-xl p-4 border border-surface-700/30 space-y-2 font-mono text-[11px]">
                {[
                  { from: 'NEW', to: 'READY', trigger: 'pthread_create()', color: 'text-emerald-400' },
                  { from: 'READY', to: 'RUNNING', trigger: 'OS scheduler picks thread', color: 'text-blue-400' },
                  { from: 'RUNNING', to: 'BLOCKED', trigger: 'pthread_mutex_lock() on held mutex', color: 'text-rose-400' },
                  { from: 'RUNNING', to: 'SLEEPING', trigger: 'sleep(N) — voluntary CPU yield', color: 'text-amber-400' },
                  { from: 'BLOCKED', to: 'READY', trigger: 'pthread_mutex_unlock() by owner', color: 'text-emerald-400' },
                  { from: 'SLEEPING', to: 'READY', trigger: 'Timer interrupt after N seconds', color: 'text-blue-400' },
                  { from: 'RUNNING', to: 'TERMINATED', trigger: 'Thread function returns', color: 'text-surface-400' },
                ].map(({ from, to, trigger, color }, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="text-surface-400 w-20 text-right">{from}</span>
                    <ArrowRight size={12} className={color} />
                    <span className={`font-bold w-24 ${color}`}>{to}</span>
                    <span className="text-surface-500 text-[10px]">{trigger}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <RefreshCw size={14} className="text-amber-400" />
                Context Switch Sequence
              </h3>
              <div className="space-y-2">
                {[
                  { step: '1', text: 'Timer interrupt or blocking syscall fires', detail: 'Hardware signals the CPU to stop current thread' },
                  { step: '2', text: 'Save thread context (registers, PC, SP)', detail: 'OS saves running thread state to its Thread Control Block' },
                  { step: '3', text: 'Scheduler selects next READY thread', detail: 'Linux CFS / Windows dispatcher picks highest-priority thread' },
                  { step: '4', text: 'Restore new thread context from TCB', detail: 'Load registers, program counter, stack pointer' },
                  { step: '5', text: 'Resume execution of new thread', detail: 'CPU continues where the new thread left off' },
                ].map(({ step, text, detail }) => (
                  <div key={step} className="flex items-start gap-3 p-3 rounded-lg bg-surface-900/40 border border-surface-700/30">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-400/15 text-amber-400 text-[10px] font-bold border border-amber-400/30 flex-shrink-0">
                      {step}
                    </span>
                    <div>
                      <p className="text-xs text-white font-medium">{text}</p>
                      <p className="text-[10px] text-surface-400 mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-surface-900/40 border border-surface-700/30">
            <p className="text-xs text-surface-300 leading-relaxed">
              <span className="text-white font-semibold">In our application:</span> The{' '}
              <code className="text-amber-400 bg-surface-800/60 px-1 rounded">sleep(1)</code> calls
              in <code className="text-accent-light bg-surface-800/60 px-1 rounded">process_order()</code>{' '}
              voluntarily yield the CPU. The OS moves the thread to SLEEPING state, schedules
              another thread, and wakes it after the interval via a timer interrupt. This deliberate
              delay between resource acquisitions is what creates the window for deadlocks.
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* 5. The Deadlock Scenario */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={AlertTriangle}
            title="5. The Deadlock — How It Happens"
            subtitle="Circular wait created by opposite resource acquisition orders"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Timeline</h3>
              <div className="space-y-1.5">
                {[
                  { time: 't=0', event: 'Customer 0 locks Resource 0 (mutex)', icon: '🔒', color: 'text-blue-400' },
                  { time: 't=0', event: 'Customer 1 locks Resource 1 (mutex)', icon: '🔒', color: 'text-emerald-400' },
                  { time: 't=1s', event: 'sleep(1) expires — OS wakes both threads', icon: '⏰', color: 'text-amber-400' },
                  { time: 't=1s', event: 'Customer 0 tries Resource 1 → BLOCKED', icon: '🚫', color: 'text-rose-400' },
                  { time: 't=1s', event: 'Customer 1 tries Resource 0 → BLOCKED', icon: '🚫', color: 'text-rose-400' },
                  { time: '∞', event: 'DEADLOCK: both threads in kernel wait queue forever', icon: '💀', color: 'text-danger' },
                ].map(({ time, event, icon, color }, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-900/40 border border-surface-700/30">
                    <span className="font-mono text-[10px] text-surface-500 w-10">{time}</span>
                    <span className="text-sm">{icon}</span>
                    <span className={`text-xs ${color}`}>{event}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3">Circular Wait Diagram</h3>
              <div className="bg-surface-900/60 rounded-xl p-6 border border-surface-700/30">
                <svg viewBox="0 0 280 200" className="w-full h-auto max-h-48">
                  {/* Customer 0 */}
                  <circle cx="60" cy="60" r="30" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="2" />
                  <text x="60" y="57" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">C0</text>
                  <text x="60" y="70" textAnchor="middle" fill="#9ca3af" fontSize="8">Even</text>

                  {/* Customer 1 */}
                  <circle cx="220" cy="60" r="30" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2" />
                  <text x="220" y="57" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold">C1</text>
                  <text x="220" y="70" textAnchor="middle" fill="#9ca3af" fontSize="8">Odd</text>

                  {/* Resource 0 */}
                  <rect x="25" y="130" width="70" height="40" rx="6" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="60" y="155" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">R0</text>

                  {/* Resource 1 */}
                  <rect x="185" y="130" width="70" height="40" rx="6" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="220" y="155" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">R1</text>

                  {/* C0 holds R0 */}
                  <line x1="60" y1="90" x2="60" y2="130" stroke="#3b82f6" strokeWidth="2" />
                  <text x="22" y="115" fill="#60a5fa" fontSize="7">HOLDS</text>

                  {/* C1 holds R1 */}
                  <line x1="220" y1="90" x2="220" y2="130" stroke="#10b981" strokeWidth="2" />
                  <text x="230" y="115" fill="#6ee7b7" fontSize="7">HOLDS</text>

                  {/* C0 waits for R1 — red cycle edge */}
                  <line x1="90" y1="65" x2="185" y2="145" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="140" y="95" fill="#ef4444" fontSize="7" fontWeight="bold">WAITS</text>

                  {/* C1 waits for R0 — red cycle edge */}
                  <line x1="190" y1="65" x2="95" y2="145" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="130" y="120" fill="#ef4444" fontSize="7" fontWeight="bold">WAITS</text>
                </svg>
              </div>
              <p className="text-[10px] text-surface-500 text-center mt-2">
                Red dashed lines show the circular wait — forming a cycle in the Wait-For Graph
              </p>
            </div>
          </div>

          <pre className="text-[11px] text-surface-300 bg-surface-900/60 rounded-lg p-4 overflow-x-auto font-mono border border-surface-700/30">
{`void* process_order(void* arg) {
    int id = *(int*)arg;

    if(id % 2 == 0) {
        request_resources(id, {R0});     // Even: lock R0 first
        sleep(1);                        // OS puts thread to sleep → context switch
        request_resources(id, {R1});     // Then try R1 → BLOCKED (held by odd customer)
    } else {
        request_resources(id, {R1});     // Odd: lock R1 first
        sleep(1);                        // OS puts thread to sleep → context switch
        request_resources(id, {R0});     // Then try R0 → BLOCKED (held by even customer)
    }
    // → Both threads stuck in kernel wait queue: DEADLOCK
}`}
          </pre>
        </GlassCard>
      </motion.div>

      {/* 6. Four Necessary Conditions */}
      <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={Layers}
            title="6. Four Necessary Conditions for Deadlock"
            subtitle="All four must hold simultaneously — our application satisfies all four"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Mutual Exclusion',
                desc: 'Each pthread_mutex can be held by only one thread at a time',
                code: 'pthread_mutex_lock(&resource_locks[i])',
                color: 'blue',
              },
              {
                title: 'Hold and Wait',
                desc: 'Customers hold R0 while waiting for R1 (and vice versa)',
                code: 'request(R0); sleep(1); request(R1);',
                color: 'amber',
              },
              {
                title: 'No Preemption',
                desc: 'OS cannot force a thread to release its mutex — only the owner can unlock',
                code: 'Only owner calls pthread_mutex_unlock()',
                color: 'rose',
              },
              {
                title: 'Circular Wait',
                desc: 'C0 waits for R1 (held by C1), C1 waits for R0 (held by C0)',
                code: 'C0 → R1 → C1 → R0 → C0    (cycle!)',
                color: 'purple',
              },
            ].map(({ title, desc, code, color }) => (
              <StepCard
                key={title}
                number={title.charAt(0)}
                title={title}
                description={desc}
                code={code}
                color={color}
              />
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* 7. Detection & Recovery */}
      <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={Zap}
            title="7. Detection & Recovery (OS-Level View)"
            subtitle="Background thread performs DFS cycle detection on the Wait-For Graph"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h3 className="text-sm font-bold text-white mb-3">Detection Thread Lifecycle</h3>
              <pre className="text-[11px] text-surface-300 bg-surface-900/60 rounded-lg p-4 overflow-x-auto font-mono border border-surface-700/30">
{`void* detection_thread(void* arg) {
    while(1) {
        sleep(2);  // OS: thread → SLEEPING for 2s

        // Reset visited arrays
        // Run DFS on wait_for[][] adjacency matrix
        for(int i = 0; i < NUM_CUSTOMERS; i++) {
            if(!visited[i] && dfs_cycle(i)) {
                printf("🔥 Deadlock Detected!\\n");
                recover_deadlock();  // Preempt victim
                break;
            }
        }
    }
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3">Recovery Mechanism</h3>
              <pre className="text-[11px] text-surface-300 bg-surface-900/60 rounded-lg p-4 overflow-x-auto font-mono border border-surface-700/30">
{`void recover_deadlock() {
    int victim = 0;  // Lowest-ID victim selection

    // Force-release victim's mutexes
    for(int i = 0; i < NUM_RESOURCES; i++) {
        if(resource_owner[i] == victim) {
            pthread_mutex_unlock(&resource_locks[i]);
            // OS wakes up blocked threads waiting
            // on this mutex → BLOCKED → READY
            resource_owner[i] = -1;
            available[i]++;
        }
    }
    // Clear wait-for edges
    for(int i = 0; i < NUM_CUSTOMERS; i++) {
        wait_for[victim][i] = 0;
        wait_for[i][victim] = 0;
    }
}`}
              </pre>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <p className="text-xs text-surface-300 leading-relaxed">
              <span className="text-rose-400 font-bold">Key Insight:</span> When{' '}
              <code className="text-rose-400 bg-surface-800/60 px-1 rounded">recover_deadlock()</code>{' '}
              calls <code className="text-rose-400 bg-surface-800/60 px-1 rounded">pthread_mutex_unlock()</code>{' '}
              on the victim's mutexes, the OS kernel{' '}
              <span className="text-white font-semibold">wakes up all threads</span> that were blocked
              in the wait queue for those mutexes. This breaks the circular wait and resolves the deadlock.
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* 8. Prevention via Resource Ordering */}
      <motion.div {...fadeUp} transition={{ delay: 0.45 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={ShieldCheck}
            title="8. Prevention — Resource Ordering"
            subtitle="Break circular wait by enforcing a global lock acquisition order"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3 text-xs text-surface-300 leading-relaxed">
              <p>
                <span className="text-white font-semibold">The idea:</span> If all threads acquire
                resources in the <span className="text-emerald-400 font-semibold">same global order</span>{' '}
                (e.g., always R0 before R1), a circular wait <span className="text-emerald-400 font-semibold">can never form</span>.
              </p>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-emerald-400 font-semibold mb-1">With Prevention:</p>
                <p className="font-mono text-[11px]">Customer 0: lock R0 → lock R1 ✓</p>
                <p className="font-mono text-[11px]">Customer 1: lock R0 → lock R1 ✓</p>
                <p className="text-[10px] text-emerald-300 mt-1">→ No circular dependency possible!</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                <p className="text-rose-400 font-semibold mb-1">Without Prevention:</p>
                <p className="font-mono text-[11px]">Customer 0: lock R0 → lock R1</p>
                <p className="font-mono text-[11px]">Customer 1: lock R1 → lock R0</p>
                <p className="text-[10px] text-rose-300 mt-1">→ Circular wait → DEADLOCK!</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-3">Banker's Algorithm (Avoidance)</h3>
              <pre className="text-[11px] text-surface-300 bg-surface-900/60 rounded-lg p-4 overflow-x-auto font-mono border border-surface-700/30">
{`int is_safe_state() {
    int work[NUM_RESOURCES];
    int finish[NUM_CUSTOMERS] = {0};

    for(int i=0; i<NUM_RESOURCES; i++)
        work[i] = available[i];

    // Try to find a safe sequence
    int count = 0;
    while(count < NUM_CUSTOMERS) {
        int found = 0;
        for(int i=0; i<NUM_CUSTOMERS; i++) {
            if(!finish[i]) {
                // Can customer i finish with
                // current available resources?
                if(need[i] <= work) {
                    work += allocation[i];
                    finish[i] = 1;
                    found = 1; count++;
                }
            }
        }
        if(!found) return 0; // UNSAFE
    }
    return 1; // SAFE — grant the request
}`}
              </pre>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* 9. Summary Diagram */}
      <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={Terminal}
            title="9. Complete OS Execution Flow"
            subtitle="End-to-end view of how the OS manages our application"
          />

          <div className="space-y-2">
            {[
              { step: '1', label: 'OS loads binary', detail: 'Creates process with PCB, maps virtual memory segments', color: 'accent' },
              { step: '2', label: 'main() calls init_resources()', detail: 'Initializes pthread_mutex_t array — kernel allocates futex objects', color: 'blue' },
              { step: '3', label: 'pthread_create() × 3', detail: 'OS creates kernel threads: 1 detector + 2 customers, each with own stack', color: 'green' },
              { step: '4', label: 'OS scheduler dispatches threads', detail: 'CFS/dispatcher time-slices threads across CPU cores (preemptive scheduling)', color: 'amber' },
              { step: '5', label: 'Threads acquire mutexes', detail: 'pthread_mutex_lock/trylock — kernel manages wait queues per mutex', color: 'purple' },
              { step: '6', label: 'sleep(1) — voluntary yield', detail: 'OS moves threads to SLEEPING state, timer interrupt wakes them after 1 second', color: 'blue' },
              { step: '7', label: 'Circular wait → DEADLOCK', detail: 'Both customer threads BLOCKED in kernel wait queue — OS cannot resolve this automatically', color: 'rose' },
              { step: '8', label: 'Detection thread wakes up', detail: 'sleep(2) expires → DFS scan finds cycle in wait_for[][] → triggers recovery', color: 'amber' },
              { step: '9', label: 'Recovery: force-unlock mutexes', detail: 'OS wakes blocked threads from wait queue → threads resume → deadlock broken', color: 'green' },
              { step: '10', label: 'Threads complete & exit', detail: 'pthread_join() returns → main() exits → OS reclaims all process resources', color: 'accent' },
            ].map(({ step, label, detail, color }) => {
              const colorMap = {
                accent: 'bg-accent/15 text-accent-light border-accent/30',
                blue: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
                green: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
                amber: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
                rose: 'bg-rose-400/15 text-rose-400 border-rose-400/30',
                purple: 'bg-purple-400/15 text-purple-400 border-purple-400/30',
              };
              return (
                <div key={step} className="flex items-start gap-3 p-3 rounded-xl bg-surface-900/40 border border-surface-700/30">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold border flex-shrink-0 ${colorMap[color]}`}>
                    {step}
                  </span>
                  <div>
                    <p className="text-xs text-white font-semibold">{label}</p>
                    <p className="text-[10px] text-surface-400 mt-0.5">{detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Footer note */}
      <motion.div {...fadeUp} transition={{ delay: 0.55 }}>
        <GlassCard className="p-6 text-center">
          <p className="text-sm text-surface-300 leading-relaxed max-w-2xl mx-auto">
            This page demonstrates how the <span className="text-white font-semibold">Operating System</span> manages
            our deadlock simulation at the kernel level — from{' '}
            <span className="text-blue-400 font-semibold">process creation</span> and{' '}
            <span className="text-emerald-400 font-semibold">thread scheduling</span> to{' '}
            <span className="text-amber-400 font-semibold">mutex synchronization</span> and{' '}
            <span className="text-rose-400 font-semibold">deadlock recovery</span>.
          </p>
          <div className="mt-4 text-xs text-surface-500">
            Deadlock Management Framework — OS Execution Deep Dive
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
