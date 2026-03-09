import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

function ShoppingCart({ customers }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🛒 Shopping Carts
      </h2>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {customers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-700/30 rounded-lg p-3 border border-gray-600"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-white">
                {customer.name}
              </p>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                {customer.cart.length} items
              </span>
            </div>
            {customer.acquired.length > 0 ? (
              <div className="space-y-1">
                {customer.acquired.map((item) => (
                  <div
                    key={item}
                    className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded"
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Cart is empty</p>
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

export default ShoppingCart;
