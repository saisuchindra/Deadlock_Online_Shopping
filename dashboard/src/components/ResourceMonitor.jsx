import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import { Filter, Eye, EyeOff, X, ChevronRight } from 'lucide-react';

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

function ResourceDetail({ resource, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mx-2 mb-3 p-4 rounded-xl bg-surface-900/60 border border-accent/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-sm ${resource.available ? 'bg-success' : 'bg-danger'}`} />
            {resource.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface-700/50 text-surface-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-surface-800/50 border border-surface-700/30">
            <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Status</p>
            <StatusBadge available={resource.available} />
          </div>
          <div className="p-2.5 rounded-lg bg-surface-800/50 border border-surface-700/30">
            <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Owner</p>
            <p className={`text-sm font-mono font-semibold ${resource.owner ? 'text-warning' : 'text-surface-500'}`}>
              {resource.owner || 'None'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-800/50 border border-surface-700/30">
            <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Instances</p>
            <p className="text-sm font-mono font-semibold text-accent-light">
              {resource.currentInstances}<span className="text-surface-500">/{resource.maxInstances}</span>
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-800/50 border border-surface-700/30">
            <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Waiting Queue</p>
            <p className="text-sm font-semibold text-surface-300">
              {resource.waitingThreads.length > 0 ? (
                <span className="text-danger">{resource.waitingThreads.length} thread{resource.waitingThreads.length > 1 ? 's' : ''}</span>
              ) : (
                <span className="text-surface-500">Empty</span>
              )}
            </p>
          </div>
        </div>
        {resource.waitingThreads.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-surface-500 uppercase tracking-wider mr-1 self-center">Waiting:</span>
            {resource.waitingThreads.map((t, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20 font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ResourceMonitor({ resources, activeResourceIds, onToggleResource, onClearFilter }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // activeResourceIds is a Set — empty means all active
  const hasFilter = activeResourceIds && activeResourceIds.size > 0;
  const isActive = (r) => !hasFilter || activeResourceIds.has(r.id);

  const activeResources = resources.filter(isActive);
  const inactiveResources = resources.filter((r) => !isActive(r));
  const availableCount = activeResources.filter((r) => r.available).length;
  const heldCount = activeResources.filter((r) => !r.available).length;

  return (
    <GlassCard className="p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
          Resource Monitor
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-surface-500 font-medium">
            {availableCount} free · {heldCount} held
            {hasFilter && <span className="text-accent-light ml-1">· {activeResources.length} active</span>}
          </span>
          {hasFilter && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onClearFilter}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold
                text-surface-400 hover:text-white bg-surface-800/50 hover:bg-surface-700/50
                border border-surface-600/30 transition-all"
            >
              <X size={10} />
              Run All
            </motion.button>
          )}
        </div>
      </div>

      {/* Resource Selection Chips — controls which resources run in simulation */}
      <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-surface-700/20">
        <button
          onClick={onClearFilter}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 border ${
            !hasFilter
              ? 'text-accent-light bg-accent/10 border-accent/25'
              : 'text-surface-400 hover:text-surface-200 bg-surface-800/40 border-surface-600/30 hover:border-surface-500/40'
          }`}
        >
          <Filter size={10} />
          All
        </button>
        {resources.map((r) => {
          const active = isActive(r);
          return (
            <button
              key={r.id}
              onClick={() => onToggleResource(r.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 border ${
                hasFilter && active
                  ? 'text-white bg-success/15 border-success/30'
                  : hasFilter && !active
                  ? 'text-surface-500 bg-surface-900/40 border-surface-700/20 opacity-50'
                  : 'text-surface-300 hover:text-surface-200 bg-surface-800/40 border-surface-600/30 hover:border-surface-500/40'
              }`}
            >
              {hasFilter ? (
                active ? <Eye size={10} className="text-success" /> : <EyeOff size={10} />
              ) : (
                <span className={`w-1.5 h-1.5 rounded-sm ${r.available ? 'bg-success' : 'bg-danger'}`} />
              )}
              {r.name}
            </button>
          );
        })}
      </div>

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
              <th className="pb-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {/* Active resources */}
              {activeResources.map((resource, idx) => (
                <React.Fragment key={resource.id}>
                  <motion.tr
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`border-b border-surface-700/20 cursor-pointer transition-colors ${
                      expandedId === resource.id
                        ? 'bg-accent/5'
                        : 'hover:bg-surface-700/20'
                    }`}
                    onClick={() => toggleExpand(resource.id)}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-sm ${resource.available ? 'bg-success' : 'bg-danger'}`} />
                        <span className="text-sm font-medium text-white">
                          {resource.name}
                        </span>
                        {hasFilter && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 font-semibold uppercase">
                            Active
                          </span>
                        )}
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
                    <td className="py-3">
                      <motion.div
                        animate={{ rotate: expandedId === resource.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={14} className="text-surface-500" />
                      </motion.div>
                    </td>
                  </motion.tr>
                  {expandedId === resource.id && (
                    <tr key={`${resource.id}-detail`}>
                      <td colSpan={5} className="p-0">
                        <ResourceDetail
                          resource={resource}
                          onClose={() => setExpandedId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {/* Inactive resources (dimmed) */}
              {inactiveResources.map((resource, idx) => (
                <motion.tr
                  key={resource.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-surface-700/10"
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm bg-surface-600" />
                      <span className="text-sm font-medium text-surface-500">
                        {resource.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-800/50 text-surface-500 border border-surface-700/20 font-semibold uppercase">
                        Paused
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-sm font-mono text-surface-600">—</td>
                  <td className="py-2.5 pr-4 text-xs text-surface-600">—</td>
                  <td className="py-2.5 text-xs text-surface-600">Inactive</td>
                  <td className="py-2.5"></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
