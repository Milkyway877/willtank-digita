import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle, Download, Share, Printer, Lock, ArrowRight, Home } from 'lucide-react';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

const Completion: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);

  // Check if will is completed
  useEffect(() => {
    const willCompleted = localStorage.getItem('willCompleted');
    if (!willCompleted) {
      navigate('/final-review');
    }
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      <div className="container mx-auto py-12 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-4 text-gray-900 dark:text-white"
            >
              Your Will Is Complete!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
            >
              Congratulations on taking this important step to secure your legacy. Your will has been securely stored.
            </motion.p>
          </div>
          
          {/* Actions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-primary bg-opacity-10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Download Copy</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Download a copy of your will document for your records.
              </p>
              <button className="text-primary hover:text-primary-dark font-medium flex items-center text-sm">
                Download PDF <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-primary bg-opacity-10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Share className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Share Securely</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Share a secure access link with your executor or trusted contacts.
              </p>
              <button className="text-primary hover:text-primary-dark font-medium flex items-center text-sm">
                Share Access <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-primary bg-opacity-10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Printer className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Print & Sign</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Print your will to sign and notarize for legal validation.
              </p>
              <button className="text-primary hover:text-primary-dark font-medium flex items-center text-sm">
                Print Version <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </motion.div>
          </div>
          
          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-12"
          >
            <div className="p-5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-lg">Next Steps for Your Will</h2>
            </div>
            
            <div className="p-6">
              <ol className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Print and Sign</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Print out your will and sign it in the presence of two witnesses who are not beneficiaries.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Get it Notarized</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      For additional legal protection, consider having your will notarized by a certified notary public.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Store Securely</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Keep the original signed copy in a safe, fireproof location. Inform your executor of its location.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 mt-0.5">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Review Periodically</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      It's recommended to review your will every 3-5 years or after major life events.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </motion.div>
          
          {/* Security Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 mb-12 border border-indigo-100 dark:border-indigo-900/30"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <Lock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-indigo-800 dark:text-indigo-300 mb-2">Your Security is Our Priority</h3>
                <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-3">
                  Your will document and all uploaded files are securely stored with bank-level 256-bit encryption. Only you and your designated contacts can access them.
                </p>
                <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                  We recommend adding trusted contacts who can access your will in case of emergency.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Back to Dashboard Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex justify-center"
          >
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-8 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Completion;