import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Video, 
  UploadCloud, 
  FilePlus, 
  AlertCircle, 
  Loader2,
  FileText,
  Users,
  Clock,
  CreditCard,
  ArrowRight,
  Folder,
  Settings,
  UserCircle
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

interface Document {
  id: number;
  userId: number;
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
  
  // Fetch user's documents
  const { 
    data: documents, 
    isLoading: isLoadingDocs
  } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/documents');
      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }
      return res.json();
    }
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
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Navigation handlers for quick actions  
  const handleViewDocuments = () => {
    navigate('/dashboard/documents');
  };
  
  const handleManageProfile = () => {
    navigate('/dashboard/settings');
  };
  
  const handleManageBeneficiaries = () => {
    navigate('/dashboard/beneficiaries');
  };
  
  // Loading state
  if (isLoadingDocs || isLoadingSubscription) {
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
        >
          <div className="flex items-center">
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Welcome back{user?.fullName ? ', ' + user.fullName.split(' ')[0] : ''}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your secure document vault is ready.
              </p>
            </div>
            {subscription && (
              <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {subscription.plan || 'Starter'} Plan
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <DashboardStat 
              icon={Folder} 
              label="Documents" 
              value={documents?.length || 0} 
            />
            <DashboardStat 
              icon={Users} 
              label="Beneficiaries" 
              value="Manage" 
            />
            <DashboardStat 
              icon={Settings} 
              label="Account" 
              value="Settings" 
            />
          </div>
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
              <CardDescription>Access your document management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  onClick={handleViewDocuments}
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Folder className="h-6 w-6 text-primary" />
                  <span>Documents</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {documents?.length || 0} {documents?.length === 1 ? 'document' : 'documents'} stored
                  </span>
                </Button>
                
                <Button 
                  onClick={handleManageBeneficiaries} 
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Users className="h-6 w-6 text-primary" />
                  <span>Beneficiaries</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Manage your beneficiaries
                  </span>
                </Button>
                
                <Button 
                  onClick={handleManageProfile} 
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <UserCircle className="h-6 w-6 text-primary" />
                  <span>Account Settings</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Update your profile
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Documents Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {documents && documents.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Documents</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleViewDocuments}
                  >
                    View All Documents
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.slice(0, 3).map((doc) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate('/dashboard/documents')}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Uploaded: {formatDate(doc.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {doc.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <EmptyStateMessage
                  title="No Documents Uploaded"
                  message="Start by uploading important documents to your secure vault."
                  action="Upload Documents"
                  onAction={handleViewDocuments}
                />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;