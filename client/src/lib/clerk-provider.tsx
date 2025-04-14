import React from 'react';
import { ClerkProvider as BaseClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useLocation, Route } from 'wouter';

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

const publicPages = ['/sign-in', '/sign-up', '/auth', '/'];

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const isPublicPage = publicPages.includes(location);

  return (
    <BaseClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
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