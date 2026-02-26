import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import {
  ShieldCheck,
  Search,
  Ban,
  Cpu,
  ShoppingCart,
  Database,
  CreditCard,
  Truck,
  GitBranch,
  BarChart3,
  Layers,
  Users,
  Code2,
  Globe,
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

function StrategyCard({ icon: Icon, title, approach, algorithm, color }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };
  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      <div className={`p-2 rounded-xl border w-fit ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <div className="space-y-1.5 text-xs text-surface-300">
        <p>
          <span className="text-surface-400 font-medium">Approach:</span>{' '}
          {approach}
        </p>
        <p>
          <span className="text-surface-400 font-medium">Algorithm:</span>{' '}
          {algorithm}
        </p>
      </div>
    </GlassCard>
  );
}

function TechBadge({ label, color = 'accent' }) {
  const colorMap = {
    accent: 'bg-accent/10 text-accent-light border-accent/20',
    success: 'bg-success/10 text-success border-success/20',
    amber: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    rose: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    blue: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div {...fadeUp}>
        <GlassCard className="p-8 text-center" glow="accent">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20">
              <ShoppingCart size={32} className="text-accent-light" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Deadlock Management Framework
          </h1>
          <p className="text-surface-300 text-sm max-w-2xl mx-auto leading-relaxed">
            A comprehensive Operating Systems project demonstrating deadlock{' '}
            <span className="text-accent-light font-semibold">prevention</span>,{' '}
            <span className="text-amber-400 font-semibold">avoidance</span>, and{' '}
            <span className="text-rose-400 font-semibold">detection</span>{' '}
            algorithms — applied to a real-world online shopping resource
            contention scenario — with a stunning real-time React dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <TechBadge label="C Language" color="blue" />
            <TechBadge label="POSIX Threads" color="success" />
            <TechBadge label="React" color="accent" />
            <TechBadge label="Tailwind CSS" color="blue" />
            <TechBadge label="Framer Motion" color="rose" />
            <TechBadge label="Recharts" color="amber" />
          </div>
        </GlassCard>
      </motion.div>

      {/* Problem Statement */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={Layers}
            title="The Problem"
            subtitle="Why deadlocks matter in online shopping"
          />
          <p className="text-sm text-surface-300 leading-relaxed">
            In an online shopping system, multiple{' '}
            <span className="text-white font-medium">customers</span> (threads)
            compete for shared{' '}
            <span className="text-white font-medium">resources</span> — payment
            gateways, inventory databases, cart locks, and shipping services.
            When two or more customers hold resources and wait for each other to
            release theirs, a{' '}
            <span className="text-danger font-semibold">deadlock</span> occurs,
            freezing the entire system and blocking all transactions.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { icon: CreditCard, label: 'Payment Gateway', color: 'text-blue-400' },
              { icon: Database, label: 'Inventory DB', color: 'text-amber-400' },
              { icon: ShoppingCart, label: 'Cart Lock', color: 'text-accent-light' },
              { icon: Truck, label: 'Shipping Service', color: 'text-success' },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-900/50 border border-surface-700/30"
              >
                <Icon size={20} className={color} />
                <span className="text-[11px] text-surface-400 font-medium text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Deadlock Strategies */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <SectionTitle
          icon={ShieldCheck}
          title="Deadlock Handling Strategies"
          subtitle="Three classical OS approaches implemented"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StrategyCard
            icon={Ban}
            title="Prevention"
            approach="Eliminate one of the four necessary conditions for deadlock"
            algorithm="Resource ordering (lock hierarchy)"
            color="blue"
          />
          <StrategyCard
            icon={ShieldCheck}
            title="Avoidance"
            approach="Dynamically check if granting a request leads to an unsafe state"
            algorithm="Banker's Algorithm"
            color="amber"
          />
          <StrategyCard
            icon={Search}
            title="Detection"
            approach="Periodically scan for cycles in the wait-for graph and recover"
            algorithm="DFS cycle detection + victim preemption"
            color="rose"
          />
        </div>
      </motion.div>

      {/* Architecture */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={GitBranch}
            title="System Architecture"
            subtitle="Two-tier design: C backend + React frontend"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backend */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 size={14} className="text-success" />
                Backend (C + POSIX Threads)
              </h3>
              <ul className="space-y-2 text-xs text-surface-300">
                {[
                  'Multi-threaded simulation using pthreads',
                  "Banker's Algorithm for safe-state verification",
                  'DFS-based cycle detection on Wait-For Graph',
                  'Prevention via global lock acquisition order',
                  'Performance metrics tracking (throughput, latency)',
                  'Event logging to logs/system.log',
                  'Stress testing with 20 concurrent customers',
                  'RAG generation in Graphviz .dot format',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-success mt-0.5">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Frontend */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe size={14} className="text-accent-light" />
                Frontend (React Dashboard)
              </h3>
              <ul className="space-y-2 text-xs text-surface-300">
                {[
                  'Real-time simulation engine with tick-based updates',
                  'Live resource allocation and ownership monitor',
                  'Interactive Wait-For Graph visualization',
                  'CPU, memory, throughput charts via Recharts',
                  'Control panel to toggle strategies and stress tests',
                  'Color-coded live event log feed',
                  'Stress test monitor with contention tracking',
                  'Glassmorphism UI with Framer Motion animations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-accent-light mt-0.5">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Tech Stack */}
      <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={Cpu}
            title="Tech Stack"
            subtitle="Technologies powering the framework"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'C (GCC)', desc: 'Core backend simulation engine', color: 'blue' },
              { name: 'POSIX Threads', desc: 'Multi-threaded concurrency', color: 'success' },
              { name: 'React 18', desc: 'Component-based UI framework', color: 'accent' },
              { name: 'Tailwind CSS', desc: 'Utility-first styling', color: 'blue' },
              { name: 'Framer Motion', desc: 'Smooth UI animations', color: 'rose' },
              { name: 'Recharts', desc: 'Data visualization charts', color: 'amber' },
              { name: 'Lucide React', desc: 'Beautiful icon library', color: 'accent' },
              { name: 'Graphviz', desc: 'RAG graph rendering (optional)', color: 'success' },
              { name: 'React Router', desc: 'Client-side page navigation', color: 'rose' },
            ].map(({ name, desc, color }) => (
              <div
                key={name}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/50 border border-surface-700/30"
              >
                <TechBadge label={name} color={color} />
                <span className="text-xs text-surface-400">{desc}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Performance Metrics Info */}
      <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
        <GlassCard className="p-6">
          <SectionTitle
            icon={BarChart3}
            title="Key Metrics Tracked"
            subtitle="What the simulation measures"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Requests Granted', value: 'Throughput' },
              { label: 'Requests Denied', value: 'Safety checks' },
              { label: 'Deadlocks Detected', value: 'Cycle scans' },
              { label: 'Recoveries Performed', value: 'Victim preemption' },
              { label: 'CPU Utilization', value: 'Thread activity' },
              { label: 'Memory Usage', value: 'Allocation tracking' },
              { label: 'Avg. Latency', value: 'Response time' },
              { label: 'Contention Level', value: 'Lock competition' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-3 rounded-xl bg-surface-900/50 border border-surface-700/30 text-center"
              >
                <p className="text-[11px] text-surface-400 font-medium mb-1">
                  {label}
                </p>
                <p className="text-xs text-white font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Team */}
      <motion.div {...fadeUp} transition={{ delay: 0.6 }}>
        <GlassCard className="p-6 text-center">
          <SectionTitle
            icon={Users}
            title="About the Project"
            subtitle="Academic OS project"
          />
          <p className="text-sm text-surface-300 leading-relaxed max-w-2xl mx-auto">
            This project was developed as part of an Operating Systems course to
            demonstrate practical applications of deadlock management concepts.
            It bridges theoretical OS algorithms with a real-world online
            shopping scenario, providing both a functional C backend and an
            interactive React dashboard for visualization and experimentation.
          </p>
          <div className="mt-4 text-xs text-surface-500">
            Deadlock Management Framework v1.0 — Built with ❤️
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
