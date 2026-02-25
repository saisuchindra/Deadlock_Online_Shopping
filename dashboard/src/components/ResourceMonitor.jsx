import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

function StatusBadge({ available }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        available
          ? 'bg-success/15 text-success border border-success/30'
          : 'bg-danger/15 text-danger border border-danger/30'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-success' : 'bg-danger'}`}
      />
      {available ? 'Available' : 'Held'}
    </span>
  );
}

export default function ResourceMonitor({ resources }) {
  return (
    <GlassCard className="p-5 overflow-hidden">
      <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
        Resource Monitor
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-surface-700/40">
              <th className="pb-3 pr-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Resource
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Current Owner
              </th>
              <th className="pb-3 pr-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Waiting Threads
              </th>
              <th className="pb-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {resources.map((resource, idx) => (
                <motion.tr
                  key={resource.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="border-b border-surface-700/20 hover:bg-surface-700/20 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm bg-accent-light" />
                      <span className="text-sm font-medium text-white">
                        {resource.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <motion.span
                      key={resource.owner || 'none'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-sm font-mono ${
                        resource.owner ? 'text-warning' : 'text-surface-500'
                      }`}
                    >
                      {resource.owner || '—'}
                    </motion.span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {resource.waitingThreads.length > 0 ? (
                        resource.waitingThreads.map((t, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded bg-surface-700/50 text-surface-300 font-mono"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-surface-500">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <StatusBadge available={resource.available} />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
