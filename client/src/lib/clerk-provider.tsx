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

// Determine hostname for domain-based decisions
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

// Check if we're on willtank.com or a subdomain
const isWillTankDomain = currentHostname === 'willtank.com' || 
                         currentHostname.endsWith('.willtank.com');

// Determine if we're in development vs production mode
const isProduction = isWillTankDomain;
const isDevelopment = !isProduction;

// Configure the proper key - only use Clerk on willtank.com domains
// This prevents domain restriction errors
const ACTIVE_CLERK_KEY = isWillTankDomain ? CLERK_PUBLISHABLE_KEY : null;

// Always log the environment for debugging
console.log(`Running in ${isDevelopment ? 'development' : 'production'} mode`);
console.log(`Host: ${currentHostname}`);
console.log(`Using WillTank domain: ${isWillTankDomain}`);
console.log(`Clerk enabled: ${!!ACTIVE_CLERK_KEY}`);

// Handle missing key case
if (!ACTIVE_CLERK_KEY) {
  console.warn('Clerk is disabled for this domain or missing publishable key');
  console.warn('Using legacy authentication instead');
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

// Create a mock Clerk context to use when we don't have access to real Clerk
// This is necessary to prevent errors with hooks like useUser() in components
const createMockClerkContext = () => {
  return {
    user: null,
    isSignedIn: false,
    isLoaded: true,
    getToken: async () => null,
    session: null,
    signOut: async () => {},
  };
};

// This is our custom ClerkProvider that handles multiple authentication scenarios
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, navigate] = useLocation();
  const isPublicPage = publicPages.some(page => 
    page === location || 
    (page.endsWith('*') && location.startsWith(page.slice(0, -1)))
  );

  // Detect environments that can't use Clerk (non-willtank.com or missing key)
  const shouldUseLegacyAuth = !ACTIVE_CLERK_KEY || !isWillTankDomain;
  
  // If we need to use legacy auth, provide a simplified mock of the Clerk context
  if (shouldUseLegacyAuth) {
    const reason = !ACTIVE_CLERK_KEY 
      ? 'Missing Clerk publishable key' 
      : 'Non-willtank.com domain';
      
    console.log(`${reason}. Using legacy authentication.`);
    
    // Create a basic mock of ClerkProvider to allow useUser() hooks to work
    // This prevents component errors while still using legacy auth
    // Note: We're using regular publishableKey without mock in newer Clerk versions
    return (
      <BaseClerkProvider
        publishableKey="pk_test_mock_key_for_legacy_auth"
      >
        {children}
      </BaseClerkProvider>
    );
  }
  
  // Navigation handler is no longer needed with newer Clerk version
  // Custom routing is handled at the component level instead
  
  // For public pages, we don't need to check authentication
  if (isPublicPage) {
    // Pass through on public pages to show Clerk sign-in/sign-up UI
    return (
      <BaseClerkProvider 
        publishableKey={ACTIVE_CLERK_KEY}
        // Set all the redirect URLs without passing navigate prop
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/onboarding"
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
      // Set all the redirect URLs without passing navigate prop
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
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