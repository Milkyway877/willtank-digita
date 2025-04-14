import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  recommended: boolean;
}

const templateOptions: TemplateOption[] = [
  {
    id: 'standard',
    name: 'Standard Will',
    description: 'A comprehensive will suitable for most individuals with standard assets and beneficiaries.',
    features: [
      'Personal Information',
      'Beneficiary Designation',
      'Asset Distribution',
      'Executor Appointment',
      'Special Instructions'
    ],
    recommended: true
  },
  {
    id: 'family',
    name: 'Family Protection Will',
    description: 'Designed for families with children, including guardianship provisions and trust considerations.',
    features: [
      'Guardian Appointment',
      'Minor Trust Provisions',
      'Education Funding',
      'Pet Care Provisions',
      'Family Heirlooms'
    ],
    recommended: false
  },
  {
    id: 'business',
    name: 'Business Owner Will',
    description: 'Specialized will for entrepreneurs and business owners with succession planning.',
    features: [
      'Business Succession',
      'Shareholder Agreements',
      'Intellectual Property',
      'Business Debt Handling',
      'Partner Buyout Provisions'
    ],
    recommended: false
  },
  {
    id: 'property',
    name: 'Real Estate Focused Will',
    description: 'For individuals with significant real estate holdings and property interests.',
    features: [
      'Property Distribution',
      'Mortgage Instructions',
      'Rental Property Management',
      'Foreign Property Handling',
      'Land Conservation Options'
    ],
    recommended: false
  }
];

const TemplateSelection: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const handleBack = () => {
    navigate('/welcome');
  };
  
  const handleContinue = async () => {
    if (!selectedTemplate) {
      // Show an error toast if no template is selected
      toast({
        title: "No template selected",
        description: "Please select a template before continuing",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Save selected template to localStorage for use in AI chat
      localStorage.setItem('selectedWillTemplate', selectedTemplate);
      
      // Navigate to AI chat
      navigate('/create-will');
    } catch (error) {
      console.error('Error selecting template:', error);
      toast({
        title: "Error",
        description: "There was a problem with your selection. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <AnimatedAurora />
      </div>
      
      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <Button
              variant="ghost"
              className="absolute left-4 top-4 md:left-8 md:top-8"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Will Template
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Select the template that best fits your needs. Each template is designed to address specific circumstances and requirements.
            </p>
          </motion.div>
          
          {/* Template Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
          >
            {templateOptions.map((template, index) => (
              <Card
                key={template.id}
                className={`p-6 border-2 cursor-pointer transition-all duration-300 ${
                  selectedTemplate === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{template.name}</h3>
                    {template.recommended && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Key Features:
                  </h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </motion.div>
          
          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-8"
          >
            <Button
              onClick={handleContinue}
              disabled={!selectedTemplate}
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-6"
            >
              Continue with {selectedTemplate ? templateOptions.find(t => t.id === selectedTemplate)?.name : 'Selected Template'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Next, Skyler will guide you through creating your will using this template.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;