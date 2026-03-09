import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

function InventoryManager({ inventory }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📦 Inventory
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {inventory.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-3 rounded-lg border-l-4 ${
              item.locked_by
                ? 'bg-red-500/10 border-red-500'
                : 'bg-green-500/10 border-green-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-white text-sm">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ${item.price} × {item.quantity} units
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded font-semibold ${
                  item.locked_by
                    ? 'bg-red-600 text-red-100'
                    : 'bg-green-600 text-green-100'
                }`}
              >
                {item.locked_by ? '🔒 LOCKED' : '🔓 FREE'}
              </span>
            </div>
            {item.locked_by && (
              <p className="text-xs text-red-300 mt-2">
                Locked by: {item.locked_by}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

export default InventoryManager;
