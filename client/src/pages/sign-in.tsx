import React, { useEffect } from 'react';
import { SignIn as ClerkSignIn, useUser } from '@clerk/clerk-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';

// Check if Clerk is configured
const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ✅ FIXED: Improved environment detection for proper behavior
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalhost = currentHostname === 'localhost' || currentHostname === '127.0.0.1';
const isReplit = currentHostname.includes('.replit.dev') || currentHostname.includes('.repl.co');
const isVercel = currentHostname.includes('.vercel.app');
const isWillTankDomain = currentHostname === 'willtank.com' || currentHostname.endsWith('.willtank.com');

// Production is specifically on willtank.com domains
const isProduction = isWillTankDomain;
const isDevelopment = isLocalhost || isReplit || isVercel || !isProduction;

// ✅ FIXED: Use legacy auth if not on willtank.com domain
const useAlternateAuth = !isWillTankDomain;

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
        
        <div>
          {/* Add clear instructions for Google sign-in */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-left">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Using Google Sign-In</h3>
            <ol className="list-decimal ml-5 mt-1 text-xs text-blue-700 dark:text-blue-400">
              <li>Click "Continue with Google" below</li>
              <li>Select your Google account</li>
              <li>Accept the terms if prompted</li>
              <li>You'll be automatically redirected to the dashboard (or onboarding for new users)</li>
            </ol>
          </div>
          
          <ClerkSignIn 
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
            routing="path"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                footerActionLink: 'text-blue-600 hover:text-blue-800',
                card: 'shadow-none',
                socialButtonsBlockButton: 'border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all',
                socialButtonsBlockButtonText: 'font-medium',
                socialButtonsProviderIcon__google: 'w-5 h-5',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}