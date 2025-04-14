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

// PRODUCTION-READY ClerkProvider with proper routing and auth flow
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, navigate] = useLocation();
  
  // Check if we're on a public page that doesn't need auth
  const isPublicPage = publicPages.some(page => 
    page === location || 
    (page.endsWith('*') && location.startsWith(page.slice(0, -1)))
  );

  // For development or non-willtank.com domains, use legacy auth
  if (shouldUseLegacyAuth) {
    console.log('Using legacy authentication for non-willtank.com domain or development environment');
    // Mock Clerk provider with a non-triggering key
    return (
      <BaseClerkProvider
        publishableKey="pk_test_mock_key_for_legacy_auth"
      >
        {children}
      </BaseClerkProvider>
    );
  }
  
  // Configuration for all pages when using Clerk authentication
  // ✅ CRITICAL FIX: Use consistent paths and routes for Clerk
  return (
    <BaseClerkProvider 
      publishableKey={ACTIVE_CLERK_KEY as string}
      // ✅ FIXED: Removed navigate prop as it's incompatible with this version
      // Instead using the proper routing configuration
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard" 
      afterSignUpUrl="/onboarding"
      appearance={{
        elements: {
          rootBox: "max-w-md mx-auto",
          card: "shadow-none rounded-lg",
          socialButtonsBlockButton: "border-2 hover:border-blue-500 transition-all",
          socialButtonsProviderIcon__google: "w-5 h-5",
        }
      }}
    >
      {/* Always sync user data with our backend */}
      <ClerkUserSync />
      
      {/* Public pages don't need auth guards */}
      {isPublicPage ? (
        children
      ) : (
        /* Protected pages get proper auth guards */
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

// ✅ FIXED: Function component to improve Fast Refresh compatibility
export function withAuth(Component: React.ComponentType): React.FC<any> {
  const ProtectedRoute: React.FC<any> = (props) => {
    return (
      <SignedIn>
        <Component {...props} />
      </SignedIn>
    );
  };
  
  // Maintain the same name as the wrapped component for better debugging
  ProtectedRoute.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return ProtectedRoute;
};