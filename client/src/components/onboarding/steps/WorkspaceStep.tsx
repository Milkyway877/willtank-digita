import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, CircleDashed, Server, ShieldCheck, FileText } from 'lucide-react'

type WorkspaceStepProps = {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

const setupSteps = [
  {
    id: 'workspace',
    text: 'Creating secure workspace',
    icon: <Server className="w-5 h-5" />
  },
  {
    id: 'security',
    text: 'Setting up privacy controls',
    icon: <ShieldCheck className="w-5 h-5" />
  },
  {
    id: 'templates',
    text: 'Loading document templates',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'assistant',
    text: 'Activating Skyler AI',
    icon: <Server className="w-5 h-5" />
  }
]

const typingVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.03
    }
  }
}

const letterVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1
  }
}

const TypingText = ({ text }: { text: string }) => {
  return (
    <motion.span
      variants={typingVariants}
      initial="hidden"
      animate="visible"
      className="inline-block"
    >
      {text.split('').map((char, i) => (
        <motion.span 
          key={i} 
          variants={letterVariants}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

const WorkspaceStep: React.FC<WorkspaceStepProps> = ({ onNext }) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [typingComplete, setTypingComplete] = useState(false)
  
  useEffect(() => {
    // Simulate setup process
    const interval = setInterval(() => {
      if (currentStep < setupSteps.length) {
        setCompletedSteps(prev => [...prev, setupSteps[currentStep].id])
        setCurrentStep(prev => prev + 1)
      } else {
        clearInterval(interval)
        
        // Add typing animation delay then proceed
        setTimeout(() => {
          setTypingComplete(true)
        }, 1000)
        
        // Auto-advance after delay
        setTimeout(() => {
          onNext()
        }, 5000)
      }
    }, 1200)
    
    return () => clearInterval(interval)
  }, [currentStep, onNext])

  return (
    <div className="flex flex-col items-center">
      <motion.h2 
        className="text-3xl font-bold mb-2 text-center text-neutral-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Setting Up Your Workspace
      </motion.h2>
      
      <motion.p 
        className="text-neutral-600 mb-10 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Just a moment while we prepare everything for you...
      </motion.p>

      {/* Progress Steps Animation */}
      <motion.div 
        className="w-full max-w-md p-6 bg-white rounded-xl shadow-md border border-neutral-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ul className="space-y-4">
          {setupSteps.map((step) => {
            const isCompleted = completedSteps.includes(step.id)
            const isActive = currentStep === setupSteps.findIndex(s => s.id === step.id)
            
            return (
              <motion.li 
                key={step.id}
                className="flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`
                  mr-3 flex-shrink-0
                  ${isCompleted 
                    ? 'text-green-500' 
                    : isActive 
                      ? 'text-blue-500 animate-pulse' 
                      : 'text-neutral-300'
                  }
                `}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <CircleDashed className="w-6 h-6" />}
                </div>
                <div className="flex items-center">
                  <div className="mr-2 w-6 h-6 flex items-center justify-center">
                    <span className={`
                      ${isCompleted || isActive ? 'opacity-100' : 'opacity-30'}
                    `}>
                      {step.icon}
                    </span>
                  </div>
                  <span className={`
                    ${isCompleted 
                      ? 'text-neutral-900' 
                      : isActive 
                        ? 'text-neutral-900' 
                        : 'text-neutral-400'
                    }
                  `}>
                    {step.text}
                  </span>
                </div>
              </motion.li>
            )
          })}
        </ul>
      </motion.div>

      {/* Skyler Message */}
      {currentStep >= setupSteps.length && (
        <motion.div 
          className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg mb-8 border border-neutral-100 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute -top-5 left-6 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold">S</span>
          </div>
          <div className="pl-8">
            <p className="text-neutral-900 font-medium mb-1">Skyler, your AI assistant</p>
            <p className="text-neutral-600">
              {typingComplete ? (
                "We're ready to begin your legacy journey. Let's make sure your wishes are protected."
              ) : (
                <TypingText text="We're ready to begin your legacy journey. Let's make sure your wishes are protected." />
              )}
            </p>
          </div>
        </motion.div>
      )}

      {/* Button only appears when setup is complete */}
      {currentStep >= setupSteps.length && typingComplete && (
        <motion.button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          Enter Workspace
        </motion.button>
      )}
    </div>
  )
}

export default WorkspaceStep