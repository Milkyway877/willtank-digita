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
  
  // All authorized users go directly to the dashboard
  const isDashboardPath = path.startsWith('/dashboard');
  
  // Redirect all authenticated users to dashboard if not already on a dashboard page
  if (user && user.isEmailVerified && !isDashboardPath) {
    return (
      <Route path={path}>
        <Redirect to="/dashboard" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}