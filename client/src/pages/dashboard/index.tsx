import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import TrustProgressBar from '@/components/dashboard/TrustProgressBar';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Calendar, 
  Video, 
  UploadCloud, 
  MessageSquare, 
  FilePlus, 
  AlertCircle, 
  Loader2,
  FileText,
  Users,
  Clock,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLastUpdated } from '@/lib/will-progress-tracker';

interface Will {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
  status?: 'draft' | 'completed' | 'locked';
}

interface WillDocument {
  id: number;
  willId: number;
  name: string;
  path: string;
  type: string;
  uploadDate: string;
  size: number;
}

interface Subscription {
  id: number;
  userId: number;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
}

// Component for Dashboard stats
const DashboardStat = ({ icon: Icon, label, value, color = "primary" }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className={`p-3 rounded-full mr-4 bg-${color}-100 dark:bg-${color}-900/30`}>
      <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-semibold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

// Empty state component
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
    <Button
      onClick={onAction}
      className="inline-flex items-center"
    >
      <FilePlus className="h-4 w-4 mr-2" />
      {action}
    </Button>
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
      if (!res.ok) {
        throw new Error('Failed to fetch wills');
      }
      return res.json();
    }
  });
  
  // Get the most recent will
  const mostRecentWill = wills && wills.length > 0 
    ? [...wills].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
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
      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }
      return res.json();
    },
    enabled: !!mostRecentWill
  });
  
  // Fetch subscription info
  const {
    data: subscription,
    isLoading: isLoadingSubscription
  } = useQuery<Subscription>({
    queryKey: ['/api/subscription'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/subscription');
      if (!res.ok) {
        // If not found, return default subscription
        return { plan: 'Starter', status: 'active' } as Subscription;
      }
      return res.json();
    }
  });
  
  // Calculate trust progress based on real data
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
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get time since last update
  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  };

  // Get last will update date
  const getLastWillUpdateDate = () => {
    if (mostRecentWill) {
      return getTimeSince(mostRecentWill.updatedAt);
    }
    
    // Check localStorage as fallback
    const lastUpdated = getLastUpdated();
    if (lastUpdated) {
      return getTimeSince(lastUpdated.toISOString());
    }
    
    return null;
  };
  
  // Navigation handlers for quick actions
  const handleCreateWill = () => {
    // Ensure we direct to template selection to start a NEW will creation process
    // Force a direct link to template selection without passing a willId
    navigate('/template-selection');
  };
  
  const handleViewWills = () => {
    navigate('/dashboard/wills');
  };
  
  const handleViewDocuments = () => {
    if (mostRecentWill) {
      navigate(`/document-upload?willId=${mostRecentWill.id}`);
    } else {
      toast({
        title: "No will created yet",
        description: "Please create a will before accessing documents.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewVideo = () => {
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
  
  // Loading state
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
        {/* Welcome Banner with Last Activity */}
        {mostRecentWill && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Welcome back{user?.fullName ? ', ' + user.fullName.split(' ')[0] : ''}!
                </h2>
                {getLastWillUpdateDate() && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    You last edited your will {getLastWillUpdateDate()}.
                  </p>
                )}
              </div>
              {subscription && (
                <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {subscription.plan || 'Starter'} Plan
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Stats Section - Real Data from Supabase */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {wills && wills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <DashboardStat 
                icon={FileText} 
                label="Total Wills" 
                value={wills.length} 
              />
              <DashboardStat 
                icon={UploadCloud} 
                label="Documents" 
                value={documents?.length || 0} 
              />
              <DashboardStat 
                icon={Video} 
                label="Video Status" 
                value={mostRecentWill?.isComplete ? '✅ Recorded' : '❌ Missing'} 
                color={mostRecentWill?.isComplete ? "green" : "red"}
              />
              <DashboardStat 
                icon={Clock} 
                label="Last Updated" 
                value={mostRecentWill ? formatDate(mostRecentWill.updatedAt) : 'N/A'} 
              />
            </div>
          ) : (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 mr-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                </div>
                <div>
                  <p className="font-medium">You haven't created a will yet</p>
                  <p className="text-sm mt-1">Start by clicking the "Create New Will" button below.</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access your important will management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  onClick={handleViewWills}
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FileText className="h-6 w-6 text-primary" />
                  <span>Wills</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {wills?.length || 0} {wills?.length === 1 ? 'will' : 'wills'} created
                  </span>
                </Button>
                
                <Button 
                  onClick={handleViewDocuments} 
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  disabled={!mostRecentWill}
                >
                  <UploadCloud className="h-6 w-6 text-primary" />
                  <span>Supporting Documents</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {documents?.length || 0} {documents?.length === 1 ? 'document' : 'documents'} uploaded
                  </span>
                </Button>
                
                <Button 
                  onClick={handleViewVideo} 
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  disabled={!mostRecentWill}
                >
                  <Video className="h-6 w-6 text-primary" />
                  <span>Video Testimony</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {mostRecentWill?.isComplete ? 'Recorded' : 'Not recorded yet'}
                  </span>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              {!wills || wills.length === 0 ? (
                <Button 
                  onClick={handleCreateWill}
                  className="flex items-center"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create Your First Will
                </Button>
              ) : (
                <Button 
                  onClick={handleCreateWill}
                  variant="outline"
                  className="flex items-center"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create New Will
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Trust Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Trust Progress</CardTitle>
              <CardDescription>Complete all steps to ensure your will is properly set up</CardDescription>
            </CardHeader>
            <CardContent>
              <TrustProgressBar progress={trustProgress} showDetails={true} />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Activity or Empty State */}
        {!wills || wills.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm text-center"
          >
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Wills Created Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Start by creating your first will with our AI-powered assistant Skyler. The process is simple and guided.
            </p>
            <Button 
              onClick={handleCreateWill}
              size="lg"
              className="flex items-center mx-auto"
            >
              <FilePlus className="mr-2 h-5 w-5" />
              Create Your First Will
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleViewWills}
                  >
                    View All Wills
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wills.slice(0, 3).map((will) => (
                    <div 
                      key={will.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        localStorage.setItem('currentWillId', will.id.toString());
                        navigate(`/dashboard/wills`);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{will.title || `Will #${will.id}`}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last updated: {formatDate(will.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          will.isComplete 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {will.isComplete ? 'Complete' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={handleCreateWill}
                  className="flex items-center"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create New Will
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;