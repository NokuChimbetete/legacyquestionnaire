import { useEffect } from 'react';

/**
 * Hook to prevent animation conflicts and flickering
 * @param isAnimating - Whether an animation is currently running
 */
export const useAnimationOptimization = (isAnimating: boolean = false) => {
  useEffect(() => {
    // Prevent layout thrashing during animations
    if (isAnimating) {
      document.body.style.overflowX = 'hidden';
      document.body.style.willChange = 'transform, opacity';
    } else {
      document.body.style.overflowX = '';
      document.body.style.willChange = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflowX = '';
      document.body.style.willChange = '';
    };
  }, [isAnimating]);

  // Debounce rapid state changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isAnimating) {
      timeoutId = setTimeout(() => {
        // Reset animation state after completion
      }, 500);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAnimating]);
};

/**
 * Optimized motion variants for common animations
 */
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

/**
 * Hardware acceleration styles for better performance
 */
export const optimizedStyles = {
  willChange: 'transform, opacity',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
};
