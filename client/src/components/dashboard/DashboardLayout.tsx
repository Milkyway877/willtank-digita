import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SkylerChatbot from '@/components/SkylerChatbot';
import { AnimatedAurora } from '@/components/ui/AnimatedAurora';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  title
}) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();

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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'pl-0' : ''}`}>
        {/* Dashboard Header */}
        <DashboardHeader title={title} />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 relative">
          <div className="max-w-7xl mx-auto">
            {/* Content */}
            {children}
            
            {/* Footer */}
            <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              <p>WillTank Legacy Vault • Last Login: Today at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;