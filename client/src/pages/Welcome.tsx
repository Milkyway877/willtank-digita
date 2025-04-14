import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle2, ArrowRight, FileText, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Template card component
const TemplateCard = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  selected 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  onClick: () => void; 
  selected: boolean;
}) => (
  <motion.div
    className={`relative p-6 border rounded-xl shadow-sm cursor-pointer transition-all duration-300
      ${selected ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
    whileHover={{ y: -5 }}
    onClick={onClick}
  >
    {selected && (
      <div className="absolute top-4 right-4">
        <CheckCircle2 className="h-5 w-5 text-primary" />
      </div>
    )}
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </motion.div>
);

const Welcome: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templates = [
    {
      id: 'standard',
      title: 'Standard Will',
      description: 'A comprehensive will covering all essential aspects of asset distribution and guardianship.',
      icon: <FileText className="h-8 w-8 text-primary" />
    },
    {
      id: 'family',
      title: 'Family Protection',
      description: 'Focused on protecting children, spouses, and dependents with detailed guardianship provisions.',
      icon: <FileText className="h-8 w-8 text-blue-500" />
    },
    {
      id: 'business',
      title: 'Business Owner',
      description: 'Specialized provisions for business succession, partnerships, and company assets.',
      icon: <FileText className="h-8 w-8 text-purple-500" />
    },
    {
      id: 'property',
      title: 'Real Estate Focus',
      description: 'Detailed provisions for multiple properties, international assets, and complex estates.',
      icon: <FileText className="h-8 w-8 text-green-500" />
    }
  ];

  const handleContinue = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Please select a template",
        description: "You must select a template to continue",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save template selection to local storage for use in AI chat
      localStorage.setItem('selectedWillTemplate', selectedTemplate);
      
      // Update user profile in the database
      const response = await apiRequest('POST', '/api/user/update-profile', {
        willInProgress: true,
        preferences: {
          selectedTemplate
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Refetch user to update state
      await refetchUser();
      
      // Navigate to create will page
      navigate('/create-will');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save template selection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to WillTank</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Let's secure your legacy with a professionally guided will. 
            Choose a template to get started with Skyler, your AI assistant.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6">Select a Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  title={template.title}
                  description={template.description}
                  icon={template.icon}
                  onClick={() => setSelectedTemplate(template.id)}
                  selected={selectedTemplate === template.id}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedTemplate || isSubmitting}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg
              font-medium flex items-center justify-center transition-colors
              disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Processing</span>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              </>
            ) : (
              <>
                Continue to Skyler <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center text-gray-600"
        >
          <p className="flex items-center justify-center">
            <span>Your data is encrypted and secure</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Update any time</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>24/7 Support</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;