import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Check, 
  X, 
  Shield, 
  Clock, 
  Users, 
  Database, 
  FileText, 
  Video, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import { saveWillProgress, WillCreationStep } from '@/lib/will-progress-tracker';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '@/components/PaymentForm';

// Initialize Stripe outside of component to avoid recreating on rerenders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Subscription plan interface
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  billingPeriod: string;
  features: string[];
  popular?: boolean;
}

// Predefined subscription plans
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Essential will protection for individuals',
    price: '$14.99',
    billingPeriod: 'per month',
    features: [
      'Single will document storage',
      'Basic document vault',
      'Email notifications',
      'PDF download',
      '24/7 customer support'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'Enhanced protection for you and your family',
    price: '$29',
    billingPeriod: 'per month',
    features: [
      'Multiple will document storage',
      'Advanced document vault',
      'Priority email notifications',
      'PDF download & print service',
      'Legal validation check',
      'Annual will review reminder',
      'Premium 24/7 customer support'
    ],
    popular: true
  },
  {
    id: 'platinum',
    name: 'Platinum',
    description: 'Comprehensive estate planning solution',
    price: '$55',
    billingPeriod: 'per month',
    features: [
      'Unlimited will document storage',
      'Unlimited document vault',
      'Priority email & SMS notifications',
      'Advanced PDF customization',
      'Legal validation with expert review',
      'Quarterly will review reminders',
      'Family member access sharing',
      'Estate planning consultation',
      'VIP 24/7 customer support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for businesses & organizations',
    price: 'Custom',
    billingPeriod: 'pricing',
    features: [
      'All Platinum features',
      'Dedicated account manager',
      'Custom legal consultation',
      'Bulk will creation & management',
      'Organization-specific features',
      'API access for integrations',
      'Employee benefit programs',
      'Custom reporting & analytics'
    ]
  }
];

const Subscription: React.FC = () => {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [willId, setWillId] = useState<string | null>(null);
  const [enterpriseFormVisible, setEnterpriseFormVisible] = useState(false);
  const [enterpriseDetails, setEnterpriseDetails] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    employeeCount: '',
    message: ''
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/sign-in');
    } else {
      setIsLoading(false);
    }
  }, [user, authLoading, navigate]);

  // Track progress
  useEffect(() => {
    saveWillProgress(WillCreationStep.PAYMENT);
    
    // Get will ID from localStorage
    const storedWillId = localStorage.getItem('currentWillId');
    if (storedWillId) {
      setWillId(storedWillId);
    }
  }, []);

  // Select plan handler
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    
    // If enterprise plan is selected, show enterprise form
    if (planId === 'enterprise') {
      setEnterpriseFormVisible(true);
    } else {
      // For normal plans, create payment intent
      createPaymentIntent(planId);
    }
  };

  // Handle enterprise form submission
  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setProcessingPayment(true);
    
    try {
      // Submit enterprise request
      const response = await apiRequest('POST', '/api/support/enterprise', enterpriseDetails);
      
      if (!response.ok) {
        throw new Error('Failed to submit enterprise request');
      }
      
      // Show success toast
      toast({
        title: 'Request Submitted',
        description: 'Your enterprise request has been submitted. Our team will contact you shortly.',
      });
      
      // Mark will as completed
      await apiRequest('POST', '/api/user/will-status', {
        willCompleted: true
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting enterprise request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit enterprise request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Create payment intent
  const createPaymentIntent = async (planId: string) => {
    setProcessingPayment(true);
    
    try {
      // Get plan amount based on ID
      let amount = 0;
      switch (planId) {
        case 'starter':
          amount = 1499; // $14.99
          break;
        case 'gold':
          amount = 2900; // $29
          break;
        case 'platinum':
          amount = 5500; // $55
          break;
        default:
          amount = 1499; // Default to starter
      }
      
      // Create payment intent
      const response = await apiRequest('POST', '/api/subscription/checkout', {
        plan: planId,
        amount
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const data = await response.json();
      
      // Set client secret for Stripe
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('No client secret received');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive'
      });
      setSelectedPlan(null);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    try {
      // Mark will as completed
      await apiRequest('POST', '/api/user/will-status', {
        willCompleted: true
      });
      
      // Show success toast
      toast({
        title: 'Payment Successful',
        description: 'Your subscription has been activated. Redirecting to dashboard...',
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error completing will:', error);
      // Still navigate to dashboard as payment was successful
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    toast({
      title: 'Payment Failed',
      description: errorMessage || 'There was an issue processing your payment. Please try again.',
      variant: 'destructive'
    });
    setSelectedPlan(null);
    setClientSecret(null);
  };

  // Handle enterprise form change
  const handleEnterpriseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEnterpriseDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Loading state
  if (isLoading || authLoading) {
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
      
      <div className="container mx-auto px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">Choose Your Protection Plan</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Secure your will and provide peace of mind for your loved ones with our range of comprehensive protection plans.
            </p>
          </div>
          
          {/* Subscription Plans */}
          {!selectedPlan || (selectedPlan === 'enterprise' && enterpriseFormVisible) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + SUBSCRIPTION_PLANS.findIndex(p => p.id === plan.id) * 0.1 }}
                  className="relative"
                >
                  <Card className={`h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-0 right-0 flex justify-center">
                        <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">
                          {plan.billingPeriod}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleSelectPlan(plan.id)} 
                        className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary-dark' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.id === 'enterprise' ? 'Contact Us' : 'Select Plan'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : null}
          
          {/* Enterprise Form */}
          {selectedPlan === 'enterprise' && enterpriseFormVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-2xl font-bold mb-4">Enterprise Inquiry</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please provide your details and we'll have our enterprise team contact you with a custom solution.
              </p>
              
              <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={enterpriseDetails.companyName}
                      onChange={handleEnterpriseChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="contactName"
                      value={enterpriseDetails.contactName}
                      onChange={handleEnterpriseChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={enterpriseDetails.email}
                      onChange={handleEnterpriseChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={enterpriseDetails.phone}
                      onChange={handleEnterpriseChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Employees</label>
                  <input
                    type="text"
                    name="employeeCount"
                    value={enterpriseDetails.employeeCount}
                    onChange={handleEnterpriseChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Information</label>
                  <textarea
                    name="message"
                    value={enterpriseDetails.message}
                    onChange={handleEnterpriseChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  ></textarea>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedPlan(null);
                      setEnterpriseFormVisible(false);
                    }}
                  >
                    Back to Plans
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={processingPayment}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
          
          {/* Payment Form */}
          {selectedPlan && selectedPlan !== 'enterprise' && clientSecret && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Payment Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPlan(null);
                    setClientSecret(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Selected Plan:</span>
                  <span className="font-semibold">
                    {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">Price:</span>
                  <span className="font-semibold">
                    {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.price} {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.billingPeriod}
                  </span>
                </div>
              </div>
              
              <Elements stripe={stripePromise} options={{ clientSecret: clientSecret }}>
                <PaymentForm 
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </Elements>
            </motion.div>
          )}
          
          {/* Features Grid */}
          {!selectedPlan && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-center mb-8">Why Choose WillTank?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Secure Storage</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Your will and documents are encrypted and stored with bank-level security protocols.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Automated Reminders</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Regular check-ins and reminders to keep your will updated as life changes.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Family Access</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Controlled access for your loved ones when they need it most.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Document Vault</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Store important documents alongside your will for complete estate planning.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* FAQ Section */}
          {!selectedPlan && (
            <div className="mt-16 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">How secure is my will and personal information?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your data is protected with bank-level encryption, secure access controls, and regular security audits to ensure maximum protection.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">Can I cancel my subscription at any time?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yes, you can cancel your subscription at any time from your account dashboard. Your documents will remain accessible until the end of your billing period.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">How do my beneficiaries access my will when needed?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You can designate trusted contacts who will receive access instructions when needed. Our system includes verification protocols to ensure only authorized individuals gain access.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Back Button */}
          {!selectedPlan && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/final-review')}
                className="mr-2"
              >
                Back to Review
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Subscription;