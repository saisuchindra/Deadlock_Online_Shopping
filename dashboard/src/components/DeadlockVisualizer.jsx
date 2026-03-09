import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

function DeadlockVisualizer({ customers, deadlocks, resolvedDeadlocks }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">🔄 Deadlock Chain</h2>

      {deadlocks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-gray-300">No deadlocks detected</p>
          <p className="text-xs text-gray-500 mt-2">
            System is running smoothly
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deadlocks.map((deadlock, idx) => {
            const c1 = customers.find((c) => c.id === deadlock.customer1);
            const c2 = customers.find((c) => c.id === deadlock.customer2);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border-2 border-red-500 rounded-lg p-4"
              >
                {/* Circular Wait Visualization */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {/* Customer 1 */}
                  <div className="flex-1">
                    <div className="bg-red-600/30 rounded-lg p-3 text-center">
                      <p className="text-sm font-semibold text-white">
                        {c1?.name.split(' ')[1]}
                      </p>
                      <p className="text-xs text-red-200 mt-1">
                        Holds: {c1?.acquired[0] || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Arrow indicating waiting */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-red-400 font-bold">→</div>
                    <p className="text-xs text-red-300 text-center">
                      wants
                    </p>
                  </div>

                  {/* Customer 2 */}
                  <div className="flex-1">
                    <div className="bg-red-600/30 rounded-lg p-3 text-center">
                      <p className="text-sm font-semibold text-white">
                        {c2?.name.split(' ')[1]}
                      </p>
                      <p className="text-xs text-red-200 mt-1">
                        Holds: {c2?.acquired[0] || 'None'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Arrow (completing the cycle) */}
                <div className="flex items-center justify-between">
                  <div className="text-red-400 font-bold text-2xl">← wants</div>
                  <p className="text-xs text-red-300 font-semibold">
                    CIRCULAR WAIT
                  </p>
                </div>

                {/* Details */}
                <div className="mt-3 pt-3 border-t border-red-500/50 text-xs text-red-200">
                  <p>
                    🔴 {c1?.name} needs "{c2?.acquired[0]}" but {c2?.name} has it
                  </p>
                  <p className="mt-1">
                    🔴 {c2?.name} needs "{c1?.acquired[0]}" but {c1?.name} has it
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Resolved Deadlocks Summary */}
      {resolvedDeadlocks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-xs text-gray-400 font-semibold mb-2">
            RESOLVED ({resolvedDeadlocks.length})
          </p>
          <div className="text-xs text-green-300 space-y-1">
            {resolvedDeadlocks.map((_, idx) => (
              <div key={idx}>✓ Deadlock {idx + 1} resolved</div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default DeadlockVisualizer;
