import React from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  Lock, 
  Users, 
  Video, 
  Shield, 
  RefreshCw 
} from 'lucide-react'

const Features: React.FC = () => {
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

  const FeatureCheckItem = ({ text }: { text: string }) => (
    <li className="flex items-center text-neutral-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      {text}
    </li>
  )

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Powerful Features</h2>
          <p className="mt-4 text-lg text-neutral-600">
            WillTank combines cutting-edge AI technology with legal expertise to provide a comprehensive will creation and storage solution.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Feature 1: Skyler AI */}
          <motion.div className="bg-white rounded-xl p-8 shadow-md border border-neutral-100 hover:shadow-xl transition" variants={item}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-neutral-900">Skyler AI Assistant</h3>
                <p className="mt-2 text-neutral-600">
                  Our intelligent AI companion guides you through the entire will creation process, offering personalized suggestions and explaining legal terms in plain language.
                </p>
                <ul className="mt-4 space-y-2">
                  <FeatureCheckItem text="24/7 available to answer questions" />
                  <FeatureCheckItem text="Simplifies complex legal language" />
                  <FeatureCheckItem text="Learns your preferences over time" />
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Feature 2: Secure Vault */}
          <motion.div className="bg-white rounded-xl p-8 shadow-md border border-neutral-100 hover:shadow-xl transition" variants={item}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-neutral-900">Secure Digital Vault</h3>
                <p className="mt-2 text-neutral-600">
                  Your will and sensitive documents are stored in our bank-level encrypted vault, ensuring your information remains private and secure.
                </p>
                <ul className="mt-4 space-y-2">
                  <FeatureCheckItem text="256-bit AES encryption" />
                  <FeatureCheckItem text="Biometric access control" />
                  <FeatureCheckItem text="Regular security audits" />
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Feature 3: Executor Tools */}
          <motion.div className="bg-white rounded-xl p-8 shadow-md border border-neutral-100 hover:shadow-xl transition" variants={item}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-neutral-900">Executor Management</h3>
                <p className="mt-2 text-neutral-600">
                  Easily designate executors, provide them with the necessary tools, and ensure your will is delivered securely when needed.
                </p>
                <ul className="mt-4 space-y-2">
                  <FeatureCheckItem text="Multi-factor authentication" />
                  <FeatureCheckItem text="Guided executor onboarding" />
                  <FeatureCheckItem text="Automated notifications" />
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Feature 4: Media Attachments */}
          <motion.div className="bg-white rounded-xl p-8 shadow-md border border-neutral-100 hover:shadow-xl transition" variants={item}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-neutral-900">Media Attachments</h3>
                <p className="mt-2 text-neutral-600">
                  Attach video messages, photos, and important documents to accompany your will, making it more personal and comprehensive.
                </p>
                <ul className="mt-4 space-y-2">
                  <FeatureCheckItem text="Video message recording" />
                  <FeatureCheckItem text="Document attachment" />
                  <FeatureCheckItem text="Family photo albums" />
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Feature 5: Legal Compliance */}
          <motion.div className="bg-white rounded-xl p-8 shadow-md border border-neutral-100 hover:shadow-xl transition" variants={item}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-neutral-900">Legal Compliance</h3>
                <p className="mt-2 text-neutral-600">
                  Our system ensures your will meets all legal requirements in your jurisdiction, with automatic updates when laws change.
                </p>
                <ul className="mt-4 space-y-2">
                  <FeatureCheckItem text="Jurisdiction-specific templates" />
                  <FeatureCheckItem text="Automatic legal updates" />
                  <FeatureCheckItem text="Legal expert verification" />
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Feature 6: Updates & Revisions */}
          <motion.div className="bg-white rounded-xl p-8 shadow-md border border-neutral-100 hover:shadow-xl transition" variants={item}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-neutral-900">Updates & Revisions</h3>
                <p className="mt-2 text-neutral-600">
                  Life changes, and so should your will. Easily update your will anytime, with version history and change tracking.
                </p>
                <ul className="mt-4 space-y-2">
                  <FeatureCheckItem text="Unlimited revisions" />
                  <FeatureCheckItem text="Version comparison" />
                  <FeatureCheckItem text="Annual reminder notifications" />
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
