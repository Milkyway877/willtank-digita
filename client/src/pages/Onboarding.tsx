import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/user/onboarding', { completed: true });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setLocation('/dashboard');
    }
  });

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboardingMutation.mutateAsync();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!user) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-center p-6">
      <motion.div 
        className="max-w-4xl w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Welcome to WillTank
            </h1>
            <div className="text-sm text-gray-400">
              Step {step} of {totalSteps}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="w-full bg-white/10 h-1.5 rounded-full mb-10">
            <div 
              className="bg-gradient-to-r from-primary to-purple-400 h-full rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Tell us about yourself</h2>
              <p className="text-gray-300 mb-6">
                We'd like to customize your experience based on your needs and preferences.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 cursor-pointer transition-all">
                  <h3 className="text-xl font-semibold mb-2">I'm planning ahead</h3>
                  <p className="text-gray-400">
                    I want to create a will to ensure my assets are distributed according to my wishes.
                  </p>
                </div>
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 cursor-pointer transition-all">
                  <h3 className="text-xl font-semibold mb-2">I need immediate assistance</h3>
                  <p className="text-gray-400">
                    I need to create a will quickly due to a specific circumstance or event.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Security is our priority</h2>
              <p className="text-gray-300 mb-6">
                We take the security of your legal documents very seriously. Here's how we protect your information:
              </p>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
                  <p className="text-gray-400">
                    Your documents are encrypted both in transit and at rest, ensuring only you can access them.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-2">Regular Security Audits</h3>
                  <p className="text-gray-400">
                    We conduct regular security assessments to ensure your data remains protected.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-2">Secure Access Controls</h3>
                  <p className="text-gray-400">
                    Multi-factor authentication and strict access controls keep your documents safe.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">You're all set!</h2>
              <p className="text-gray-300 mb-6">
                Thank you for completing the onboarding process. You're now ready to start using WillTank to create and manage your will documents.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to get started</h3>
                <p className="text-gray-400">
                  Click "Complete" below to access your dashboard and begin creating your will.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-between">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-gradient-to-r from-primary to-purple-400 hover:opacity-90 rounded-lg transition-all"
            disabled={completeOnboardingMutation.isPending}
          >
            {completeOnboardingMutation.isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : step === totalSteps ? "Complete" : "Next"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Onboarding;