import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CreditCard, Shield, Check, ArrowLeft, BadgeCheck, CreditCardIcon, Clock, Star, AlertCircle, Plus, Users } from 'lucide-react';
import { useLocation } from 'wouter';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isCurrent: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  brand: string;
  isDefault: boolean;
}

const BillingPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      billingCycle: 'monthly',
      features: [
        'Create and store one will',
        'Annual reminders',
        'Basic document storage',
        'Email support'
      ],
      isCurrent: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      billingCycle: 'monthly',
      features: [
        'Create and store multiple wills',
        'Unlimited reminders & check-ins',
        'Unlimited document storage',
        'Priority support',
        'Multiple beneficiaries',
        'Advanced delivery options'
      ],
      isCurrent: true
    },
    {
      id: 'family',
      name: 'Family Plan',
      price: 19.99,
      billingCycle: 'monthly',
      features: [
        'Up to 5 family members',
        'All Premium features',
        'Shared document storage',
        'Family dashboard',
        'Estate planning consultation',
        '24/7 priority support'
      ],
      isCurrent: false
    }
  ]);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'card_1',
      type: 'card',
      lastFour: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      brand: 'Visa',
      isDefault: true
    }
  ]);
  
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [isPlanChanging, setIsPlanChanging] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const handleAddPayment = () => {
    // In a real implementation, this would integrate with Stripe or another payment processor
    setShowAddPayment(true);
  };
  
  const handleChangePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsPlanChanging(true);
  };
  
  const handleConfirmPlanChange = () => {
    if (selectedPlan) {
      // Update plans
      setPlans(plans.map(p => ({
        ...p,
        isCurrent: p.id === selectedPlan.id
      })));
      
      // Reset UI state
      setIsPlanChanging(false);
      setSelectedPlan(null);
    }
  };
  
  const handleCancelPlanChange = () => {
    setIsPlanChanging(false);
    setSelectedPlan(null);
  };
  
  const currentPlan = plans.find(p => p.isCurrent);
  
  return (
    <DashboardLayout title="Plan & Billing">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Current Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <BadgeCheck className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Current Plan</h3>
              </div>
            </div>
            
            <div className="p-6">
              {currentPlan && (
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 dark:text-white">{currentPlan.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        ${currentPlan.price} / {currentPlan.billingCycle}
                      </p>
                    </div>
                    
                    <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-green-700 dark:text-green-400 text-sm font-medium">
                      Active
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-800 dark:text-white mb-3">Plan Features</h5>
                    <ul className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-800 dark:text-white mb-3">Billing Cycle</h5>
                    <div className="flex items-center space-x-4">
                      <div className={`px-4 py-2 rounded-lg cursor-pointer border ${
                        currentPlan.billingCycle === 'monthly' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}>
                        Monthly
                      </div>
                      <div className={`px-4 py-2 rounded-lg cursor-pointer border ${
                        currentPlan.billingCycle === 'yearly' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}>
                        Yearly <span className="text-green-500 text-xs">Save 20%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <button 
                      onClick={() => navigate('/pricing')}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      View Pricing Plans
                    </button>
                    
                    {currentPlan.price > 0 && (
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors">
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Payment Methods</h3>
              </div>
              
              <button 
                onClick={handleAddPayment}
                className="text-primary hover:text-primary-dark text-sm transition-colors"
              >
                + Add New
              </button>
            </div>
            
            <div className="p-6">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <CreditCardIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Payment Methods</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                    Add a payment method to subscribe to a premium plan or make payments.
                  </p>
                  <button
                    onClick={handleAddPayment}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                          <CreditCardIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {method.brand} •••• {method.lastFour}
                            </h4>
                            {method.isDefault && (
                              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3 sm:mt-0">
                        <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                          Edit
                        </button>
                        <button className="text-sm text-red-500 hover:text-red-600 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showAddPayment && (
                <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-4">Add Payment Method</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    In a real implementation, this would integrate with Stripe Elements or another payment processor.
                  </p>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setShowAddPayment(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Billing History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                Billing History
              </h3>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">May 1, 2024</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Premium Plan (Monthly)</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">$9.99</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                          Paid
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Apr 1, 2024</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Premium Plan (Monthly)</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">$9.99</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                          Paid
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Plan Comparison or Change Plan Section */}
        <div>
          {isPlanChanging ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Change Your Plan
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {plans.filter(p => !p.isCurrent).map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlan?.id === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center ${
                          selectedPlan?.id === plan.id
                            ? 'border-primary'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedPlan?.id === plan.id && (
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-800 dark:text-white">{plan.name}</h4>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              ${plan.price}/{plan.billingCycle}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                <Check className="h-4 w-4 text-green-500 mr-1 flex-shrink-0 mt-0.5" />
                                {feature}
                              </li>
                            ))}
                            {plan.features.length > 3 && (
                              <li className="text-sm text-gray-500 dark:text-gray-400 pl-5">
                                +{plan.features.length - 3} more features
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedPlan && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      You are changing from <span className="font-medium">{currentPlan?.name}</span> to <span className="font-medium">{selectedPlan.name}</span>.
                      {selectedPlan.price > (currentPlan?.price || 0) ? (
                        ' You will be charged the difference immediately.'
                      ) : selectedPlan.price < (currentPlan?.price || 0) ? (
                        ' Your account will be credited with the difference.'
                      ) : (
                        ' There will be no change in billing.'
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleConfirmPlanChange}
                    disabled={!selectedPlan}
                    className={`px-4 py-2 rounded-md ${
                      !selectedPlan
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    Confirm Change
                  </button>
                  <button
                    onClick={handleCancelPlanChange}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  Plan Benefits
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Star className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Premium Features</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Unlock advanced features with our Premium and Family plans, including multiple wills and unlimited document storage.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Enhanced Security</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Premium plans include enhanced security features and unlimited backup options for your important documents.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Family Protection</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Our Family plan covers up to 5 family members, perfect for ensuring everyone's future is secure.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">Need Help?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Our support team is ready to assist you with any billing questions or plan changes.
                  </p>
                  <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;