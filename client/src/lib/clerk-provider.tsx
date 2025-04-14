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

// FIXED: Proper environment detection with better fallback handling

// Get the Clerk publishable key from environment variables
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Determine hostname for domain-based decisions
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

// Prepare for better environment detection
const isLocalhost = currentHostname === 'localhost' || currentHostname === '127.0.0.1';
const isReplit = currentHostname.includes('.replit.dev') || currentHostname.includes('.repl.co');
const isVercel = currentHostname.includes('.vercel.app');

// Check if we're on willtank.com or a subdomain
const isWillTankDomain = currentHostname === 'willtank.com' || 
                         currentHostname.endsWith('.willtank.com');

// Determine environment more accurately
const isProduction = isWillTankDomain;
const isDevelopment = isLocalhost || isReplit || isVercel || !isProduction;

// FIXED: Configure Clerk only for willtank.com domains
// Always respect the domain restriction to prevent auth errors
const ACTIVE_CLERK_KEY = isWillTankDomain && CLERK_PUBLISHABLE_KEY ? 
                         CLERK_PUBLISHABLE_KEY : 
                         null;

// FIXED: Use more debug logging for clearer diagnostics
console.log(`WillTank starting up on: ${currentHostname}`);
console.log(`VITE_CLERK_PUBLISHABLE_KEY present: ${!!CLERK_PUBLISHABLE_KEY}`);
console.log(`Environment: ${isDevelopment ? 'development' : 'production'}`);
console.log(`Base URL: ${typeof window !== 'undefined' ? window.location.pathname : '/'}`);

// FIXED: Better detection for using legacy auth
const shouldUseLegacyAuth = !isWillTankDomain || !CLERK_PUBLISHABLE_KEY;

// Clearer log message about authentication method
if (shouldUseLegacyAuth) {
  console.log(`Missing Clerk publishable key. Using legacy authentication.`);
}

// Pages that don't require authentication
const publicPages = ['/sign-in', '/sign-up', '/auth', '/', '/login', '/signup', '/privacy', '/terms'];

// This component syncs Clerk user data with our backend
function ClerkUserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useClerkAuth();
  
  useEffect(() => {
    // Only proceed if user is signed in and Clerk is properly loaded
    if (!isLoaded || !isSignedIn || !user) return;
    
    // Sync user data with our backend when they sign in with Clerk
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

// FIXED: This is our custom ClerkProvider that intelligently handles:
// 1. Production domain (willtank.com) - Use full Clerk authentication
// 2. Development environments (localhost, Replit, etc) - Use legacy auth
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  
  // Check if we're on a public page that doesn't need auth
  const isPublicPage = publicPages.some(page => 
    page === location || 
    (page.endsWith('*') && location.startsWith(page.slice(0, -1)))
  );

  // FIXED: Better determination of which auth system to use
  // We should always use legacy auth in development
  if (shouldUseLegacyAuth) {
    // FIXED: Create a mock Clerk provider with a non-triggering key
    // This prevents Clerk API calls while still letting components render
    return (
      <BaseClerkProvider
        publishableKey="pk_test_mock_key_for_legacy_auth"
      >
        {children}
      </BaseClerkProvider>
    );
  }
  
  // We're on willtank.com and have a valid key - use full Clerk auth
  // Different configuration for public vs protected pages
  if (isPublicPage) {
    return (
      <BaseClerkProvider 
        publishableKey={ACTIVE_CLERK_KEY as string}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/onboarding"
        appearance={{
          elements: {
            rootBox: "max-w-md mx-auto",
            card: "shadow-none rounded-lg",
            socialButtonsBlockButton: "border-2 hover:border-blue-500 transition-all",
          }
        }}
      >
        {children}
      </BaseClerkProvider>
    );
  }

  // Protected pages with Clerk authentication
  return (
    <BaseClerkProvider 
      publishableKey={ACTIVE_CLERK_KEY as string}
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
      <ClerkUserSync />
      <>
        <SignedIn>{children}</SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
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