import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface TrustProgressBarProps {
  progress?: number;
  showDetails?: boolean;
}

interface TrustFactor {
  name: string;
  completed: boolean;
  importance: 'high' | 'medium' | 'low';
  description: string;
}

const TrustProgressBar: React.FC<TrustProgressBarProps> = ({ 
  progress = 85, 
  showDetails = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  
  // Animate progress on mount
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [progress]);
  
  // Trust factors that contribute to overall trust score
  const trustFactors: TrustFactor[] = [
    {
      name: 'Will Completeness',
      completed: true,
      importance: 'high',
      description: 'All required sections of your will are complete'
    },
    {
      name: 'Supporting Documents',
      completed: true,
      importance: 'high',
      description: 'All required supporting documents are uploaded'
    },
    {
      name: 'Video Testimony',
      completed: true,
      importance: 'high',
      description: 'Video confirmation is recorded and stored'
    },
    {
      name: 'Beneficiary Information',
      completed: true,
      importance: 'medium',
      description: 'All beneficiaries have complete contact information'
    },
    {
      name: 'Executor Details',
      completed: true,
      importance: 'medium',
      description: 'Executor has been designated with complete contact info'
    },
    {
      name: 'Delivery Instructions',
      completed: false,
      importance: 'medium',
      description: 'Instructions for how to deliver your will are missing'
    },
    {
      name: 'Regular Check-ins',
      completed: true,
      importance: 'low',
      description: 'You have completed your recent scheduled check-in'
    },
    {
      name: 'Two-Factor Authentication',
      completed: false,
      importance: 'low',
      description: 'Enable 2FA to add an extra layer of security to your account'
    }
  ];
  
  // Calculate the trust strength label
  const getTrustStrength = (percent: number) => {
    if (percent >= 90) return 'Excellent';
    if (percent >= 75) return 'Strong';
    if (percent >= 60) return 'Good';
    if (percent >= 40) return 'Fair';
    return 'Needs Attention';
  };
  
  // Get color based on progress
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'from-green-500 to-green-400';
    if (percent >= 75) return 'from-blue-500 to-green-400';
    if (percent >= 60) return 'from-blue-500 to-blue-400';
    if (percent >= 40) return 'from-yellow-500 to-blue-400';
    return 'from-red-500 to-orange-400';
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold text-gray-800 dark:text-white">Trust Score</h3>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">
            {getTrustStrength(progress)}
          </span>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"
          >
            {animatedProgress}%
          </motion.span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${animatedProgress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progress)}`}
        />
      </div>
      
      {/* Expand/Collapse Details Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-primary hover:text-primary-dark transition-colors mt-1 mb-3"
      >
        {isExpanded ? 'Hide Details' : 'Show Details'}
      </button>
      
      {/* Detailed Factors */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 space-y-2"
        >
          {trustFactors.map((factor, index) => (
            <motion.div 
              key={factor.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start p-2 rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <div className="flex-shrink-0 mt-0.5">
                {factor.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {factor.name}
                  </p>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    factor.importance === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                      : factor.importance === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {factor.importance}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {factor.description}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Suggestion to improve */}
          <div className="mt-4 p-3 border border-blue-100 dark:border-blue-900 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Increase your trust score by completing the remaining factors:
            </p>
            <ul className="mt-2 pl-5 list-disc text-xs text-blue-700 dark:text-blue-400 space-y-1">
              {trustFactors.filter(f => !f.completed).map((factor) => (
                <li key={factor.name}>{factor.name}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrustProgressBar;