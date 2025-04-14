import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  // Use only Clerk's authentication
  const { isLoaded, isSignedIn, user } = useUser();
  
  if (!isLoaded) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If not authenticated, redirect to sign-in
  if (!isSignedIn) {
    return (
      <Route path={path}>
        <RedirectToSignIn />
      </Route>
    );
  }
  
  // Only redirect NEW USERS to onboarding, not returning users
  const isOnboardingPath = path === '/onboarding';
  
  // Check creation date to determine if this is a new user
  const createdAt = user?.createdAt?.getTime();
  const isNewUser = createdAt && (new Date().getTime() - createdAt < 86400000); // Within 24 hours
  
  // Check if onboarding has been completed through metadata
  const hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding === true;
  
  // Redirect to onboarding if needed
  if (
    !hasCompletedOnboarding && 
    isNewUser && 
    !isOnboardingPath && 
    // Don't redirect from these paths
    path !== '/subscription' && 
    path !== '/pricing'
  ) {
    return (
      <Route path={path}>
        <Redirect to="/onboarding" />
      </Route>
    );
  }

  // Show the protected component
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}