import React from "react";
import { motion } from "framer-motion";
import { animationVariants, optimizedStyles } from "~/utils/animationUtils";

interface ProgressBarProps {
  current: number;
  total: number;
  isCompleted?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, isCompleted }) => {
  const percent = Math.round(((current - 1) / total) * 100);
  const displayPercent = isCompleted ? 100 : percent;
  
  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 p-4"
      {...animationVariants.slideUp}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-800">
            Question {current} of {total}
          </span>
        </div>
        
        <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${displayPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={optimizedStyles}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ 
              x: ['-100%', '100%'],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop"
            }}
            style={{ width: '30%' }}
          />
        </div>
        
        <div className="mt-2 text-center">
          <motion.span 
            className="text-xs text-gray-500"
            key={displayPercent}
            {...animationVariants.scaleIn}
          >
            {displayPercent}% Complete
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressBar;
