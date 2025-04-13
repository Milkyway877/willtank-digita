import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

/**
 * A component for testing Stripe integration
 * This component is for development purposes only and should be removed in production
 */
export default function StripeTest() {
  const { toast } = useToast();
  
  // Fetch subscription plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/subscription/plans'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/subscription/plans');
        if (!res.ok) throw new Error('Failed to fetch plans');
        return res.json();
      } catch (error) {
        console.error('Error fetching plans:', error);
        return [];
      }
    }
  });
  
  // Test checkout session creation
  const handleTestCheckout = async () => {
    try {
      const response = await apiRequest('POST', '/api/subscription/checkout', {
        planType: 'starter',
        interval: 'month',
        successUrl: window.location.origin + '/subscription/success',
        cancelUrl: window.location.origin + '/pricing'
      });
      
      const data = await response.json();
      
      if (data.url) {
        toast({
          title: 'Checkout session created',
          description: 'Redirecting to Stripe checkout page'
        });
        
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'Failed to create checkout session'
      });
    }
  };
  
  return (
    <div className="p-6 border rounded-md bg-gray-50 dark:bg-gray-800 space-y-4">
      <h3 className="text-lg font-medium">Stripe Integration Test</h3>
      
      <div className="space-y-2">
        <h4 className="font-medium">Subscription Plans</h4>
        {isLoading ? (
          <p>Loading plans...</p>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((plan: any) => (
              <div key={plan.id} className="p-3 border rounded-md">
                <p className="font-medium">{plan.name}</p>
                <p className="text-sm text-gray-500">Monthly: ${typeof plan.prices.month === 'number' ? plan.prices.month : 'Custom'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No plans available or failed to load plans</p>
        )}
      </div>
      
      <div>
        <Button onClick={handleTestCheckout}>
          Test Stripe Checkout
        </Button>
      </div>
    </div>
  );
}