import React from 'react'
import { motion } from 'framer-motion'
import { PenLine, RefreshCw, Users, Search } from 'lucide-react'

type CustomizeExperienceStepProps = {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  selectedReason: string | null
  onSelectReason: (reason: string) => void
}

const options = [
  {
    id: 'create',
    icon: <PenLine className="w-6 h-6" />,
    title: 'Create a will',
    description: 'I want to create my first will document'
  },
  {
    id: 'update',
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Update an existing one',
    description: 'I already have a will but need to make changes'
  },
  {
    id: 'plan',
    icon: <Users className="w-6 h-6" />,
    title: 'Plan for someone else',
    description: "I'm helping someone else with their will"
  },
  {
    id: 'explore',
    icon: <Search className="w-6 h-6" />,
    title: 'Just exploring',
    description: 'I want to learn more about wills and estate planning'
  }
]

const CustomizeExperienceStep: React.FC<CustomizeExperienceStepProps> = ({ 
  onNext, 
  selectedReason, 
  onSelectReason 
}) => {
  const handleSelection = (id: string) => {
    // Only select, don't auto-advance
    onSelectReason(id)
  }

  return (
    <div className="flex flex-col items-center">
      <motion.h2 
        className="text-3xl font-bold mb-2 text-center text-neutral-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Customize Your Experience
      </motion.h2>
      
      <motion.p 
        className="text-neutral-600 mb-10 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        What brings you to WillTank today?
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        {options.map((option, i) => (
          <motion.div
            key={option.id}
            className={`
              p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4
              ${selectedReason === option.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-neutral-200 bg-white hover:border-primary/30 hover:bg-primary/5'
              }
            `}
            onClick={() => handleSelection(option.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`
              rounded-full w-12 h-12 flex items-center justify-center shrink-0
              ${selectedReason === option.id 
                ? 'bg-primary text-white' 
                : 'bg-neutral-100 text-neutral-600'
              }
            `}>
              {option.icon}
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">{option.title}</h3>
              <p className="text-sm text-neutral-500">{option.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={onNext}
        className={`
          px-8 py-3 font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5
          ${selectedReason 
            ? 'bg-gradient-to-r from-primary to-blue-500 text-white' 
            : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
          }
        `}
        disabled={!selectedReason}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        whileHover={selectedReason ? { scale: 1.05 } : {}}
        whileTap={selectedReason ? { scale: 0.98 } : {}}
      >
        Continue
      </motion.button>
    </div>
  )
}

export default CustomizeExperienceStep