import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, CheckCircle, Clock, Calendar, X, Info, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/ui/Logo';
import { formatDistanceToNow } from 'date-fns';

interface DashboardHeaderProps {
  title?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsReadMutation, 
    markAllAsReadMutation,
    deleteNotificationMutation 
  } = useNotifications();
  
  const isMobile = useIsMobile();
  const notificationRef = useRef<HTMLDivElement>(null);

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

  // Handle clicks outside the notification panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mark all notifications as read
  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Mark a specific notification as read
  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  // Delete a notification
  const removeNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  // Format the date as a relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: 'info' | 'warning' | 'success') => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Main Header Row */}
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Side - Page Title or Logo for Mobile */}
        <div className="flex items-center">
          {isMobile && <Logo className="h-8 mr-3" />}
          {title && (
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
        </div>

        {/* Right Side Elements */}
        <div className="flex items-center space-x-6">

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button 
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-50"
                >
                  {/* Notification Header */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                        className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                      >
                        {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
                      </button>
                    )}
                  </div>
                  
                  {/* Notification List */}
                  <div className="overflow-y-auto max-h-72">
                    {isLoading ? (
                      <div className="p-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                            notification.isRead === false 
                              ? 'bg-blue-50 dark:bg-blue-900/10' 
                              : 'bg-white dark:bg-gray-800'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5 mr-3">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {formatRelativeTime(notification.createdAt.toString())}
                              </p>
                            </div>
                            <button 
                              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              disabled={deleteNotificationMutation.isPending}
                            >
                              {deleteNotificationMutation.isPending ? 
                                <Loader2 className="h-4 w-4 animate-spin" /> : 
                                <X className="h-4 w-4" />
                              }
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;