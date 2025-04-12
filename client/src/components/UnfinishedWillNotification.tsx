import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { FileWarning, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { hasUnfinishedWill, getWillProgress, getRouteForStep } from '@/lib/will-progress-tracker';

const UnfinishedWillNotification: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [, navigate] = useLocation();
  const [currentPath] = useLocation();

  // Paths where we should not show the notification
  const excludedPaths = [
    '/template-selection', 
    '/ai-chat', 
    '/document-upload', 
    '/video-recording', 
    '/final-review',
    '/completion'
  ];

  useEffect(() => {
    // Don't show the notification if the user is already in the will creation process
    if (excludedPaths.some(path => currentPath.startsWith(path))) {
      return;
    }

    // Check if there's an unfinished will
    const unfinishedWill = hasUnfinishedWill();
    
    if (unfinishedWill) {
      // Show the notification after a short delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPath]);

  const handleContinue = () => {
    const progress = getWillProgress();
    if (progress) {
      const routeToNavigate = getRouteForStep(progress.currentStep);
      navigate(routeToNavigate);
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300
        }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-amber-200 dark:border-amber-900">
          <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-100 dark:border-amber-800 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">Unfinished Will Detected</h3>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
                  <FileWarning className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You have an unfinished will in progress. Would you like to continue where you left off?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleContinue}
                    className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                  >
                    Continue
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnfinishedWillNotification;