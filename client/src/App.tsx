import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthRouter from "@/pages/auth";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import Dashboard from "@/pages/Dashboard";
import DashboardIndex from "@/pages/dashboard";
import DashboardCheckIn from "@/pages/dashboard/check-in";
import DashboardDocuments from "@/pages/dashboard/documents";
import DashboardVideo from "@/pages/dashboard/video";
import DashboardBeneficiaries from "@/pages/dashboard/beneficiaries";
import DashboardDelivery from "@/pages/dashboard/delivery";
import DashboardReminders from "@/pages/dashboard/reminders";
import DashboardBilling from "@/pages/dashboard/billing";
import DashboardTrust from "@/pages/dashboard/trust";
import DashboardSettings from "@/pages/dashboard/settings";
import VideoTestimonyPage from "@/pages/dashboard/video-testimony";
import SubscriptionPage from "@/pages/subscription";
import PricingPage from "@/pages/PricingPage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import Subscription from "@/pages/Subscription";
import EmailTest from "@/pages/EmailTest";
import { AuthProvider } from "@/hooks/use-auth";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { TwoFactorProvider } from "@/hooks/use-2fa";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthRouter} />
      <Route path="/auth/*" component={AuthRouter} />
      {/* Direct routes to auth components for easier testing */}
      <Route path="/signup">
        <SignUp />
      </Route>
      <Route path="/login">
        <SignIn />
      </Route>
      
      {/* Subscription */}
      <ProtectedRoute path="/pricing" component={PricingPage} />
      <ProtectedRoute path="/subscription" component={Subscription} />
      <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
      
      {/* Dashboard - User Hub */}
      <ProtectedRoute path="/dashboard" component={DashboardIndex} />
      <ProtectedRoute path="/dashboard/check-in" component={DashboardCheckIn} />
      <ProtectedRoute path="/dashboard/documents" component={DashboardDocuments} />
      <ProtectedRoute path="/dashboard/video" component={DashboardVideo} />
      <ProtectedRoute path="/dashboard/beneficiaries" component={DashboardBeneficiaries} />
      <ProtectedRoute path="/dashboard/delivery" component={DashboardDelivery} />
      <ProtectedRoute path="/dashboard/reminders" component={DashboardReminders} />
      <ProtectedRoute path="/dashboard/billing" component={DashboardBilling} />
      <ProtectedRoute path="/dashboard/trust" component={DashboardTrust} />
      <ProtectedRoute path="/dashboard/settings" component={DashboardSettings} />
      <ProtectedRoute path="/dashboard/video-testimony" component={VideoTestimonyPage} />
      
      {/* Email Test Route - For development testing only */}
      <Route path="/email-test" component={EmailTest} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <TwoFactorProvider>
            <Router />
            <Toaster />
          </TwoFactorProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
