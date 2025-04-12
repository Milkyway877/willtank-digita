import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/ui/Logo';

interface DashboardHeaderProps {
  title?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const [notifications, setNotifications] = useState<number>(2); // Example notification count
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains('dark')
  );
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  // Extract first name from email
  const userName = user?.username ? user.username.split('@')[0] : 'User';

  return (
    <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      {/* Left Side - Title Area */}
      <div className="flex items-center">
        {isMobile && (
          <div className="mr-3">
            <Logo size="sm" withText={false} />
          </div>
        )}
        
        {title && !isSearchExpanded && (
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white line-clamp-1"
          >
            {title}
          </motion.h1>
        )}
      </div>

      {/* Right Side Elements */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Search Bar */}
        <div className={`relative transition-all duration-300 ${
          isSearchExpanded 
            ? 'w-full sm:w-64 md:w-72' 
            : 'w-auto'
        }`}>
          {!isSearchExpanded ? (
            <button 
              onClick={() => setIsSearchExpanded(true)}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              className="relative"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 pr-10 py-2 transition-colors"
                placeholder="Search your wills, assets..."
                autoFocus
                onBlur={() => setIsSearchExpanded(false)}
              />
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setIsSearchExpanded(false)}
              >
                <span className="text-xs text-gray-400 dark:text-gray-500">ESC</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button 
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

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

        {/* User Profile */}
        <div className="hidden sm:flex items-center">
          <div className="bg-primary/10 text-primary font-semibold rounded-full h-8 w-8 flex items-center justify-center">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
            {userName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;