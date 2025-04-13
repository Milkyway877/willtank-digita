import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  ArrowLeft,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import TwoFactorAuth from '@/components/settings/TwoFactorAuth';

const SettingsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Profile settings
  const [profileForm, setProfileForm] = useState({
    name: user?.username || '',
    email: user?.username || '', // Using username as email since email field doesn't exist
    phone: ''
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    reminderEmails: true,
    securityAlerts: true,
    marketingEmails: false
  });
  
  // Security settings
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Appearance settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Form handling
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = () => {
    // Save profile logic
    alert('Profile saved successfully');
  };
  
  const handleSaveNotifications = () => {
    // Save notification settings logic
    alert('Notification settings saved successfully');
  };
  
  const handleChangePassword = () => {
    // Validate password first
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    // Change password logic
    alert('Password changed successfully');
    
    // Reset form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    
    // In a real app, this would update the theme in a context or localStorage
    const htmlTag = document.documentElement;
    
    if (selectedTheme === 'dark') {
      htmlTag.classList.add('dark');
    } else if (selectedTheme === 'light') {
      htmlTag.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? htmlTag.classList.add('dark') : htmlTag.classList.remove('dark');
    }
  };
  
  return (
    <DashboardLayout title="Settings">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <User className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Profile Settings</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
                    placeholder="(123) 456-7890"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Notification Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <Bell className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Notification Settings</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Email Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="emailNotifications" 
                      checked={notificationSettings.emailNotifications} 
                      onChange={handleNotificationChange} 
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Reminder Emails</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive reminder emails for scheduled tasks
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="reminderEmails" 
                      checked={notificationSettings.reminderEmails} 
                      onChange={handleNotificationChange} 
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Security Alerts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive security alerts for your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="securityAlerts" 
                      checked={notificationSettings.securityAlerts} 
                      onChange={handleNotificationChange} 
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Marketing Emails</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="marketingEmails" 
                      checked={notificationSettings.marketingEmails} 
                      onChange={handleNotificationChange} 
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleSaveNotifications}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Notification Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Security Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <Lock className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Security Settings</h3>
            </div>
            
            <div className="p-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-4">Change Password</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark transition-colors'
                    }`}
                  >
                    <Lock className="h-4 w-4 mr-1.5" />
                    Change Password
                  </button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <TwoFactorAuth />
              </div>
            </div>
          </motion.div>
          
          {/* Appearance Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <SettingsIcon className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Appearance</h3>
            </div>
            
            <div className="p-6">
              <h4 className="font-medium text-gray-800 dark:text-white mb-4">Theme</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <Sun className="h-6 w-6 text-amber-500" />
                  <span className="text-sm font-medium text-gray-800 dark:text-white">Light</span>
                </button>
                
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <Moon className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium text-gray-800 dark:text-white">Dark</span>
                </button>
                
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 ${
                    theme === 'system' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <Monitor className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-800 dark:text-white">System</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Account Info and Help */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                <User className="h-5 w-5 text-primary mr-2" />
                Account Information
              </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white text-lg">
                    {user?.username || 'User'}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {user?.username || 'email@example.com'}
                  </p>
                  <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Premium Plan
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Account Actions</h4>
                
                <div className="space-y-2">
                  <button className="w-full py-2 text-sm text-left text-red-500 hover:text-red-600 transition-colors">
                    Deactivate Account
                  </button>
                  <button className="w-full py-2 text-sm text-left text-red-500 hover:text-red-600 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                Privacy & Security
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your data is encrypted and securely stored. We never share your information with third parties without your consent.
              </p>
              
              <div className="space-y-2">
                <button className="w-full py-2 text-sm text-left text-primary hover:text-primary-dark transition-colors">
                  Privacy Policy
                </button>
                <button className="w-full py-2 text-sm text-left text-primary hover:text-primary-dark transition-colors">
                  Terms of Service
                </button>
                <button className="w-full py-2 text-sm text-left text-primary hover:text-primary-dark transition-colors">
                  Cookie Policy
                </button>
                <button className="w-full py-2 text-sm text-left text-primary hover:text-primary-dark transition-colors">
                  Data Export
                </button>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-primary/5 rounded-xl p-6 border border-primary/20"
          >
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Our support team is available 24/7 to assist you with any questions or issues.
            </p>
            <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Contact Support
            </button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;