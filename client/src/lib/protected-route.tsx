import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

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
        <Redirect to="/auth/sign-in" />
      </Route>
    );
  }

  // If user exists but email is not verified, redirect to verification
  if (user && !user.isEmailVerified) {
    return (
      <Route path={path}>
        <Redirect to={`/auth/verify/${encodeURIComponent(user.username)}`} />
      </Route>
    );
  }
  
  // Only redirect NEW USERS to onboarding, not returning users
  // Use createdAt timestamp to determine if this is a first-time login
  const isOnboardingPath = path === '/onboarding';
  const isNewUser = user?.createdAt && (new Date().getTime() - new Date(user.createdAt).getTime() < 86400000); // Within 24 hours
  
  if (
    user && 
    user.isEmailVerified && 
    !user.hasCompletedOnboarding && 
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