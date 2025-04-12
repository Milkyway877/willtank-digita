import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/ui/Logo';

interface DashboardHeaderProps {
  title?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const [notifications, setNotifications] = useState<number>(2); // Example notification count
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Extract first name from email
  const userName = user?.username?.split('@')[0] || 'User';
  const formattedUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Main Header Row */}
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Side - User greeting */}
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Good afternoon, {formattedUserName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back to your legacy vault.
          </p>
        </div>

        {/* Right Side Elements */}
        <div className="flex items-center space-x-6">
          {/* Will Status */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Will Status:</span>
            <span className="flex items-center text-green-500 text-sm font-medium">
              <CheckCircle className="h-4 w-4 mr-1" />
              Active
            </span>
          </div>

          {/* Last Updated */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
            <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm font-medium">
              <Clock className="h-4 w-4 mr-1" />
              May 15, 2024
            </span>
          </div>

          {/* Next Check-in */}
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Check-in:</span>
            <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm font-medium">
              <Calendar className="h-4 w-4 mr-1" />
              30 days
            </span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setNotifications(0)}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {notifications}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;