import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

// Check if Clerk is configured
const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function SignUpPage() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join WillTank</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your account</p>
        </div>
        
        {isClerkConfigured ? (
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
        ) : (
          <div className="space-y-4 p-6 text-center">
            <p className="text-amber-600 dark:text-amber-400">
              Clerk authentication is not configured yet.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild variant="default">
                <Link href="/signup">Sign up with Legacy Auth</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Already have an account? Sign in</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}