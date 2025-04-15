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
  
  // New Simplified Flow - Redirect based on will creation status
  const isDashboardPath = path.startsWith('/dashboard');
  const isWelcomePath = path === '/welcome';
  const isTemplatePath = path === '/will-selection';
  const isCreateWillPath = path === '/create-will';
  
  // If user has completed a will, make sure they reach dashboard
  if (user && user.isEmailVerified && user.willCompleted && !isDashboardPath && 
      !isWelcomePath && !isTemplatePath && !isCreateWillPath) {
    return (
      <Route path={path}>
        <Redirect to="/dashboard" />
      </Route>
    );
  }
  
  // If user has a will in progress, send them back to will creation
  if (user && user.isEmailVerified && user.willInProgress && !user.willCompleted && 
      !isCreateWillPath && path !== '/welcome' && !isDashboardPath) {
    return (
      <Route path={path}>
        <Redirect to="/create-will" />
      </Route>
    );
  }
  
  // New user - direct to welcome page
  const isNewUser = user?.createdAt && (new Date().getTime() - new Date(user.createdAt).getTime() < 86400000); // Within 24 hours
  if (user && user.isEmailVerified && isNewUser && !user.willInProgress && !user.willCompleted && 
      path !== '/welcome' && !isTemplatePath && !isCreateWillPath) {
    return (
      <Route path={path}>
        <Redirect to="/welcome" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}