import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useLocation } from 'wouter';
import { FileText, Home, Users, Briefcase, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

type TemplateType = {
  id: string;
  title: string;
  description: string;
  forWhom: string;
  icon: React.ReactNode;
};

const TemplateSelection: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const continueButtonRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const continueButtonControls = useAnimation();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);

  // Template options
  const templates: TemplateType[] = [
    {
      id: 'simple',
      title: 'Simple Will',
      description: 'A straightforward will for individuals with minimal assets',
      forWhom: 'For individuals with simple asset distribution needs',
      icon: <FileText className="h-10 w-10 text-primary" />
    },
    {
      id: 'family',
      title: 'Family Will',
      description: 'Comprehensive protection for loved ones and dependents',
      forWhom: 'For parents and guardians with dependents',
      icon: <Users className="h-10 w-10 text-primary" />
    },
    {
      id: 'business',
      title: 'Business Owner Will',
      description: 'Specialized will for business owners and entrepreneurs',
      forWhom: 'For entrepreneurs and business owners',
      icon: <Briefcase className="h-10 w-10 text-primary" />
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Estate Plan',
      description: 'Complete estate planning with advanced directives',
      forWhom: 'For individuals with complex assets and needs',
      icon: <Shield className="h-10 w-10 text-primary" />
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Reveal and animate the continue button after selection
    continueButtonControls.start({ 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    });
    
    // Scroll to continue button
    setTimeout(() => {
      if (continueButtonRef.current) {
        continueButtonRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      // Store selected template in localStorage for the chat interface
      localStorage.setItem('selectedWillTemplate', selectedTemplate);
      navigate('/ai-chat');
    }
  };

  const scrollToTemplates = () => {
    if (mainContainerRef.current) {
      const templatesSection = mainContainerRef.current.querySelector('#templates-section');
      if (templatesSection) {
        templatesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div ref={mainContainerRef} className="min-h-screen relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Begin Your Will Creation Journey
          </h1>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-12">
            Select a template that fits your needs, and our AI assistant Skyler will guide you through the process of creating a legally sound will.
          </p>
          
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTemplates}
            className="flex items-center mx-auto bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all text-gray-700 dark:text-gray-200"
          >
            <span>View Templates</span>
            <ChevronDown className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
      
      {/* Templates Section */}
      <div id="templates-section" className="min-h-screen py-20 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-4"
          >
            Choose Your Will Template
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto"
          >
            Select the template that best matches your situation. Each template is legally sound and specifically designed for different needs.
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-6 rounded-2xl cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'bg-primary bg-opacity-10 border-2 border-primary shadow-lg'
                    : 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-5">
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full inline-block">
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        {template.forWhom}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Continue Button */}
          <motion.div
            ref={continueButtonRef}
            initial={{ opacity: 0, y: 50 }}
            animate={continueButtonControls}
            className="mt-16 text-center"
          >
            {selectedTemplate && (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-5">
                  You've selected: <span className="font-semibold text-primary">{templates.find(t => t.id === selectedTemplate)?.title}</span>
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinue}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all"
                >
                  Continue with {templates.find(t => t.id === selectedTemplate)?.title}
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;