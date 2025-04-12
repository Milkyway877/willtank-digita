import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Briefcase, Users, Zap, Check } from 'lucide-react'

type TemplateStepProps = {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  selectedTemplate: string | null
  onSelectTemplate: (template: string) => void
}

const templates = [
  {
    id: 'minimal',
    icon: <FileText className="w-6 h-6" />,
    title: 'Minimal',
    description: 'A simple and clean will that covers the essentials, perfect for straightforward estate planning needs.',
    features: ['Essential asset distribution', 'Basic executor appointment', 'Simple language']
  },
  {
    id: 'family',
    icon: <Users className="w-6 h-6" />,
    title: 'Family-Based',
    description: 'Comprehensive coverage for those with children, complex family structures, or specific inheritance plans.',
    features: ['Guardian appointments', 'Trust provisions', 'Family-specific clauses', 'Detailed distribution plans']
  },
  {
    id: 'business',
    icon: <Briefcase className="w-6 h-6" />,
    title: 'Business-Focused',
    description: 'Specialized will for entrepreneurs, business owners, or those with significant business assets to protect.',
    features: ['Business succession planning', 'Partnership provisions', 'Intellectual property guidance', 'Business asset protection']
  },
  {
    id: 'quick',
    icon: <Zap className="w-6 h-6" />,
    title: 'Quick Start',
    description: 'Get started fast with an easy template that guides you through the process step by step in under 30 minutes.',
    features: ['Simplified options', 'Guided completion', 'Essential coverage', 'Fast to complete']
  }
]

const TemplateStep: React.FC<TemplateStepProps> = ({ 
  onNext, 
  selectedTemplate, 
  onSelectTemplate 
}) => {
  const handleSelection = (id: string) => {
    onSelectTemplate(id)
  }

  return (
    <div className="flex flex-col items-center">
      <motion.h2 
        className="text-3xl font-bold mb-2 text-center text-neutral-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Choose a Will Template
      </motion.h2>
      
      <motion.p 
        className="text-neutral-600 mb-10 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Select a template that best fits your needs. You can customize it fully afterwards.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
        {templates.map((template, i) => (
          <motion.div
            key={template.id}
            className={`
              p-5 rounded-xl border cursor-pointer transition-all h-full
              ${selectedTemplate === template.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-neutral-200 bg-white hover:border-primary/30 hover:bg-primary/5'
              }
            `}
            onClick={() => handleSelection(template.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex gap-4 items-start mb-4">
              <div className={`
                rounded-full w-12 h-12 flex items-center justify-center shrink-0
                ${selectedTemplate === template.id 
                  ? 'bg-primary text-white' 
                  : 'bg-neutral-100 text-neutral-600'
                }
              `}>
                {template.icon}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">{template.title}</h3>
                <p className="text-sm text-neutral-600">{template.description}</p>
              </div>
            </div>
            
            <div className="ml-16">
              <p className="text-xs text-neutral-500 mb-2 uppercase font-medium">Features</p>
              <ul className="space-y-1">
                {template.features.map((feature, j) => (
                  <li key={j} className="flex items-start text-sm">
                    <Check className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={onNext}
        className={`
          px-8 py-3 font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5
          ${selectedTemplate 
            ? 'bg-gradient-to-r from-primary to-blue-500 text-white' 
            : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
          }
        `}
        disabled={!selectedTemplate}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        whileHover={selectedTemplate ? { scale: 1.05 } : {}}
        whileTap={selectedTemplate ? { scale: 0.98 } : {}}
      >
        Start My Will
      </motion.button>
    </div>
  )
}

export default TemplateStep