import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

function ShoppingEventLog({ events }) {
  const getEventColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-300 bg-yellow-500/10';
      case 'success':
        return 'text-green-300 bg-green-500/10';
      case 'error':
        return 'text-red-300 bg-red-500/10';
      default:
        return 'text-blue-300 bg-blue-500/10';
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📋 Event Log
      </h2>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {[...events].reverse().map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-2 rounded text-xs ${getEventColor(event.type)}`}
          >
            <div className="flex justify-between items-start gap-2">
              <span className="flex-1">{event.message}</span>
              <span className="text-gray-400 text-xs flex-shrink-0">
                {event.timestamp}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

export default ShoppingEventLog;
