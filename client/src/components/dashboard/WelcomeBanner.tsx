import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface WelcomeBannerProps {
  lastUpdated?: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ lastUpdated = 'May 15, 2024' }) => {
  const { user } = useAuth();
  const username = user?.username || 'Friend';
  
  // Format the name to be more user-friendly
  const formattedName = username.includes('@') 
    ? username.split('@')[0] 
    : username;
  
  // Capitalize the first letter
  const displayName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  
  // Get time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border border-blue-100 dark:border-blue-800 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 md:mb-0"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {greeting}, {displayName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back to your legacy vault.
          </p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center bg-white dark:bg-gray-800 py-2 px-4 rounded-lg shadow-sm"
          >
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm">Will Status: <span className="font-medium text-green-600 dark:text-green-400">Active</span></span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center bg-white dark:bg-gray-800 py-2 px-4 rounded-lg shadow-sm"
          >
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm">Last Updated: <span className="font-medium">{lastUpdated}</span></span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center bg-white dark:bg-gray-800 py-2 px-4 rounded-lg shadow-sm"
          >
            <Clock className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm">Next Check-in: <span className="font-medium">30 days</span></span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;