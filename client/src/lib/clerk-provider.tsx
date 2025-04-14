import React from 'react';
// Import is kept for compatibility but we're not using these components yet
// Will re-enable when we have valid Clerk keys
import { 
  ClerkProvider as BaseClerkProvider, 
  RedirectToSignIn, 
  SignedIn, 
  SignedOut,
  useUser,
  useAuth as useClerkAuth
} from '@clerk/clerk-react';
import { useLocation } from 'wouter';

// TEMPORARY DISABLED CLERK INTEGRATION
// This will be re-enabled when proper Clerk API keys are provided
// The file structure is kept intact for easy re-enabling later

const publicPages = ['/sign-in', '/sign-up', '/auth', '/', '/privacy', '/terms'];

// Temporary mock function until Clerk is properly integrated
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  // Just pass the children through without Clerk wrapping
  return <>{children}</>;
};

// Temporary mock HOC that just returns the component
// Will be replaced with real Clerk auth when properly configured
export const withAuth = (Component: React.ComponentType) => {
  return function ProtectedRoute(props: any) {
    return <Component {...props} />;
  };
};