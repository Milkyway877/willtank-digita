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
  
  // If user exists, email is verified, but onboarding is not completed
  // and they're not already on the onboarding path, redirect to onboarding
  const isOnboardingPath = path === '/onboarding';
  if (
    user && 
    user.isEmailVerified && 
    !user.hasCompletedOnboarding && 
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