import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import UnfinishedWillNotification from "@/components/UnfinishedWillNotification";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Welcome from "@/pages/Welcome";
import AuthRouter from "@/pages/auth";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import Dashboard from "@/pages/Dashboard";
import DashboardIndex from "@/pages/dashboard";
import DashboardCheckIn from "@/pages/dashboard/check-in";
import DashboardWill from "@/pages/dashboard/will";
import DashboardWills from "@/pages/dashboard/wills";
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
import Subscription from "@/pages/Subscription";
// Use the completely new AiChat component
import AiChat from "@/pages/AiChat";
import DocumentUpload from "@/pages/DocumentUpload";
import ContactInformation from "@/pages/ContactInformation";
import VideoRecording from "@/pages/VideoRecording";
import FinalReview from "@/pages/FinalReview";
import Completion from "@/pages/Completion";
import EmailTest from "@/pages/EmailTest";
import { AuthProvider } from "@/hooks/use-auth";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { TwoFactorProvider } from "@/hooks/use-2fa";
import { SkylerProvider } from "@/hooks/use-skyler";
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
      
      {/* New Simplified Flow */}
      <ProtectedRoute path="/welcome" component={Welcome} />
      <ProtectedRoute path="/will-selection" component={TemplateSelection} />
      
      {/* New Structured Will Creation Flow - PART 1-8 */}
      <ProtectedRoute path="/will-creation/chat" component={AiChat} />
      <ProtectedRoute path="/will-creation/documents" component={DocumentUpload} />
      <ProtectedRoute path="/will-creation/contacts" component={ContactInformation} />
      <ProtectedRoute path="/will-creation/video" component={VideoRecording} />
      <ProtectedRoute path="/will-creation/preview" component={FinalReview} />
      <ProtectedRoute path="/will-creation/payment" component={Subscription} />
      
      {/* Legacy routes - kept for backwards compatibility */}
      <ProtectedRoute path="/create-will" component={AiChat} />
      <ProtectedRoute path="/document-upload" component={DocumentUpload} />
      <ProtectedRoute path="/contact-information" component={ContactInformation} />
      <ProtectedRoute path="/video-recording" component={VideoRecording} />
      <ProtectedRoute path="/final-review" component={FinalReview} />
      
      {/* Subscription */}
      <ProtectedRoute path="/pricing" component={PricingPage} />
      <ProtectedRoute path="/subscription" component={Subscription} />
      <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
      
      {/* Dashboard - User Hub */}
      <ProtectedRoute path="/dashboard" component={DashboardIndex} />
      <ProtectedRoute path="/dashboard/check-in" component={DashboardCheckIn} />
      <ProtectedRoute path="/dashboard/will" component={DashboardWill} />
      <ProtectedRoute path="/dashboard/wills" component={DashboardWills} />
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
      
      {/* Legacy routes - kept for backwards compatibility */}
      <ProtectedRoute path="/ai-chat" component={AiChat} />
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
      <AuthProvider>
        <NotificationsProvider>
          <TwoFactorProvider>
            <SkylerProvider>
              <Router />
              <UnfinishedWillNotification />
              <Toaster />
            </SkylerProvider>
          </TwoFactorProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
