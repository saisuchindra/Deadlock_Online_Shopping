import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import { EVENT_TYPES } from '../data/mockData';

const typeIcons = {
  [EVENT_TYPES.REQUEST]: '→',
  [EVENT_TYPES.ALLOCATE]: '✓',
  [EVENT_TYPES.BLOCK]: '⏸',
  [EVENT_TYPES.DEADLOCK]: '⚠',
  [EVENT_TYPES.RECOVERY]: '↻',
  [EVENT_TYPES.RELEASE]: '←',
};

export default function EventLog({ events }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  return (
    <GlassCard className="p-5 flex flex-col" style={{ maxHeight: 480 }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
          Deadlock Event Log
        </h2>
        <span className="text-xs text-surface-500 tabular-nums">
          {events.length} entries
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
        style={{ maxHeight: 400 }}
      >
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, height: 0, x: -20 }}
              animate={{ opacity: 1, height: 'auto', x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 py-2.5 px-3 rounded-lg border-l-2 ${
                event.type === EVENT_TYPES.DEADLOCK
                  ? 'bg-danger/5 border-danger/60'
                  : event.type === EVENT_TYPES.RECOVERY
                  ? 'bg-purple-500/5 border-purple-500/60'
                  : event.type === EVENT_TYPES.BLOCK
                  ? 'bg-warning/5 border-warning/60'
                  : event.type === EVENT_TYPES.ALLOCATE
                  ? 'bg-success/5 border-success/60'
                  : 'bg-surface-800/30 border-surface-600/40'
              }`}
            >
              <span
                className="text-sm mt-0.5 w-5 text-center flex-shrink-0"
                style={{ color: event.color }}
              >
                {typeIcons[event.type] || '•'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      color: event.color,
                      backgroundColor: `${event.color}15`,
                    }}
                  >
                    {event.label}
                  </span>
                  <span className="text-[10px] text-surface-500 font-mono tabular-nums">
                    {event.timestamp}
                  </span>
                </div>
                <p className="text-xs text-surface-300 font-mono leading-relaxed break-words">
                  {event.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="flex items-center justify-center h-32 text-surface-500 text-sm">
            No events yet. Start the simulation.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
