import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import UnfinishedWillNotification from "@/components/UnfinishedWillNotification";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthRouter from "@/pages/auth";
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
import TemplateSelection from "@/pages/TemplateSelection";
import AiChat from "@/pages/AiChat";
import DocumentUpload from "@/pages/DocumentUpload";
import VideoRecording from "@/pages/VideoRecording";
import FinalReview from "@/pages/FinalReview";
import Completion from "@/pages/Completion";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/*" component={AuthRouter} />
      <ProtectedRoute path="/onboarding" component={OnboardingContainer} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
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
        <UnfinishedWillNotification />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
