import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight, Sparkles, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import { useAuth } from '@/hooks/use-auth';

const Welcome: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, updateWillStatusMutation } = useAuth();
  
  // Redirect based on user's will status
  useEffect(() => {
    if (user) {
      console.log('Will status:', { willCompleted: user.willCompleted, willInProgress: user.willInProgress });
      
      // If user has a completed will, redirect to dashboard
      if (user.willCompleted) {
        console.log('Redirecting to dashboard (completed will)');
        navigate('/dashboard');
      } 
      // If user has a will in progress, redirect to the dashboard as well
      // This ensures returning users always go to the dashboard, not template selection
      else if (user.willInProgress) {
        console.log('Redirecting to dashboard (will in progress)');
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);
  
  const handleGetStarted = () => {
    // Update the will in progress status if needed
    if (user && !user.willInProgress) {
      updateWillStatusMutation.mutate({ willInProgress: true });
    }
    navigate('/template-selection');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <AnimatedAurora />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to <span className="text-primary">WillTank</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your secure platform for creating, managing, and protecting your will and legacy documents.
              {user?.fullName && <span> Welcome back, {user.fullName}!</span>}
            </p>
          </motion.div>
          
          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="p-6 text-center border-primary/20 hover:border-primary transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Guided Creation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your will with the assistance of Skyler, our intelligent AI assistant.
              </p>
            </Card>
            
            <Card className="p-6 text-center border-primary/20 hover:border-primary transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Store your will and supporting documents in our encrypted, secure vault.
              </p>
            </Card>
            
            <Card className="p-6 text-center border-primary/20 hover:border-primary transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Legal Documents</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate legally structured documents with our expert templates.
              </p>
            </Card>
          </motion.div>
          
          {/* Getting Started Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold mb-6">Ready to secure your legacy?</h2>
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              It only takes a few minutes to complete your will.
            </p>
          </motion.div>
          
          {/* Process Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-semibold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">1</div>
                <h3 className="font-semibold mb-2">Select Template</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose a will template that fits your needs.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">2</div>
                <h3 className="font-semibold mb-2">Provide Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Answer questions with Skyler's guidance.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">3</div>
                <h3 className="font-semibold mb-2">Upload Documents</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add supporting documents and video testimony.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">4</div>
                <h3 className="font-semibold mb-2">Review & Finalize</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review your will and make it official.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;