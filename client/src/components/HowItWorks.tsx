import React from 'react'
import { motion } from 'framer-motion'
import { User, Calendar, FileText, Check, ArrowRight } from 'lucide-react'

const HowItWorks: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section id="how-it-works" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">How WillTank Works</h2>
          <p className="mt-4 text-lg text-neutral-600">
            Creating your will shouldn't be complicated. Our AI assistant Skyler guides you through the entire process in four simple steps.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Step 1 */}
          <motion.div className="bg-white rounded-xl p-6 shadow-md transition hover:shadow-lg" variants={item}>
            <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Create Your Account</h3>
            <p className="mt-3 text-neutral-600">
              Sign up in seconds and meet Skyler, your AI guide that will personalize your will-creation experience.
            </p>
            <div className="mt-4 text-primary font-medium flex items-center">
              <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-2">1</span>
              Start
            </div>
          </motion.div>
          
          {/* Step 2 */}
          <motion.div className="bg-white rounded-xl p-6 shadow-md transition hover:shadow-lg" variants={item}>
            <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Complete Guided Questions</h3>
            <p className="mt-3 text-neutral-600">
              Answer simple questions about your wishes, beneficiaries, and assets with Skyler's AI assistance.
            </p>
            <div className="mt-4 text-primary font-medium flex items-center">
              <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-2">2</span>
              Detail
            </div>
          </motion.div>
          
          {/* Step 3 */}
          <motion.div className="bg-white rounded-xl p-6 shadow-md transition hover:shadow-lg" variants={item}>
            <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Review Your Will</h3>
            <p className="mt-3 text-neutral-600">
              Get a legally-sound document based on your inputs, with Skyler highlighting anything you might have missed.
            </p>
            <div className="mt-4 text-primary font-medium flex items-center">
              <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-2">3</span>
              Review
            </div>
          </motion.div>
          
          {/* Step 4 */}
          <motion.div className="bg-white rounded-xl p-6 shadow-md transition hover:shadow-lg" variants={item}>
            <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">Secure & Deliver</h3>
            <p className="mt-3 text-neutral-600">
              Store your will securely in our encrypted vault and set up automated delivery to your chosen executors.
            </p>
            <div className="mt-4 text-primary font-medium flex items-center">
              <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-2">4</span>
              Complete
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#" className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition shadow-md hover:shadow-lg">
            Start Creating Your Will
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
