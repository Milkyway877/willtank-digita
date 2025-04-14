import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
// Import commented out until Clerk is properly configured
// import { useUser, useClerk } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  // Temporarily only use our existing auth system until Clerk is properly configured
  const { user: legacyUser, isLoading: legacyLoading } = useAuth();

  // Only use legacy auth for now
  const isLoading = legacyLoading;
  const user = legacyUser;
  
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  // Check if email is verified
  const isEmailVerified = user?.isEmailVerified || false;

  // If user exists but email is not verified, redirect to verification
  if (!isEmailVerified) {
    return (
      <Route path={path}>
        <Redirect to={`/auth/verify/${encodeURIComponent(user?.username || '')}`} />
      </Route>
    );
  }
  
  // Only redirect NEW USERS to onboarding, not returning users
  const isOnboardingPath = path === '/onboarding';
  
  // Check creation date for new user
  const createdAt = user?.createdAt ? new Date(user.createdAt).getTime() : null;
  const isNewUser = createdAt && (new Date().getTime() - createdAt < 86400000); // Within 24 hours
  
  // Check if onboarding has been completed
  const hasCompletedOnboarding = user?.hasCompletedOnboarding;
  
  if (
    user && 
    isEmailVerified && 
    !hasCompletedOnboarding && 
    isNewUser && // Only redirect if it's a new user
    !isOnboardingPath && 
    // Don't redirect in specific paths that are okay to visit before onboarding
    !/^\/auth/.test(path) && 
    path !== '/subscription' && 
    path !== '/pricing'
  ) {
    return (
      <Route path={path}>
        <Redirect to="/onboarding" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}