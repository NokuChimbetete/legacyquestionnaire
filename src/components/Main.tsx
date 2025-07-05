import React from "react";
import Image from "next/image";
import LoginForm from "./LoginForm";
import { motion } from "framer-motion";
import { animationVariants, withDelay, interactions } from "~/utils/animationUtils";

const MainSection: React.FC = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-white p-6">
      <motion.div
        {...animationVariants.fadeIn}
        className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-6xl"
      >
        <motion.div
          {...withDelay(animationVariants.slideLeft, 0.1)}
          className="flex-shrink-0"
        >
          <Image
            src="/minerva.svg"
            alt="Minerva Logo"
            width={280}
            height={280}
            className="drop-shadow-2xl"
          />
        </motion.div>

        <motion.div
          {...withDelay(animationVariants.slideRight, 0.2)}
          className="flex flex-col items-center max-w-lg"
        >
          <motion.div 
            className="w-full rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-lg p-10 shadow-2xl"
            {...withDelay(animationVariants.slideUp, 0.3)}
          >
            <motion.h1 
              className="text-center mb-6 text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight"
              {...withDelay(animationVariants.slideUp, 0.4)}
            >
              Minerva Vibe Check ✔️
            </motion.h1>
            
            <motion.p 
              className="text-center mb-8 text-lg text-gray-600 leading-relaxed"
              {...withDelay(animationVariants.slideUp, 0.5)}
            >
              Discover your unique Minerva vibe and get ready for an amazing Foundation Week experience!
            </motion.p>
            
            <motion.div
              {...withDelay(animationVariants.slideUp, 0.6)}
            >
              <LoginForm />
            </motion.div>
            
            <motion.button 
              className="w-full mt-8 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 text-white font-semibold shadow-lg hover:from-gray-700 hover:to-gray-800 hover:shadow-xl"
              {...withDelay(animationVariants.slideUp, 0)}
              whileHover={interactions.hover}
              whileTap={interactions.tap}
            >
              Contact Us
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Handwritten signature message - positioned to mirror the logo */}
        <motion.div
          {...withDelay(animationVariants.fadeIn, 1)}
          className="hidden lg:flex flex-shrink-0 items-center justify-center"
          style={{ width: '280px', height: '280px' }}
        >
          <div
            className="text-gray-500 text-lg transform rotate-[-5deg] text-center leading-relaxed"
            style={{ fontFamily: 'var(--font-kalam), "Comic Sans MS", cursive' }}
          >
            <div className="mb-2">made with</div>
            <div className="text-2xl mb-2">❤️</div>
            <div className="mb-1">for Minerva University</div>
            <div className="text-sm italic">- Rafael, M28</div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default MainSection;
