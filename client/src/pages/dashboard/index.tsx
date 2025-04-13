import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import TrustProgressBar from '@/components/dashboard/TrustProgressBar';
import WillDocumentCard from '@/components/dashboard/WillDocumentCard';
import Beneficiaries from '@/components/dashboard/Beneficiaries';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Calendar, Video, UploadCloud, MessageSquare } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <WelcomeBanner />
        
        {/* Trust Progress Bar */}
        <TrustProgressBar progress={85} showDetails={false} />
        
        {/* Dashboard Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Will Document Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WillDocumentCard />
          </motion.div>
          
          {/* Supporting Documents Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <UploadCloud className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Supporting Documents</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">3 of 4 Required Documents</span>
                <span className="text-xs text-primary hover:text-primary-dark cursor-pointer">View All</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center mr-3">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span className="text-sm">Photo ID</span>
                </div>
                <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center mr-3">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span className="text-sm">Property Deed</span>
                </div>
                <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center mr-3">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span className="text-sm">Insurance Policy</span>
                </div>
                <div className="flex items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded flex items-center justify-center mr-3">
                    <span className="text-amber-500">!</span>
                  </div>
                  <span className="text-sm">Banking Information (Missing)</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Video Testimony Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <Video className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Video Testimony</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg mb-3 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Recorded: May 15, 2024</span>
                <span className="text-primary hover:text-primary-dark cursor-pointer">View</span>
              </div>
            </div>
          </motion.div>
          
          {/* Beneficiaries Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Beneficiaries />
          </motion.div>
          
          {/* Reminders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Reminders</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="text-sm text-center text-gray-500 dark:text-gray-400 py-8">
                <p>You have no upcoming reminders.</p>
                <button className="mt-2 text-primary hover:text-primary-dark">
                  Set a reminder
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Delivery Instructions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Delivery Instructions</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300 mb-3">
                <p>You haven't set up delivery instructions yet.</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Specify how your will should be delivered to your executor and beneficiaries in case of emergency.
              </p>
              <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors">
                Set Up Delivery
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>WillTank Legacy Vault • Last Login: Today at {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;