import React from 'react'
import { motion } from 'framer-motion'
import { Heart, FileText, MessageCircle } from 'lucide-react'

type WhyWeExistStepProps = {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

const cardVariants = {
  offscreen: { 
    y: 50, 
    opacity: 0 
  },
  onscreen: (i: number) => ({ 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      bounce: 0.4,
      delay: i * 0.2,
      duration: 0.8
    }
  })
}

const WhyWeExistStep: React.FC<WhyWeExistStepProps> = ({ onNext }) => {
  const features = [
    {
      icon: <Heart className="w-12 h-12 text-rose-500" />,
      title: "The Power of Legacy",
      description: "We believe everyone deserves to leave a meaningful legacy that protects their loved ones and honors their wishes."
    },
    {
      icon: <FileText className="w-12 h-12 text-blue-500" />,
      title: "Simplified Legal Complexity",
      description: "We transform complicated legal requirements into a straightforward, guided process anyone can complete with confidence."
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-purple-500" />,
      title: "AI-Powered Guidance",
      description: "Skyler, your AI assistant, provides personalized help at every step, answering questions and ensuring nothing is missed."
    }
  ]

  return (
    <div className="flex flex-col items-center">
      <motion.h2 
        className="text-3xl font-bold mb-2 text-center text-neutral-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Why We Exist
      </motion.h2>
      
      <motion.p 
        className="text-neutral-600 mb-10 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        WillTank was created with a simple mission: to make legacy planning accessible to everyone
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-xl shadow-md border border-neutral-100 hover:shadow-lg transition-shadow"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            custom={i}
            variants={cardVariants}
          >
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-neutral-50 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-neutral-900">{feature.title}</h3>
            <p className="text-neutral-600 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={onNext}
        className="px-8 py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Got it!
      </motion.button>
    </div>
  )
}

export default WhyWeExistStep