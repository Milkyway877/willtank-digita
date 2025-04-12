import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthRouter from "@/pages/auth";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { useEffect } from "react";

// Route that redirects based on authentication and onboarding status
function ConditionalRoute() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, go to landing page
        setLocation("/");
      } else if (!user.completedOnboarding) {
        // Logged in but hasn't completed onboarding
        setLocation("/onboarding");
      } else {
        // Logged in and has completed onboarding
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/*" component={AuthRouter} />
      <ProtectedRoute path="/onboarding" component={Onboarding} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <Route path="/redirect" component={ConditionalRoute} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
