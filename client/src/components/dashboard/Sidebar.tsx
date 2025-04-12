import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  FileText, 
  UploadCloud, 
  Video, 
  Users, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  Settings, 
  Home,
  BarChart,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'My Will', path: '/dashboard/will' },
  { icon: UploadCloud, label: 'Documents', path: '/dashboard/documents' },
  { icon: Video, label: 'Video Testimony', path: '/dashboard/video-testimony' },
  { icon: Users, label: 'Beneficiaries', path: '/dashboard/beneficiaries' },
  { icon: MessageSquare, label: 'Delivery', path: '/dashboard/delivery' },
  { icon: Calendar, label: 'Reminders', path: '/dashboard/reminders' },
  { icon: CreditCard, label: 'Plan & Billing', path: '/dashboard/billing' },
  { icon: BarChart, label: 'Trust Progress', path: '/dashboard/trust' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

const Sidebar: React.FC = () => {
  const [currentLocation, navigate] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logoutMutation } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className={`h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 overflow-hidden ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-primary font-bold text-xl mr-2"
            >
              WillTank
            </motion.div>
          )}
          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary font-bold text-xl"
            >
              W
            </motion.div>
          )}
        </div>
        <button 
          className="text-gray-500 hover:text-primary transition-colors p-1"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                className={`flex items-center py-2.5 px-4 transition-colors ${
                  currentLocation === item.path
                    ? 'bg-primary bg-opacity-10 text-primary border-l-4 border-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-3">Log Out</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;