import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  hasUnfinishedWill,
  getLastStep,
  getResumeUrl,
  getLastUpdated,
  getStepDescription,
  WillCreationStep
} from '@/lib/will-progress-tracker';

/**
 * Component to show a notification if the user has an unfinished will
 * Only shown on dashboard pages and not during the will creation flow
 */
const UnfinishedWillNotification: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [lastStepDescription, setLastStepDescription] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  
  // Paths where notification should not appear
  const excludedPaths = [
    '/welcome',
    '/template-selection',
    '/create-will',
    '/document-upload',
    '/video-recording',
    '/finalize',
    // Legacy paths
    '/ai-chat',
    '/final-review',
    '/completion'
  ];
  
  useEffect(() => {
    // Only show notification if:
    // 1. User is logged in
    // 2. User has willInProgress flag set
    // 3. User is not already on a will creation page
    // 4. Local tracker shows unfinished will
    const checkUnfinishedWill = () => {
      if (!user) return;
      
      const path = window.location.pathname;
      // Use a simple array check rather than a .some() call to prevent unnecessary re-renders
      let isExcludedPath = false;
      for (let i = 0; i < excludedPaths.length; i++) {
        if (path.startsWith(excludedPaths[i])) {
          isExcludedPath = true;
          break;
        }
      }
      
      // If user is on a will creation page, don't show notification
      if (isExcludedPath) {
        setShowNotification(false);
        return;
      }
      
      // Check if user has willInProgress flag
      if (user.willInProgress && !user.willCompleted) {
        // Also check local storage for the actual unfinished step
        if (hasUnfinishedWill()) {
          const lastStep = getLastStep();
          setLastStepDescription(getStepDescription(lastStep));
          setResumeUrl(getResumeUrl());
          setLastUpdated(getLastUpdated());
          setShowNotification(true);
        }
      } else {
        setShowNotification(false);
      }
    };
    
    checkUnfinishedWill();
    
    // Listen for path changes
    const handlePathChange = () => {
      checkUnfinishedWill();
    };
    
    window.addEventListener('popstate', handlePathChange);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
    // Important: Remove excludedPaths from the dependency array to prevent infinite re-renders
    // It's a constant array so it never changes anyway
  }, [user]);
  
  const formatTimeAgo = (date: Date): string => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
  };
  
  const handleResume = () => {
    navigate(resumeUrl);
  };
  
  const handleDismiss = () => {
    setShowNotification(false);
  };
  
  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-amber-300 dark:border-amber-700 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  You have an unfinished will
                </h3>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    You were last working on <strong>{lastStepDescription}</strong>
                    {lastUpdated && (
                      <> {formatTimeAgo(lastUpdated)}</>
                    )}.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    onClick={handleResume}
                    variant="default"
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Resume
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export a memoized version to prevent unnecessary re-renders
export default React.memo(UnfinishedWillNotification);