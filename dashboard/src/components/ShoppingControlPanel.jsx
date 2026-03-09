import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { Play, Pause, RotateCcw } from 'lucide-react';

function ShoppingControlPanel({
  isRunning,
  onStart,
  onStop,
  deadlockCount,
  resolvedCount,
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Controls */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              isRunning
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            Start
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            disabled={!isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              !isRunning
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Pause className="w-4 h-4" />
            Stop
          </motion.button>
        </div>

        {/* Status Indicators */}
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {isRunning ? '▶️' : '⏸️'}
            </div>
            <div className="text-xs text-gray-400">
              {isRunning ? 'Running' : 'Stopped'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {deadlockCount}
            </div>
            <div className="text-xs text-gray-400">Deadlocks</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {resolvedCount}
            </div>
            <div className="text-xs text-gray-400">Resolved</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-xs text-gray-300 leading-relaxed">
          💡 <span className="font-semibold">How it works:</span> Multiple
          customers simultaneously try to buy items from limited inventory.
          This creates resource contention scenarios that can lead to deadlock.
          Watch how customers compete for items, and see deadlock situations
          emerge when circular waiting patterns form!
        </p>
      </div>
    </GlassCard>
  );
}

export default ShoppingControlPanel;
