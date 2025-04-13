import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, CheckCircle, Clock, Calendar, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/ui/Logo';

interface DashboardHeaderProps {
  title?: string;
}

// Notification data type
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const [notificationCount, setNotificationCount] = useState<number>(2);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Will Update Reminder',
      message: 'It\'s been 6 months since your last will update. Consider reviewing your will.',
      time: '2 hours ago',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Document Upload',
      message: 'Your property deed was successfully uploaded and attached to your will.',
      time: '1 day ago',
      read: false,
      type: 'success'
    }
  ]);
  
  const { user } = useAuth();
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

  // Calculate number of unread notifications
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setNotificationCount(unreadCount);
  }, [notifications]);

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
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Mark a specific notification as read
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Delete a notification
  const removeNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
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
          <div className="relative" ref={notificationRef}>
            <button 
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {notificationCount}
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
                    {notificationCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  {/* Notification List */}
                  <div className="overflow-y-auto max-h-72">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                            !notification.read 
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
                                {notification.time}
                              </p>
                            </div>
                            <button 
                              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="h-4 w-4" />
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