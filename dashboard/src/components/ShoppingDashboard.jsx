import React from 'react';
import { motion } from 'framer-motion';
import { useShoppingSimulation } from '../hooks/useShoppingSimulation';
import GlassCard from './GlassCard';
import ShoppingCart from './ShoppingCart';
import CustomerList from './CustomerList';
import DeadlockVisualizer from './DeadlockVisualizer';
import InventoryManager from './InventoryManager';
import ShoppingEventLog from './ShoppingEventLog';
import ShoppingControlPanel from './ShoppingControlPanel';
import { AlertCircle, ShoppingBag } from 'lucide-react';

function ShoppingDashboard() {
  const {
    customers,
    inventory,
    deadlocks,
    resolvedDeadlocks,
    events,
    isRunning,
    startSimulation,
    stopSimulation,
    resolveDeadlock,
    initializeSimulation,
  } = useShoppingSimulation();

  React.useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-white">
          🛒 E-Commerce Deadlock Simulation
        </h1>
      </div>

      {/* Top Control Panel */}
      <ShoppingControlPanel
        isRunning={isRunning}
        onStart={startSimulation}
        onStop={stopSimulation}
        deadlockCount={deadlocks.length}
        resolvedCount={resolvedDeadlocks.length}
      />

      {/* Deadlock Alert */}
      {deadlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-red-300 font-semibold mb-2">
              ⚠️ DEADLOCK DETECTED!
            </h3>
            <p className="text-red-200 text-sm mb-3">
              {deadlocks.length} deadlock situation(s) detected in the shopping system.
              Customers are waiting for items in a circular chain!
            </p>
            <div className="space-y-2">
              {deadlocks.map((dl, idx) => (
                <div
                  key={idx}
                  className="bg-red-500/10 p-2 rounded text-sm text-red-100 flex justify-between items-center"
                >
                  <span>
                    {customers.find((c) => c.id === dl.customer1)?.name} ↔️{' '}
                    {customers.find((c) => c.id === dl.customer2)?.name}
                  </span>
                  <button
                    onClick={() => resolveDeadlock(idx)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Customers + Inventory */}
        <div className="xl:col-span-1 space-y-6">
          <CustomerList customers={customers} />
          <InventoryManager inventory={inventory} />
        </div>

        {/* Center Column: Deadlock Visualization */}
        <div className="xl:col-span-1">
          <DeadlockVisualizer
            customers={customers}
            deadlocks={deadlocks}
            resolvedDeadlocks={resolvedDeadlocks}
          />
        </div>

        {/* Right Column: Shopping Carts + Event Log */}
        <div className="xl:col-span-1 space-y-6">
          <ShoppingCart customers={customers} />
          <ShoppingEventLog events={events} />
        </div>
      </div>

      {/* Bottom: Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <GlassCard className="p-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {customers.length}
            </div>
            <div className="text-gray-300 text-sm mt-2">Active Customers</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {inventory.length}
            </div>
            <div className="text-gray-300 text-sm mt-2">Inventory Items</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">
              {deadlocks.length}
            </div>
            <div className="text-gray-300 text-sm mt-2">Active Deadlocks</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {resolvedDeadlocks.length}
            </div>
            <div className="text-gray-300 text-sm mt-2">Resolved Deadlocks</div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

export default ShoppingDashboard;
