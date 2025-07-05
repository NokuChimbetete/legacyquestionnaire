import React from 'react';
import { motion } from 'framer-motion';
import { animationVariants } from '~/utils/animationUtils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = "" }) => {
  return (
    <motion.div
      className={className}
      {...animationVariants.slideUp}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
