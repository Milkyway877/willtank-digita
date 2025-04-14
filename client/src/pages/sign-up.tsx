import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { useLocation } from 'wouter';

export default function SignUpPage() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join WillTank</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your account</p>
        </div>
        
        <ClerkSignUp 
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/onboarding"
          routing="path"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              footerActionLink: 'text-blue-600 hover:text-blue-800',
              card: 'shadow-none',
            },
          }}
        />
      </div>
    </div>
  );
}