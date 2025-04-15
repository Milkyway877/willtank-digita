import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Confirm payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: 'if_required'
    });

    if (error) {
      // Payment failed
      setErrorMessage(error.message || 'An unexpected error occurred.');
      onPaymentError(error.message || 'An unexpected error occurred.');
    } else {
      // Payment succeeded
      onPaymentSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Show any error or success messages */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 p-4 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}
      
      {/* Payment Element */}
      <div className="mb-6">
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            }
          }}
        />
      </div>
      
      {/* Address Element */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Billing Address</h3>
        <AddressElement 
          options={{
            mode: 'billing',
            defaultValues: {
              name: '',
            },
            fields: {
              phone: 'optional',
            },
          }}
        />
      </div>
      
      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
      
      {/* Privacy notice */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        Your payment information is securely processed by Stripe. We never store your full card details.
      </p>
    </form>
  );
};

export default PaymentForm;