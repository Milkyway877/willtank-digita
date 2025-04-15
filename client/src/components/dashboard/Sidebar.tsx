import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Scroll
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from '@/components/ui/Logo';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Scroll, label: 'Wills', path: '/wills' },
  { icon: UploadCloud, label: 'Documents', path: '/dashboard/documents' },
  { icon: Video, label: 'Videos', path: '/dashboard/video' },
  { icon: Users, label: 'Beneficiaries', path: '/dashboard/beneficiaries' },
  { icon: MessageSquare, label: 'Delivery', path: '/dashboard/delivery' },
  { icon: Calendar, label: 'Reminders', path: '/dashboard/reminders' },
  { icon: CreditCard, label: 'Plan & Billing', path: '/dashboard/billing' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

interface TooltipProps {
  children: React.ReactNode;
  label: string;
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ children, label, visible }) => {
  return (
    <div className="relative group">
      {children}
      {visible && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const [currentLocation, navigate] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { logoutMutation } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && !isCollapsed && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isCollapsed]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Main Sidebar */}
      <motion.div 
        ref={sidebarRef}
        className={`h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 overflow-hidden z-50 ${
          isMobile 
            ? isCollapsed 
              ? 'w-0' 
              : 'fixed left-0 w-64' 
            : isCollapsed 
              ? 'w-16' 
              : 'w-64'
        }`}
        initial={false}
        animate={{ 
          width: isMobile 
            ? isCollapsed 
              ? 0 
              : 240 
            : isCollapsed 
              ? 64 
              : 240 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="overflow-visible z-10"
              >
                <Logo size="md" withText={true} />
              </motion.div>
            ) : (
              <motion.div
                key="short-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="overflow-visible z-10"
              >
                <Logo size="sm" withText={false} />
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            className="text-gray-500 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <Tooltip key={item.path} label={item.label} visible={isCollapsed}>
                <li>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                      if (isMobile) setIsCollapsed(true);
                    }}
                    className={`flex items-center py-2.5 px-3 rounded-lg transition-all ${
                      currentLocation === item.path || (item.path === '/wills' && currentLocation.startsWith('/wills'))
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-3 whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </a>
                </li>
              </Tooltip>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700 p-4">
          <Tooltip label="Log Out" visible={isCollapsed}>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full py-2 px-3 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 whitespace-nowrap overflow-hidden"
                  >
                    Log Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </Tooltip>
        </div>
      </motion.div>
      
      {/* Mobile Toggle Button (Always Visible) */}
      {isMobile && isCollapsed && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-gray-600 dark:text-gray-300 hover:text-primary"
          onClick={() => setIsCollapsed(false)}
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}
    </>
  );
};

export default Sidebar;