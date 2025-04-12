import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const [notifications, setNotifications] = useState<number>(2); // Example notification count

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
      {/* Title Area */}
      <div>
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            {title}
          </motion.h1>
        )}
      </div>

      {/* Right Side Elements */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2 transition-colors"
            placeholder="Search your wills, assets..."
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            className="rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setNotifications(0)}
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
  );
};

export default DashboardHeader;