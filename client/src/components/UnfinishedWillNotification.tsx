import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Clock, ChevronRight } from 'lucide-react';
import { hasUnfinishedWill, getWillProgress, clearWillProgress, getRouteForStep } from '@/lib/will-progress-tracker';

const UnfinishedWillNotification: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Check if there's an unfinished will
    const unfinishedWill = hasUnfinishedWill();
    
    if (unfinishedWill) {
      // Only show after a short delay to prevent overwhelming on page load
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleContinue = () => {
    const progress = getWillProgress();
    
    if (progress) {
      // Navigate to the last step they were on
      const route = getRouteForStep(progress.currentStep);
      navigate(route);
    }
    
    setVisible(false);
  };
  
  const handleDiscard = () => {
    clearWillProgress();
    setVisible(false);
  };
  
  // Don't render anything if there's no notification to show
  if (!visible) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-amber-200 dark:border-amber-800 overflow-hidden mx-4">
            <div className="bg-amber-50 dark:bg-amber-900/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="font-medium text-amber-800 dark:text-amber-300">Unfinished Will</h3>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                You have an unfinished will. Would you like to continue from where you left off?
              </p>
              
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>Last updated: {new Date(getWillProgress()?.lastUpdated || '').toLocaleString()}</span>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDiscard}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleContinue}
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors flex items-center"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnfinishedWillNotification;