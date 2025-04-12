import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

type WelcomeStepProps = {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

const skylerVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { delay: 0.3, duration: 0.5 }
  }
}

const textVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.2, duration: 0.5 }
  })
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div 
        className="mb-8 w-44 h-44 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg"
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <Sparkles className="w-24 h-24 text-white" />
      </motion.div>

      <motion.h1 
        className="text-4xl sm:text-5xl font-bold mb-4 text-neutral-900 tracking-tight"
        custom={1}
        initial="initial"
        animate="animate"
        variants={textVariants}
      >
        Welcome to <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">WillTank</span>
      </motion.h1>

      <motion.p 
        className="text-lg text-neutral-600 mb-10 max-w-2xl"
        custom={2}
        initial="initial"
        animate="animate"
        variants={textVariants}
      >
        Let's help you protect what matters most.
      </motion.p>

      <motion.div 
        className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg mb-8 border border-neutral-100 relative"
        variants={skylerVariants}
        initial="initial"
        animate="animate"
      >
        <div className="absolute -top-5 left-6 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold">S</span>
        </div>
        <div className="pl-8">
          <p className="text-neutral-900 font-medium mb-1">Skyler, your AI assistant</p>
          <p className="text-neutral-600">Hi there! I'm excited to guide you through creating your will. I'll make this process simple and stress-free.</p>
        </div>
      </motion.div>

      <motion.button
        onClick={onNext}
        className="px-8 py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        custom={4}
        initial="initial"
        animate="animate"
        variants={textVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Let's Begin
      </motion.button>
    </div>
  )
}

export default WelcomeStep