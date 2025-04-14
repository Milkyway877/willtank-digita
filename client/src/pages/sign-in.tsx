import React, { useEffect } from 'react';
import { SignIn as ClerkSignIn, useUser } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';

// Check if Clerk is configured
const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Determine if we're in development vs production mode
// For development environment, show alternate auth options
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname === 'willtank.com' || 
   window.location.hostname.endsWith('.willtank.com'));

const isDevelopment = !isProduction;

// In development, we might need to use the legacy auth if Clerk is configured for production
const useAlternateAuth = isDevelopment;

export default function SignInPage() {
  const [, navigate] = useLocation();
  const { isLoaded, isSignedIn, user } = useUser();
  
  // FIXED: If user is already signed in, redirect to the appropriate page
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check if onboarding is completed in user metadata
      const hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding === true;
      
      if (hasCompletedOnboarding) {
        // If onboarding is completed, go to dashboard
        navigate('/dashboard');
      } else {
        // If not completed, go to onboarding
        navigate('/onboarding');
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);
  
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to WillTank</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>
        
        {isClerkConfigured && !useAlternateAuth ? (
          // Production mode with Clerk configured - show Clerk auth UI
          <ClerkSignIn 
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
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
          // Development mode or Clerk not configured - show legacy auth options
          <div className="space-y-4 p-6 text-center">
            {isDevelopment && (
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-md mb-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                  Development Environment Detected
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                  Using legacy authentication for development since Clerk production keys are restricted to willtank.com domain.
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <Button asChild variant="default">
                <Link href="/login">Sign in with Legacy Auth</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Create an Account</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}