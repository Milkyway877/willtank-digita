import React, { useEffect } from 'react';
import { 
  ClerkProvider as BaseClerkProvider, 
  RedirectToSignIn, 
  SignedIn, 
  SignedOut,
  useUser,
  useAuth as useClerkAuth
} from '@clerk/clerk-react';
import { useLocation, Route } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Get the Clerk publishable key from environment variables
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Determine if we're in development vs production mode
// We check window.location to see if we're on willtank.com
// This ensures we properly handle both environments
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname === 'willtank.com' || 
   window.location.hostname.endsWith('.willtank.com'));

const isDevelopment = !isProduction;

// Configure the proper key based on environment
// For production (willtank.com) - use the production key
// For development - use the development key that works in local/Replit environment
const ACTIVE_CLERK_KEY = CLERK_PUBLISHABLE_KEY;

if (!ACTIVE_CLERK_KEY) {
  console.error('Missing Clerk publishable key for the current environment');
}

// Pages that don't require authentication
const publicPages = ['/sign-in', '/sign-up', '/auth', '/', '/privacy', '/terms'];

// This component syncs Clerk user data with our backend
function ClerkUserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useClerkAuth();
  
  useEffect(() => {
    // Only proceed if the user is signed in and loaded
    if (!isLoaded || !isSignedIn || !user) return;
    
    // Get JWT token
    const syncUserWithBackend = async () => {
      try {
        const token = await getToken();
        
        // Call our backend API to sync the user data
        await apiRequest('POST', '/api/auth/clerk-sync', {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0],
          token
        });
        
        console.log('User data synced with backend');
      } catch (error) {
        console.error('Failed to sync user data with backend:', error);
      }
    };
    
    syncUserWithBackend();
  }, [isLoaded, isSignedIn, user, getToken]);
  
  return null;
}

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const isPublicPage = publicPages.some(page => 
    page === location || 
    (page.endsWith('*') && location.startsWith(page.slice(0, -1)))
  );

  // Clerk configuration checks and fallbacks
  
  // If we don't have a publishable key, always fall back to legacy auth
  if (!ACTIVE_CLERK_KEY) {
    console.error('Clerk publishable key is missing. Falling back to legacy authentication.');
    // Just render the children directly without Clerk's authentication
    // The server-side auth will handle the authentication
    return <>{children}</>;
  }
  
  // In development environments (not on willtank.com domain)
  // Automatically bypass Clerk authentication to avoid domain restriction errors
  if (isDevelopment) {
    console.log('Development environment detected. Using alternative authentication.');
    // Use window.location.pathname here to get users straight to where they need to go
    if (typeof window !== 'undefined' && !isPublicPage) {
      // For protected pages in development, use legacy auth flow
      return <>{children}</>;
    }
  }
  
  // For public pages, we don't need to check authentication
  if (isPublicPage) {
    // Pass through on public pages to show Clerk sign-in/sign-up UI
    return (
      <BaseClerkProvider 
        publishableKey={ACTIVE_CLERK_KEY}
        appearance={{
          elements: {
            rootBox: "max-w-md mx-auto",
            card: "shadow-none rounded-lg"
          }
        }}
      >
        {children}
      </BaseClerkProvider>
    );
  }

  // Configure Clerk provider with proper settings
  return (
    <BaseClerkProvider 
      publishableKey={ACTIVE_CLERK_KEY}
      // Configure for development vs production environments
      appearance={{
        elements: {
          rootBox: isDevelopment ? "max-w-md mx-auto" : undefined,
          card: isDevelopment ? "shadow-none rounded-lg" : undefined
        }
      }}
    >
      <ClerkUserSync />
      {isPublicPage ? (
        children
      ) : (
        <>
          <SignedIn>{children}</SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      )}
    </BaseClerkProvider>
  );
};

// Higher-order component to protect routes
export const withAuth = (Component: React.ComponentType) => {
  return function ProtectedRoute(props: any) {
    return (
      <SignedIn>
        <Component {...props} />
      </SignedIn>
    );
  };
};