import React from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  Lock, 
  Users, 
  Video, 
  Shield, 
  RefreshCw,
  ArrowRight 
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

  const featureCardVariants = {
    hover: { 
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    }
  };

  const iconContainerVariants = {
    hover: { 
      scale: 1.1,
      transition: { duration: 0.3, type: "spring", stiffness: 300 }
    }
  };

  const featuresData = [
    {
      icon: <Lightbulb className="h-6 w-6 text-white" />,
      title: "Skyler AI Assistant",
      description: "Our intelligent AI companion guides you through the entire will creation process, offering personalized suggestions and explaining legal terms in plain language.",
      checkItems: [
        "24/7 available to answer questions",
        "Simplifies complex legal language",
        "Learns your preferences over time"
      ],
      gradient: "from-purple-600 via-violet-500 to-cyan-500"
    },
    {
      icon: <Lock className="h-6 w-6 text-white" />,
      title: "Secure Digital Vault",
      description: "Your will and sensitive documents are stored in our bank-level encrypted vault, ensuring your information remains private and secure.",
      checkItems: [
        "256-bit AES encryption",
        "Biometric access control",
        "Regular security audits"
      ],
      gradient: "from-blue-600 via-indigo-500 to-primary"
    },
    {
      icon: <Users className="h-6 w-6 text-white" />,
      title: "Executor Management",
      description: "Easily designate executors, provide them with the necessary tools, and ensure your will is delivered securely when needed.",
      checkItems: [
        "Multi-factor authentication",
        "Guided executor onboarding",
        "Automated notifications"
      ],
      gradient: "from-cyan-500 via-teal-500 to-emerald-500"
    },
    {
      icon: <Video className="h-6 w-6 text-white" />,
      title: "Media Attachments",
      description: "Attach video messages, photos, and important documents to accompany your will, making it more personal and comprehensive.",
      checkItems: [
        "Video message recording",
        "Document attachment",
        "Family photo albums"
      ],
      gradient: "from-pink-500 via-rose-500 to-purple-600"
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: "Legal Compliance",
      description: "Our system ensures your will meets all legal requirements in your jurisdiction, with automatic updates when laws change.",
      checkItems: [
        "Jurisdiction-specific templates",
        "Automatic legal updates",
        "Legal expert verification"
      ],
      gradient: "from-amber-500 via-orange-500 to-red-500"
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-white" />,
      title: "Updates & Revisions",
      description: "Life changes, and so should your will. Easily update your will anytime, with version history and change tracking.",
      checkItems: [
        "Unlimited revisions",
        "Version comparison",
        "Annual reminder notifications"
      ],
      gradient: "from-emerald-500 via-green-500 to-teal-500"
    }
  ];

  const FeatureCheckItem = ({ text }: { text: string }) => (
    <li className="flex items-center text-neutral-600 group">
      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 group-hover:bg-primary/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="group-hover:text-neutral-800 transition-colors">{text}</span>
    </li>
  )

  return (
    <section id="features" className="py-20 gradient-bg-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 relative inline-block">
            Powerful Features
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></span>
          </h2>
          <p className="mt-6 text-lg text-neutral-600">
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
          {featuresData.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-md border border-neutral-100 hover-card relative overflow-hidden group"
              variants={item}
              whileHover="hover"
              initial="initial"
              animate="animate"
            >
              {/* Gradient border effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-xl opacity-10 bg-gradient-to-br from-primary via-purple-500 to-cyan-500"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-cyan-500"></div>
              </div>
              
              <div className="flex items-start relative">
                <div className="flex-shrink-0">
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center transform transition-all duration-300`}
                    variants={iconContainerVariants}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="mt-2 text-neutral-600 group-hover:text-neutral-700 transition-colors">
                    {feature.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {feature.checkItems.map((item, itemIndex) => (
                      <FeatureCheckItem key={itemIndex} text={item} />
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button className="px-8 py-3 btn-gradient text-white font-medium rounded-lg transition shadow-md hover:shadow-xl flex items-center mx-auto">
            Explore All Features
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
