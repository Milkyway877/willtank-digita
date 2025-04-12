import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building, Home, Globe, Sparkles, ArrowRight, ExternalLink, X, Check, FileText, Shield, Users } from 'lucide-react'

interface TemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    title: string;
    icon: React.ReactNode;
    description: string;
    features: string[];
    sampleContent: string;
  } | null;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ isOpen, onClose, template }) => {
  if (!template) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-neutral-600" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                  {template.icon}
                </div>
                <h2 className="text-2xl font-bold">{template.title} Template</h2>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-neutral-600">{template.description}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                <ul className="space-y-2">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                      <span className="text-neutral-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Sample Preview</h3>
                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200 font-mono text-sm whitespace-pre-wrap text-neutral-700">
                  {template.sampleContent}
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <button 
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition shadow-md hover:shadow-lg"
                  onClick={() => {
                    alert('Template selection saved. You can now continue with your will creation process.');
                    onClose();
                  }}
                >
                  Select This Template
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Templates: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  const templates = [
    {
      id: 1,
      title: "Basic Family Will",
      icon: <Home className="h-8 w-8 text-white" />,
      iconComponent: <Home />,
      description: "Perfect for individuals with straightforward assets and family structures. Covers essential property, guardianship, and basic bequests.",
      price: "Free",
      color: "bg-gradient-to-br from-primary to-blue-500",
      features: [
        "Simple asset division and distribution",
        "Guardian designation for minor children",
        "Digital asset instructions",
        "Pet care provisions",
        "Personal property allocation"
      ],
      sampleContent: `LAST WILL AND TESTAMENT OF [NAME]

I, [NAME], a resident of [CITY, STATE], being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I - REVOCATION
I revoke all prior wills and codicils.

ARTICLE II - FAMILY STATUS
I am married to [SPOUSE NAME]. We have [NUMBER] children: [CHILDREN NAMES AND DATES OF BIRTH].

ARTICLE III - EXECUTOR
I appoint [EXECUTOR NAME] as Executor of my estate...`
    },
    {
      id: 2,
      title: "Business Owner Will",
      icon: <Building className="h-8 w-8 text-white" />,
      iconComponent: <Building />,
      description: "Designed for entrepreneurs with business assets, succession planning, and special considerations for ongoing operations.",
      price: "Premium",
      color: "bg-gradient-to-br from-violet-500 to-indigo-500",
      features: [
        "Business succession planning",
        "Company shares distribution",
        "Intellectual property rights management",
        "Business continuity provisions",
        "Partnership dissolution guidance",
        "Employee considerations"
      ],
      sampleContent: `LAST WILL AND TESTAMENT OF [NAME]

I, [NAME], a resident of [CITY, STATE], being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I - BUSINESS INTERESTS
I am the owner of [BUSINESS NAME], a [BUSINESS TYPE] registered in [STATE].

ARTICLE II - SUCCESSION PLAN
I hereby direct that my ownership interest in [BUSINESS NAME] shall be:
1. Transferred to [SUCCESSOR NAME] subject to the following conditions...
2. The operational control shall transition according to the Business Continuity Plan dated [DATE]...

ARTICLE III - INTELLECTUAL PROPERTY
All intellectual property including patents, trademarks, and copyrights owned by me shall...`
    },
    {
      id: 3,
      title: "International Assets",
      icon: <Globe className="h-8 w-8 text-white" />,
      iconComponent: <Globe />,
      description: "For those with property or investments across multiple countries, ensuring compliant distribution across jurisdictions.",
      price: "Premium",
      color: "bg-gradient-to-br from-cyan-500 to-teal-500",
      features: [
        "Multi-jurisdictional asset handling",
        "International property transfer provisions",
        "Foreign investment considerations",
        "Currency conversion guidance",
        "Cross-border tax efficiency planning",
        "Compliance with international inheritance laws"
      ],
      sampleContent: `LAST WILL AND TESTAMENT OF [NAME]

I, [NAME], a citizen of [COUNTRY] and resident of [CITY, STATE], declare this to be my Last Will and Testament.

ARTICLE I - INTERNATIONAL ASSETS
I own property and assets in the following jurisdictions:
1. [COUNTRY 1]: Real estate located at [ADDRESS]
2. [COUNTRY 2]: Bank accounts at [BANK NAMES]
3. [COUNTRY 3]: Investment portfolio with [INSTITUTION]

ARTICLE II - CHOICE OF LAW
For assets located in [COUNTRY 1], I direct that the laws of [COUNTRY 1] shall govern...

ARTICLE III - INTERNATIONAL EXECUTORS
I appoint [EXECUTOR 1] to handle assets in [COUNTRY 1]...
I appoint [EXECUTOR 2] to handle assets in [COUNTRY 2]...`
    },
    {
      id: 4,
      title: "Custom AI Template",
      icon: <Sparkles className="h-8 w-8 text-white" />,
      iconComponent: <Sparkles />,
      description: "Work with Skyler to create a fully customized will template tailored to your unique situation and specific needs.",
      price: "Premium+",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      features: [
        "AI-driven personalization",
        "Unlimited custom clauses",
        "Complex family structure handling",
        "Special asset provisions",
        "Unique beneficiary arrangements",
        "Video testimony integration",
        "Custom delivery instructions"
      ],
      sampleContent: `[This template will be custom-generated by Skyler AI based on your specific inputs and requirements. The AI will analyze your family structure, assets, and wishes to create a completely personalized will document.]

The preview will be available after your initial consultation with Skyler through our chat interface.`
    }
  ];

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

  const openPreview = (template: any) => {
    setActiveTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <section id="templates" className="py-20 gradient-bg-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Will Templates</h2>
          <p className="mt-4 text-lg text-neutral-600">
            Choose from our collection of expert-crafted templates designed for different life situations, or let Skyler create a custom template just for you.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {templates.map((template) => (
            <motion.div 
              key={template.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover-card"
              variants={item}
            >
              <div className="p-6">
                <div className={`w-14 h-14 ${template.color} rounded-lg flex items-center justify-center mb-4`}>
                  {template.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">{template.title}</h3>
                <p className="mt-2 text-neutral-600">
                  {template.description}
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex justify-between items-center">
                    <span className="text-primary-dark font-medium">{template.price}</span>
                    <button 
                      onClick={() => openPreview(template)}
                      className="text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-lg transition flex items-center"
                    >
                      Preview
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#" className="inline-flex items-center px-6 py-3 btn-gradient text-white font-medium rounded-lg transition shadow-md hover:shadow-lg">
            View All Templates
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>
      </div>
      
      <TemplatePreview 
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={activeTemplate}
      />
    </section>
  )
}

export default Templates
