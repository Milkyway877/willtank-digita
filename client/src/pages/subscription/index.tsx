import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Check, Shield, Star, Clock, Calendar, Users, FileText } from 'lucide-react';
import { AnimatedAurora } from '@/components/ui/AnimatedAurora';
import { useAuth } from '@/hooks/use-auth';

const plans = [
  {
    id: 'basic',
    name: 'Essential',
    price: '$9.99',
    billing: 'monthly',
    description: 'Perfect for individuals looking to create a basic will',
    features: [
      'Single Will Document',
      'Basic Document Storage',
      'Annual Reminders',
      'Email Support',
      'Video Testament (5 min)',
    ],
    bestFor: 'Individuals'
  },
  {
    id: 'pro',
    name: 'Family',
    price: '$19.99',
    billing: 'monthly',
    description: 'Ideal for couples and small families wanting comprehensive coverage',
    features: [
      'Multiple Will Documents (2)',
      'Expanded Document Storage',
      'Quarterly Reminders',
      'Priority Email Support',
      'Video Testament (15 min)',
      'Living Trust Document',
      'Healthcare Directives',
    ],
    bestFor: 'Couples & Families',
    highlighted: true
  },
  {
    id: 'enterprise',
    name: 'Legacy',
    price: '$39.99',
    billing: 'monthly',
    description: 'Complete solution for extended families and complex estates',
    features: [
      'Unlimited Will Documents',
      'Unlimited Document Storage',
      'Monthly Reminders',
      '24/7 Priority Support',
      'Video Testament (Unlimited)',
      'Living Trust Documents',
      'Healthcare Directives',
      'Power of Attorney',
      'Business Succession Planning',
      'Estate Tax Planning Guidance',
    ],
    bestFor: 'Complex Estates'
  }
];

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isYearly, setIsYearly] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call for subscription processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Show success for a few seconds before redirecting
      setTimeout(() => {
        navigate('/template-selection');
      }, 3000);
    } catch (error) {
      console.error("Error processing subscription:", error);
      setIsProcessing(false);
      // Show error message if needed
    }
  };

  // Adjust price for yearly billing (20% discount)
  const getAdjustedPrice = (plan: typeof plans[0]) => {
    if (!isYearly) return plan.price;
    
    const numericPrice = parseFloat(plan.price.replace('$', ''));
    const yearlyPrice = (numericPrice * 12 * 0.8).toFixed(2);
    return `$${yearlyPrice}`;
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 relative">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      <div className="container mx-auto py-16 px-4 relative z-10">
        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Choose Your Legacy Plan
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              >
                Protect what matters most with our comprehensive will creation and estate planning services.
              </motion.p>
              
              {/* Billing Toggle */}
              <div className="mt-8 mb-12 flex justify-center items-center">
                <span className={`text-sm ${!isYearly ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  Monthly
                </span>
                <button 
                  onClick={() => setIsYearly(!isYearly)}
                  className="mx-4 relative inline-flex h-6 w-12 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                      isYearly ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
                <div className="flex flex-col items-start">
                  <span className={`text-sm ${isYearly ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                    Yearly
                  </span>
                  <span className="text-xs text-green-600 font-medium">
                    Save 20%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: plans.indexOf(plan) * 0.1 + 0.2 }}
                  className={`rounded-xl overflow-hidden border transition-all ${
                    plan.highlighted 
                      ? 'border-primary bg-white dark:bg-gray-800 shadow-lg transform md:-translate-y-4' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="bg-primary text-white py-1.5 px-3 text-xs font-medium text-center">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {plan.bestFor}
                        </p>
                      </div>
                      {plan.id === 'basic' && <Shield className="text-blue-500 h-5 w-5" />}
                      {plan.id === 'pro' && <Star className="text-amber-500 h-5 w-5" />}
                      {plan.id === 'enterprise' && <Crown className="text-purple-500 h-5 w-5" />}
                    </div>
                    
                    <div className="mt-5">
                      <div className="flex items-end">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {getAdjustedPrice(plan)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2 mb-1">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {plan.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`mt-6 w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                        selectedPlan === plan.id
                          ? 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                    </button>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        What's included:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Purchase Button */}
            <div className="mt-12 text-center">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handlePurchase}
                disabled={isProcessing}
                className={`px-8 py-3 rounded-lg bg-primary text-white font-medium text-lg shadow-sm hover:bg-primary-dark transition-colors ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Get Started with ${plans.find(p => p.id === selectedPlan)?.name}`
                )}
              </motion.button>
              
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Secure payment • Cancel anytime • 30-day money-back guarantee
              </p>
            </div>
          </>
        ) : (
          // Success Message
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to WillTank!
            </h2>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Congratulations {user?.username?.split('@')[0]}! Your account has been successfully activated with the {plans.find(p => p.id === selectedPlan)?.name} plan.
            </p>
            
            <p className="text-md text-gray-600 dark:text-gray-400 mb-8">
              You're now ready to create your personalized will. We'll guide you through each step of the process to ensure your legacy is protected exactly as you wish.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            >
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/template-selection');
                }}
                className="px-8 py-3 rounded-lg bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-colors"
              >
                Proceed to Will Creation
              </button>
              
              <p className="mt-4 text-sm text-gray-500">
                Redirecting to template selection...
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Crown icon for the Legacy plan
const Crown = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M20.8 8.5C20.8 8.5 20 12.7 19.2 14.3C18.9 14.9 18.3 15.3 17.6 15.3H6.4C5.7 15.3 5.1 14.9 4.8 14.3C4 12.7 3.2 8.5 3.2 8.5C3.1 8.1 3.3 7.7 3.7 7.5C4.1 7.3 4.6 7.4 4.8 7.8L7.5 11.4C7.7 11.7 8.1 11.8 8.5 11.7C8.8 11.6 9.1 11.3 9.2 11L11.1 5.7C11.2 5.3 11.6 5 12 5C12.4 5 12.8 5.3 12.9 5.7L14.8 11C14.9 11.3 15.2 11.6 15.5 11.7C15.9 11.8 16.3 11.7 16.5 11.4L19.2 7.8C19.4 7.4 19.9 7.3 20.3 7.5C20.7 7.7 20.9 8.1 20.8 8.5Z" 
      fill="currentColor"
    />
    <path 
      d="M18.8 17.3C18.8 16.7 18.3 16.3 17.7 16.3H6.3C5.7 16.3 5.2 16.7 5.2 17.3V18.5C5.2 19.1 5.7 19.5 6.3 19.5H17.7C18.3 19.5 18.8 19.1 18.8 18.5V17.3Z" 
      fill="currentColor"
    />
  </svg>
);

export default SubscriptionPage;