import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Brain, Users } from 'lucide-react'

type SecurityStepProps = {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

const SecurityStep: React.FC<SecurityStepProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center">
      <motion.h2 
        className="text-3xl font-bold mb-2 text-center text-neutral-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Security & Trust
      </motion.h2>
      
      <motion.p 
        className="text-neutral-600 mb-8 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Your information is secure with us. Here's how we protect your data.
      </motion.p>

      {/* Security Panel with gradient background */}
      <motion.div 
        className="w-full max-w-2xl p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/5 mb-8 border border-purple-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-medium text-neutral-900">Bank-Level Encryption</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Your information is protected with 256-bit encryption, the same security used by major financial institutions.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center mb-3">
              <Lock className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-medium text-neutral-900">Executor Controls</h3>
            </div>
            <p className="text-sm text-neutral-600">
              You control who can access your will and when, with secure verification protocols for executors.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center mb-3">
              <Brain className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-medium text-neutral-900">AI Transparency</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Our AI assistant Skyler provides guidance without storing your sensitive information in its training data.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl">
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-medium text-neutral-900">Trusted by Many</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Over 10,000 users have created wills with peace of mind using our secure platform.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Testimonial */}
      <motion.div 
        className="mb-8 w-full max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <blockquote className="text-center italic text-neutral-600">
          "I was worried about creating a will online, but WillTank's security features and transparency gave me complete confidence. The process was straightforward and I felt protected every step of the way."
        </blockquote>
        <div className="flex justify-center mt-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-neutral-300 mr-3"></div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Sarah J.</p>
              <p className="text-xs text-neutral-500">WillTank User</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.button
        onClick={onNext}
        className="px-8 py-3 bg-gradient-to-r from-primary to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Let's Proceed
      </motion.button>
    </div>
  )
}

export default SecurityStep