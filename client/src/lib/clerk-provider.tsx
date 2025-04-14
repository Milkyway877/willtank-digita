import React, { useEffect } from 'react';
import { 
  ClerkProvider as BaseClerkProvider, 
  RedirectToSignIn, 
  SignedIn, 
  SignedOut,
  useUser,
  useAuth as useClerkAuth
} from '@clerk/clerk-react';
import { apiRequest } from '@/lib/queryClient';
// Import public routes from middleware
import publicRoutes from '../middleware';

// Get the Clerk publishable key from environment variables
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('CLERK_PUBLISHABLE_KEY is required for authentication. Please check your environment variables.');
}

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

// Clean, production-ready ClerkProvider with proper routing and auth flow
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  // Current location path for public pages check
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  // Check if we're on a public page that doesn't need auth
  const isPublicPage = publicRoutes.some(page => 
    page === currentPath || 
    (page.endsWith('*') && currentPath.startsWith(page.slice(0, -1)))
  );
  
  return (
    <BaseClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
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

// Helper component for protecting routes
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