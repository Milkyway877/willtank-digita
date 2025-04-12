import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import Sidebar from '@/components/dashboard/Sidebar';
import CheckInPrompt from '@/components/dashboard/CheckInPrompt';
import { AnimatedAurora } from '@/components/ui/AnimatedAurora';

const CheckInPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);

  // Show loader while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handlePromptComplete = (response: 'update' | 'skip' | 'remind') => {
    if (response === 'update') {
      navigate('/ai-chat');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-7xl mx-auto">
          {/* Check-In Prompt */}
          <div className="py-10">
            <CheckInPrompt onComplete={handlePromptComplete} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;