import React, { Suspense, lazy, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import UnfinishedWillNotification from "@/components/UnfinishedWillNotification";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthRouter from "@/pages/auth";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";

// Log critical environment information for debugging
console.log(`WillTank starting up on: ${window.location.hostname}`);
console.log(`VITE_CLERK_PUBLISHABLE_KEY present: ${!!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}`);
console.log(`Environment: ${import.meta.env.DEV ? 'development' : 'production'}`);
console.log(`Base URL: ${import.meta.env.BASE_URL}`);

// Add a global error handler to catch Clerk errors
window.addEventListener('error', function(event) {
  console.error('Global error caught:', event.error);
  // If it's a Clerk error, show a more helpful message
  if (event.error?.message?.includes('Clerk') || event.message?.includes('Clerk')) {
    console.warn('Detected Clerk error. Authentication may fall back to legacy mode.');
  }
});
import OnboardingContainer from "@/components/onboarding/OnboardingContainer";
import Dashboard from "@/pages/Dashboard";
import DashboardIndex from "@/pages/dashboard";
import DashboardCheckIn from "@/pages/dashboard/check-in";
import DashboardWill from "@/pages/dashboard/will";
import DashboardDocuments from "@/pages/dashboard/documents";
import DashboardVideo from "@/pages/dashboard/video";
import DashboardBeneficiaries from "@/pages/dashboard/beneficiaries";
import DashboardDelivery from "@/pages/dashboard/delivery";
import DashboardReminders from "@/pages/dashboard/reminders";
import DashboardBilling from "@/pages/dashboard/billing";
import DashboardTrust from "@/pages/dashboard/trust";
import DashboardSettings from "@/pages/dashboard/settings";
import VideoTestimonyPage from "@/pages/dashboard/video-testimony";
import ViewWillDetails from "@/pages/ViewWillDetails";
import SubscriptionPage from "@/pages/subscription";
import PricingPage from "@/pages/PricingPage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import TemplateSelection from "@/pages/TemplateSelection";
import AiChat from "@/pages/AiChat";
import DocumentUpload from "@/pages/DocumentUpload";
import VideoRecording from "@/pages/VideoRecording";
import FinalReview from "@/pages/FinalReview";
import Completion from "@/pages/Completion";
import EmailTest from "@/pages/EmailTest";
// Removed legacy AuthProvider - using only Clerk for authentication
import { NotificationsProvider } from "@/hooks/use-notifications";
import { TwoFactorProvider } from "@/hooks/use-2fa";
import { SkylerProvider } from "@/hooks/use-skyler";
import { ProtectedRoute } from "./lib/protected-route";
import { ClerkProvider } from "./lib/clerk-provider";

// Import Clerk-based sign-in and sign-up pages
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Clerk authentication routes */}
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/sign-in" component={SignInPage} />
      <ProtectedRoute path="/onboarding" component={OnboardingContainer} />
      <ProtectedRoute path="/pricing" component={PricingPage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
      <ProtectedRoute path="/dashboard" component={DashboardIndex} />
      <ProtectedRoute path="/dashboard/check-in" component={DashboardCheckIn} />
      <ProtectedRoute path="/dashboard/will" component={DashboardWill} />
      <ProtectedRoute path="/dashboard/documents" component={DashboardDocuments} />
      <ProtectedRoute path="/dashboard/video" component={DashboardVideo} />
      <ProtectedRoute path="/dashboard/beneficiaries" component={DashboardBeneficiaries} />
      <ProtectedRoute path="/dashboard/delivery" component={DashboardDelivery} />
      <ProtectedRoute path="/dashboard/reminders" component={DashboardReminders} />
      <ProtectedRoute path="/dashboard/billing" component={DashboardBilling} />
      <ProtectedRoute path="/dashboard/trust" component={DashboardTrust} />
      <ProtectedRoute path="/dashboard/settings" component={DashboardSettings} />
      <ProtectedRoute path="/dashboard/video-testimony" component={VideoTestimonyPage} />
      <ProtectedRoute path="/view-will-details" component={ViewWillDetails} />
      <ProtectedRoute path="/template-selection" component={TemplateSelection} />
      <ProtectedRoute path="/ai-chat" component={AiChat} />
      <ProtectedRoute path="/document-upload" component={DocumentUpload} />
      <ProtectedRoute path="/video-recording" component={VideoRecording} />
      <ProtectedRoute path="/final-review" component={FinalReview} />
      <ProtectedRoute path="/completion" component={Completion} />
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
      <ClerkProvider>
        <NotificationsProvider>
          <TwoFactorProvider>
            <SkylerProvider>
              <Router />
              <UnfinishedWillNotification />
              <Toaster />
            </SkylerProvider>
          </TwoFactorProvider>
        </NotificationsProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}

export default App;
