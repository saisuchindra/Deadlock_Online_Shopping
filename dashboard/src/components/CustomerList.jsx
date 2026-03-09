import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

function CustomerList({ customers }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        👥 Active Customers
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {customers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-lg border-l-4 ${
              customer.status === 'deadlocked'
                ? 'bg-red-500/10 border-red-500'
                : customer.status === 'shopping'
                ? 'bg-blue-500/10 border-blue-500'
                : 'bg-gray-700/30 border-gray-500'
            }`}
          >
            <p className="font-semibold text-white text-sm">
              {customer.name}
            </p>
            <div className="text-xs text-gray-300 mt-1">
              <span
                className={`inline-block px-2 py-1 rounded ${
                  customer.status === 'deadlocked'
                    ? 'bg-red-600'
                    : customer.status === 'shopping'
                    ? 'bg-blue-600'
                    : 'bg-gray-600'
                }`}
              >
                {customer.status.toUpperCase()}
              </span>
            </div>
            {customer.waiting_for && (
              <p className="text-xs text-yellow-300 mt-2">
                ⏳ Waiting for: {customer.waiting_for}
              </p>
            )}
            {customer.acquired.length > 0 && (
              <p className="text-xs text-green-300 mt-1">
                ✓ Has: {customer.acquired.join(', ')}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

export default CustomerList;
