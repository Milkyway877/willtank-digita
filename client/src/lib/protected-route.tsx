import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useUser } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  // Use both our existing auth and Clerk's authentication during transition
  const { user: legacyUser, isLoading: legacyLoading } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn, user: clerkUser } = useUser();

  // During migration, check both auth systems
  const isLoading = legacyLoading || !clerkLoaded;
  // Prioritize Clerk user if available
  const user = isSignedIn ? clerkUser : legacyUser;
  
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If no user is authenticated in either system, redirect to sign-in
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/sign-in" />
      </Route>
    );
  }

  // If using Clerk, email verification is handled automatically
  const isEmailVerified = isSignedIn ? true : (legacyUser?.isEmailVerified || false);

  // If user exists but email is not verified, redirect to verification (legacy only)
  if (!isEmailVerified) {
    return (
      <Route path={path}>
        <Redirect to={`/auth/verify/${encodeURIComponent(legacyUser?.username || '')}`} />
      </Route>
    );
  }
  
  // Only redirect NEW USERS to onboarding, not returning users
  const isOnboardingPath = path === '/onboarding';
  
  // For Clerk users, check creation date
  const clerkCreatedAt = clerkUser?.createdAt?.getTime();
  const legacyCreatedAt = legacyUser?.createdAt ? new Date(legacyUser.createdAt).getTime() : null;
  const createdAt = clerkCreatedAt || legacyCreatedAt;
  
  const isNewUser = createdAt && (new Date().getTime() - createdAt < 86400000); // Within 24 hours
  
  // Check if onboarding has been completed
  const hasCompletedOnboarding = isSignedIn 
    ? clerkUser.publicMetadata?.hasCompletedOnboarding === true
    : legacyUser?.hasCompletedOnboarding;
  
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