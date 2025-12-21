import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const LoadingView: React.FC = () => {
  return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 textured-grid flex flex-col items-center justify-center z-50"
        >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="mb-6"
      >
        <Globe className="w-16 h-16 text-blue-500" />
      </motion.div>
      
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-gray-400 text-lg"
      >
        Analyzing spatial data...
      </motion.div>
      
      <div className="mt-4 flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingView;
