import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Shield, Video, Archive, Users, Clock } from 'lucide-react'
import { useLocation } from 'wouter'
import { useMutation } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

type PaywallStepProps = {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

type PricingPeriod = 'monthly' | 'yearly'

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    name: 'Free',
    description: 'Basic will creation with essential features',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: 'Create one basic will document', included: true },
      { text: 'Basic document storage', included: true },
      { text: 'Email support', included: true },
      { text: 'Video message recording', included: false },
      { text: 'Advanced asset management', included: false },
      { text: 'Unlimited document revisions', included: false },
      { text: 'Executor dashboard access', included: false },
    ]
  },
  {
    name: 'Premium',
    description: 'Complete legacy planning suite',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    popular: true,
    features: [
      { text: 'Create unlimited will documents', included: true },
      { text: 'Secure cloud document storage', included: true },
      { text: 'Priority 24/7 support', included: true },
      { text: 'Video message recording', included: true },
      { text: 'Advanced asset management', included: true },
      { text: 'Unlimited document revisions', included: true },
      { text: 'Executor dashboard access', included: true },
    ]
  }
]

const PaywallStep: React.FC<PaywallStepProps> = ({ onNext }) => {
  const [period, setPeriod] = useState<PricingPeriod>('yearly')
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { refetchUser } = useAuth();

  const handlePeriodToggle = () => {
    setPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')
  }
  
  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }
  
  // Mutation to complete onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async (profile: any) => {
      const res = await apiRequest('POST', '/api/onboarding/complete', { profile });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }
      return res.json();
    },
    onSuccess: async () => {
      // Refetch user data to update the hasCompletedOnboarding flag
      await refetchUser();
      
      // Navigate to subscription page
      navigate('/subscription');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete onboarding",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Save user profile with preferences and billing period choice
    const profile = {
      billingPreference: period,
      preferences: {
        billingPeriod: period
      }
    };
    
    // Complete onboarding via API then navigate to subscription
    completeOnboardingMutation.mutate(profile);
  }

  const yearlyDiscount = 16.7 // Approximately 16.7% discount

  return (
    <div className="flex flex-col items-center w-full">
      <motion.h2 
        className="text-3xl font-bold mb-2 text-center text-neutral-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        You're One Step Away from <span className="text-primary">Securing Your Legacy</span>
      </motion.h2>
      
      <motion.p 
        className="text-neutral-600 mb-6 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Choose a plan that's right for you and start protecting what matters most.
      </motion.p>

      {/* Pricing Toggle */}
      <motion.div 
        className="mb-8 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className={`text-sm font-medium ${period === 'monthly' ? 'text-neutral-900' : 'text-neutral-500'}`}>
          Monthly
        </span>
        <button 
          onClick={handlePeriodToggle}
          className="mx-3 relative inline-flex h-6 w-12 items-center rounded-full bg-neutral-200 transition-colors focus:outline-none"
        >
          <span className="sr-only">Toggle billing period</span>
          <span 
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${period === 'yearly' ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
          <span 
            className={`
              absolute left-0 right-0 -top-7 text-xs text-center font-medium
              ${period === 'yearly' ? 'text-green-600' : 'text-neutral-400'}
              transition-colors
            `}
          >
            {period === 'yearly' ? `Save ${yearlyDiscount}%` : ''}
          </span>
        </button>
        <span className={`text-sm font-medium ${period === 'yearly' ? 'text-neutral-900' : 'text-neutral-500'}`}>
          Yearly
        </span>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            className={`
              rounded-xl overflow-hidden transition-all duration-300
              ${plan.popular ? 'border-2 border-primary shadow-lg' : 'border border-neutral-200 shadow'}
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
            whileHover={{ translateY: -5 }}
          >
            {plan.popular && (
              <div className="bg-primary text-white text-center py-1 text-sm font-medium">
                Most Popular
              </div>
            )}
            
            <div className="p-6 bg-white">
              <h3 className="text-xl font-bold text-neutral-900 mb-1">{plan.name}</h3>
              <p className="text-neutral-600 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">
                  {formatPrice(period === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                </span>
                {plan.monthlyPrice > 0 && (
                  <span className="text-neutral-500 ml-2">
                    {period === 'monthly' ? '/month' : '/year'}
                  </span>
                )}
              </div>
              
              <button 
                className={`
                  w-full py-3 rounded-lg font-medium mb-6 transition-colors
                  ${plan.popular 
                    ? 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-md hover:shadow-lg' 
                    : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }
                `}
                onClick={handleSubscribe}
              >
                {plan.monthlyPrice === 0 ? 'Get Started' : 'Subscribe & Start'}
              </button>
              
              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex text-sm">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-neutral-300 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-neutral-800' : 'text-neutral-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust Badges */}
      <motion.div 
        className="flex flex-wrap justify-center gap-6 mb-6 w-full max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center text-neutral-600 text-sm">
          <Shield className="w-4 h-4 mr-2" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center text-neutral-600 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          <span>30-Day Money Back</span>
        </div>
        <div className="flex items-center text-neutral-600 text-sm">
          <Users className="w-4 h-4 mr-2" />
          <span>10,000+ Happy Users</span>
        </div>
      </motion.div>

      {/* Premium Features Highlights */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="text-center p-4">
          <Video className="w-8 h-8 text-primary mx-auto mb-2" />
          <h4 className="font-medium text-neutral-900 text-sm">Video Messages</h4>
          <p className="text-xs text-neutral-500">Record personal messages for your loved ones</p>
        </div>
        <div className="text-center p-4">
          <Archive className="w-8 h-8 text-primary mx-auto mb-2" />
          <h4 className="font-medium text-neutral-900 text-sm">Secure Vault</h4>
          <p className="text-xs text-neutral-500">Store important documents and memories</p>
        </div>
        <div className="text-center p-4">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <h4 className="font-medium text-neutral-900 text-sm">Executor Access</h4>
          <p className="text-xs text-neutral-500">Trusted access controls for your executors</p>
        </div>
      </motion.div>
    </div>
  )
}

export default PaywallStep