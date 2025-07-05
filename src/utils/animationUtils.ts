import { useEffect } from 'react';
import { Variants } from 'framer-motion';

/**
 * Centralized animation variants for consistent animations across the app
 */
export const animationVariants = {
  // Standard fade in/out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },

  // Slide from left
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  },

  // Slide from right
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  },

  // Scale in animation
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  // Scale with spring
  scaleSpring: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.5, type: "spring", bounce: 0.3 }
  },

  // Page transition variant (for _app.tsx)
  pageTransition: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    enter: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.98,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  },

  // Container animation for staggered children
  container: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  },

  // Child item for staggered animations
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  }
} as const;

/**
 * Common hover/tap interactions
 */
export const interactions = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98
  },
  buttonHover: {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
    transition: { duration: 0.2 }
  },
  cardHover: {
    scale: 1.02,
    borderColor: "#9ca3af",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  }
} as const;

/**
 * Optimized transition configurations
 */
export const transitions = {
  default: { duration: 0.3, ease: "easeOut" },
  smooth: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  quick: { duration: 0.2, ease: "easeOut" },
  spring: { type: "spring", stiffness: 300, damping: 30 },
  bouncy: { type: "spring", bounce: 0.3 }
} as const;

/**
 * Hook to optimize animations and prevent conflicts
 */
export const useAnimationOptimization = (isAnimating: boolean = false) => {
  useEffect(() => {
    if (isAnimating) {
      // Prevent layout thrashing during animations
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflowX = '';
    }

    return () => {
      document.body.style.overflowX = '';
    };
  }, [isAnimating]);
};

/**
 * Hardware acceleration styles for better performance
 * Use sparingly on larger components only
 */
export const optimizedStyles = {
  willChange: 'transform, opacity',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
};

/**
 * Helper function to create delayed variants
 */
export const withDelay = (variant: any, delay: number) => ({
  ...variant,
  transition: {
    ...variant.transition,
    delay
  }
});

/**
 * Common animation presets for specific use cases
 */
export const presets = {
  modalEnter: {
    initial: { opacity: 0, scale: 0.9, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 50 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 }
  },
  progress: {
    initial: { width: 0 },
    animate: { width: "var(--progress-width)" },
    transition: { duration: 0.8, ease: "easeOut" }
  }
};
