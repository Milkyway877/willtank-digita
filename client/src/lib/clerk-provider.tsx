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

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

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

  return (
    <BaseClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
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