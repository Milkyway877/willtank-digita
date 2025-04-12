import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Clock, Calendar, CheckCircle, X, AlertTriangle } from 'lucide-react';

interface CheckInPromptProps {
  lastCheckIn?: string;
  nextCheckIn?: string;
  onComplete?: (response: 'update' | 'skip' | 'remind') => void;
}

const CheckInPrompt: React.FC<CheckInPromptProps> = ({
  lastCheckIn = 'February 15, 2024',
  nextCheckIn = 'May 15, 2024',
  onComplete
}) => {
  const [, navigate] = useLocation();
  const [selectedOption, setSelectedOption] = useState<'update' | 'skip' | 'remind' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleOptionSelect = (option: 'update' | 'skip' | 'remind') => {
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show confetti animation
    setShowConfetti(true);
    
    // Notify parent component
    if (onComplete) {
      onComplete(selectedOption);
    }
    
    // Redirect based on selection
    setTimeout(() => {
      if (selectedOption === 'update') {
        navigate('/ai-chat');
      } else {
        navigate('/dashboard');
      }
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Avatar and Greeting */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-blue-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
        >
          <span className="text-white text-2xl font-bold">S</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2"
        >
          Regular Will Check-In
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto"
        >
          Keeping your will up-to-date is an act of love for those you care about most. Let's make sure everything is current.
        </motion.p>
      </div>
      
      {/* Check-In Information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Check-In</p>
              <p className="font-medium">{lastCheckIn}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Check-In</p>
              <p className="font-medium">{nextCheckIn} (Today)</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-400">Important Question</h3>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Have any life changes occurred that might require an update to your will? 
                (Examples: marriage, divorce, new child, change in assets, moved to a new state, etc.)
              </p>
            </div>
          </div>
        </div>
        
        {/* Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOptionSelect('update')}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
              selectedOption === 'update'
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
              selectedOption === 'update'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {selectedOption === 'update' && <CheckCircle className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <div className="font-medium">Yes, take me to update my will</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                I have changes I'd like to make to my will document
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleOptionSelect('skip')}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
              selectedOption === 'skip'
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
              selectedOption === 'skip'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {selectedOption === 'skip' && <CheckCircle className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <div className="font-medium">No, everything is fine</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No changes needed, my will is up-to-date
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleOptionSelect('remind')}
            className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
              selectedOption === 'remind'
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
              selectedOption === 'remind'
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {selectedOption === 'remind' && <CheckCircle className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <div className="font-medium">Remind me again in 6 months</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                I'm not sure right now, remind me later
              </div>
            </div>
          </button>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedOption && !isSubmitting
                ? 'bg-primary hover:bg-primary-dark text-white shadow-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </motion.div>
      
      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-gray-500 dark:text-gray-400 text-sm italic"
      >
        "A regularly updated will ensures your wishes are honored and provides clarity for your loved ones."
      </motion.div>
      
      {/* Confetti Animation (simplified) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                top: '-10%',
                left: `${Math.random() * 100}%`,
                opacity: 1,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                top: '100%',
                rotate: Math.random() * 360,
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 2 + 2,
                ease: [0.23, 0.44, 0.34, 0.99]
              }}
              style={{
                position: 'absolute',
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#E040FB'][Math.floor(Math.random() * 5)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckInPrompt;