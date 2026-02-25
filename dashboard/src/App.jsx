import React from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from './hooks/useSimulation';
import SystemStatus from './components/SystemStatus';
import ResourceMonitor from './components/ResourceMonitor';
import WaitForGraph from './components/WaitForGraph';
import PerformanceMetrics from './components/PerformanceMetrics';
import EventLog from './components/EventLog';
import ControlPanel from './components/ControlPanel';
import StressTest from './components/StressTest';
import { Monitor, Cpu } from 'lucide-react';

export default function App() {
  const sim = useSimulation();

  const activeCustomerCount = sim.customers.filter(
    (c) => c.state !== 'idle'
  ).length;
  const activeResourceCount = sim.resources.filter(
    (r) => !r.available
  ).length;

  return (
    <div className="min-h-screen bg-surface-950 text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-700/30">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                <Monitor size={20} className="text-accent-light" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Deadlock Management Framework
                </h1>
                <p className="text-[11px] text-surface-400 font-medium">
                  Online Shopping Application — Real-time OS Simulation Engine
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Cpu size={13} />
                <span className="font-mono tabular-nums">
                  Tick: {sim.tick}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                sim.isRunning
                  ? 'text-success bg-success/10 border-success/30'
                  : 'text-surface-400 bg-surface-800/50 border-surface-600/30'
              }`}>
                <span className="relative flex h-2 w-2">
                  {sim.isRunning && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${sim.isRunning ? 'bg-success' : 'bg-surface-500'}`} />
                </span>
                {sim.isRunning ? 'SIMULATION ACTIVE' : 'OFFLINE'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Row 1: System Status (full width) */}
          <SystemStatus
            systemStatus={sim.systemStatus}
            activeCustomers={activeCustomerCount}
            activeResources={activeResourceCount}
            deadlockCount={sim.deadlockCount}
            recoveryCount={sim.recoveryCount}
          />

          {/* Row 2: Resource Monitor + Control Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ResourceMonitor resources={sim.resources} />
            </div>
            <div className="xl:col-span-1">
              <ControlPanel
                isRunning={sim.isRunning}
                stressTestActive={sim.stressTestActive}
                preventionEnabled={sim.preventionEnabled}
                avoidanceEnabled={sim.avoidanceEnabled}
                detectionEnabled={sim.detectionEnabled}
                onStart={sim.startSimulation}
                onStop={sim.stopSimulation}
                onReset={sim.resetSystem}
                onToggleStress={sim.toggleStressTest}
                onPreventionChange={sim.setPreventionEnabled}
                onAvoidanceChange={sim.setAvoidanceEnabled}
                onDetectionChange={sim.setDetectionEnabled}
              />
            </div>
          </div>

          {/* Row 3: Wait-For Graph + Event Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WaitForGraph
              graphData={sim.graphData}
              systemStatus={sim.systemStatus}
            />
            <EventLog events={sim.eventLog} />
          </div>

          {/* Row 4: Performance Metrics + Stress Test */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceMetrics
              perfData={sim.perfData}
              totalGranted={sim.totalGranted}
              totalDenied={sim.totalDenied}
              tick={sim.tick}
            />
            <StressTest
              stressData={sim.stressData}
              active={sim.stressTestActive}
            />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-700/20 mt-8">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-surface-500">
            <span>Deadlock Management Framework v1.0 — OS Simulation Dashboard</span>
            <span className="font-mono tabular-nums">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
