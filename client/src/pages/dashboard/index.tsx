import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import TrustProgressBar from '@/components/dashboard/TrustProgressBar';
import WillDocumentCard from '@/components/dashboard/WillDocumentCard';
import Beneficiaries from '@/components/dashboard/Beneficiaries';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Calendar, Video, UploadCloud, MessageSquare, FilePlus, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Will {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
}

interface WillDocument {
  id: number;
  willId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  filePath: string;
}

const EmptyStateMessage = ({ title, message, action, onAction }: { 
  title: string, 
  message: string, 
  action: string, 
  onAction: () => void 
}) => (
  <div className="text-center py-8">
    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
      <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
    </div>
    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
      {message}
    </p>
    <button 
      onClick={onAction}
      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-flex items-center"
    >
      <FilePlus className="h-4 w-4 mr-2" />
      {action}
    </button>
  </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [trustProgress, setTrustProgress] = useState(0);
  
  // Fetch user's wills
  const { 
    data: wills, 
    isLoading: isLoadingWills,
    isError: isWillsError
  } = useQuery<Will[]>({
    queryKey: ['/api/wills'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/wills');
      return res.json();
    }
  });
  
  // Get the most recent will
  const mostRecentWill = wills?.length > 0 
    ? wills.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    : null;
  
  // Fetch documents for most recent will
  const { 
    data: documents, 
    isLoading: isLoadingDocs
  } = useQuery<WillDocument[]>({
    queryKey: ['/api/wills', mostRecentWill?.id, 'documents'],
    queryFn: async () => {
      if (!mostRecentWill) return [];
      const res = await apiRequest('GET', `/api/wills/${mostRecentWill.id}/documents`);
      return res.json();
    },
    enabled: !!mostRecentWill
  });
  
  // Calculate trust progress based on data
  useEffect(() => {
    if (wills && documents) {
      let progress = 0;
      
      // Has at least one will
      if (wills.length > 0) progress += 40;
      
      // Has documents
      if (documents && documents.length > 0) {
        progress += Math.min(documents.length * 10, 30); // Up to 30% for documents
      }
      
      // Has video testimony
      if (mostRecentWill && mostRecentWill.isComplete) {
        progress += 30;
      }
      
      setTrustProgress(progress);
    }
  }, [wills, documents, mostRecentWill]);
  
  const handleCreateWill = () => {
    navigate('/ai-chat');
  };
  
  const handleUploadDocument = () => {
    navigate('/dashboard/documents');
  };
  
  const handleRecordTestimony = () => {
    if (mostRecentWill) {
      navigate(`/video-recording?willId=${mostRecentWill.id}`);
    } else {
      toast({
        title: "No will created yet",
        description: "Please create a will before recording a video testimony.",
        variant: "destructive"
      });
    }
  };
  
  const handleSetupDelivery = () => {
    navigate('/dashboard/delivery');
  };
  
  const handleSetReminder = () => {
    navigate('/dashboard/reminders');
  };

  if (isLoadingWills) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <WelcomeBanner />
        
        {/* Trust Progress Bar */}
        <TrustProgressBar progress={trustProgress} showDetails={false} />
        
        {/* Dashboard Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Will Document Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {mostRecentWill ? (
              <WillDocumentCard willId={mostRecentWill.id} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm transition-all h-full">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <FilePlus className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">Create Your Will</h3>
                  </div>
                </div>
                <div className="p-4">
                  <EmptyStateMessage 
                    title="No Will Created Yet"
                    message="Start the process of creating your will with our AI-powered assistant."
                    action="Create Your First Will"
                    onAction={handleCreateWill}
                  />
                </div>
              </div>
            )}
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
                {documents && documents.length > 0 && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                    {documents.length}
                  </span>
                )}
              </div>
              {mostRecentWill && (
                <button 
                  onClick={handleUploadDocument}
                  className="text-xs text-primary hover:text-primary-dark"
                >
                  View All
                </button>
              )}
            </div>
            <div className="p-4">
              {isLoadingDocs ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : documents && documents.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{documents.length} Document{documents.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {documents.slice(0, 3).map(doc => (
                      <div key={doc.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center mr-3">
                          <span className="text-green-500">✓</span>
                        </div>
                        <span className="text-sm">{doc.fileName}</span>
                      </div>
                    ))}
                    {documents.length > 3 && (
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        + {documents.length - 3} more document{documents.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {!mostRecentWill 
                      ? "Create a will first, then add supporting documents."
                      : "No documents uploaded yet. Add important documents to support your will."}
                  </p>
                  <button
                    onClick={handleUploadDocument}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors"
                    disabled={!mostRecentWill}
                  >
                    {mostRecentWill ? "Upload Documents" : "Create Will First"}
                  </button>
                </div>
              )}
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
              {mostRecentWill && (
                <button
                  onClick={() => navigate('/dashboard/video')}
                  className="text-xs text-primary hover:text-primary-dark"
                >
                  View
                </button>
              )}
            </div>
            <div className="p-4">
              {mostRecentWill && mostRecentWill.isComplete ? (
                <div>
                  <div 
                    className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg mb-3 flex items-center justify-center cursor-pointer"
                    onClick={() => navigate('/dashboard/video')}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Recorded: {new Date(mostRecentWill.updatedAt).toLocaleDateString()}</span>
                    <span 
                      className="text-primary hover:text-primary-dark cursor-pointer"
                      onClick={() => navigate('/dashboard/video')}
                    >
                      Watch
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {!mostRecentWill 
                      ? "Create a will first, then record a video testimony."
                      : "Record a video testimony to add a personal touch to your will."}
                  </p>
                  <button
                    onClick={handleRecordTestimony}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors"
                    disabled={!mostRecentWill}
                  >
                    {mostRecentWill ? "Record Testimony" : "Create Will First"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Beneficiaries Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Beneficiaries willId={mostRecentWill?.id} />
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
                <button 
                  className="mt-2 text-primary hover:text-primary-dark"
                  onClick={handleSetReminder}
                >
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
              <button 
                onClick={handleSetupDelivery}
                className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors"
              >
                Set Up Delivery
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;