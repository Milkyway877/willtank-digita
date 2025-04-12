import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import ParticlesBackground from '../ParticlesBackground';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  quote?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  quote = "Legacy isn't just what you leave, but how you leave it."
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand Panel (Left side on desktop, top on mobile) */}
      <motion.div 
        className="relative bg-neutral-900 text-white md:w-1/2 flex flex-col justify-center p-8 md:p-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <ParticlesBackground />
        </div>
        
        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              WillTank
            </h1>
            <p className="text-lg mt-2 text-neutral-300">AI-powered will creation & delivery</p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-medium mb-4">{title}</h2>
            <p className="text-neutral-300 max-w-md">{subtitle}</p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-12"
          >
            <div className="relative w-64 h-64 mx-auto md:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-cyan-500/30 rounded-full blur-xl"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                  <circle cx="100" cy="70" r="50" fill="url(#paint0_linear)" />
                  <path d="M170 130C170 152.091 138.66 170 100 170C61.34 170 30 152.091 30 130C30 107.909 61.34 90 100 90C138.66 90 170 107.909 170 130Z" fill="url(#paint1_linear)" />
                  <path d="M65 60L80 75M120 60L135 75" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <path d="M100 115C88.954 115 80 112.761 80 110C80 107.239 88.954 105 100 105C111.046 105 120 107.239 120 110C120 112.761 111.046 115 100 115Z" fill="white" />
                  <defs>
                    <linearGradient id="paint0_linear" x1="50" y1="20" x2="150" y2="120" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5E17EB" />
                      <stop offset="1" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="30" y1="90" x2="170" y2="170" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5E17EB" />
                      <stop offset="1" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 w-full text-center text-white/80 font-medium">
                  Skyler AI
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-auto"
          >
            <blockquote className="text-xl md:text-2xl italic text-neutral-300 border-l-4 border-primary pl-4 font-light">
              {quote}
            </blockquote>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Form Panel (Right side on desktop, bottom on mobile) */}
      <motion.div 
        className="bg-white dark:bg-neutral-900 md:w-1/2 flex flex-col justify-center p-6 md:p-12"
        initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-md mx-auto w-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;