import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Edit, 
  Plus, 
  Loader2, 
  AlertTriangle,
  Check,
  FileSymlink,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveAs } from 'file-saver';

interface Will {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed' | 'locked';
  isComplete: boolean;
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

const WillsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWill, setSelectedWill] = useState<Will | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
  
  // Delete will mutation
  const deleteMutation = useMutation({
    mutationFn: async (willId: number) => {
      const res = await apiRequest('DELETE', `/api/wills/${willId}`);
      if (!res.ok) {
        throw new Error('Failed to delete will');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wills'] });
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Will Deleted",
        description: "Your will has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete will: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle will deletion
  const handleDeleteWill = (willId: number) => {
    deleteMutation.mutate(willId);
  };

  // Handle opening preview
  const handlePreviewWill = (will: Will) => {
    setSelectedWill(will);
    setIsPreviewOpen(true);
  };

  // Handle edit will
  const handleEditWill = (willId: number) => {
    // Store the will ID to localStorage for the creation process to use
    localStorage.setItem('currentWillId', willId.toString());
    navigate('/ai-chat'); // Navigate to Skyler chat
  };

  // Handle create new will
  const handleCreateNewWill = () => {
    // Clear any existing will IDs to start fresh
    localStorage.removeItem('currentWillId');
    navigate('/ai-chat'); // Navigate to Skyler chat
  };

  // Handle PDF download
  const handleDownloadPdf = async (will: Will) => {
    try {
      const response = await apiRequest('GET', `/api/wills/${will.id}/pdf`);
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      saveAs(blob, `${will.title || 'WillTank_Document'}.pdf`);
      
      toast({
        title: "Download Started",
        description: "Your will is being downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was a problem generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'locked':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Locked</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Unknown</Badge>;
    }
  };

  if (isLoadingWills) {
    return (
      <DashboardLayout title="Wills">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your wills...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isWillsError) {
    return (
      <DashboardLayout title="Wills">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Wills</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There was a problem loading your wills. Please try again.
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/wills'] })}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasWills = wills && wills.length > 0;

  return (
    <DashboardLayout title="Wills">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Wills</h1>
        <Button 
          onClick={handleCreateNewWill}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Will
        </Button>
      </div>

      {hasWills ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
          {wills.map((will) => (
            <Card key={will.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold truncate" title={will.title || 'Untitled Will'}>
                    {will.title || 'Untitled Will'}
                  </CardTitle>
                  {getStatusBadge(will.status || (will.isComplete ? 'completed' : 'draft'))}
                </div>
                <CardDescription className="flex items-center text-sm">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Created: {formatDate(will.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center mb-2">
                  <FileSymlink className="h-4 w-4 mr-2 text-primary" />
                  Last updated: {formatDate(will.updatedAt)}
                </div>
                {will.status !== 'locked' ? (
                  <p>This will is editable and can be modified.</p>
                ) : (
                  <p>This will is locked and cannot be modified.</p>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex justify-between border-t">
                <div className="flex space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreviewWill(will)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPdf(will)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
                <div className="flex space-x-1">
                  {will.status !== 'locked' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditWill(will.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedWill(will);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Wills Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
            You haven't created any wills yet. Start by creating your first will with our AI assistant.
          </p>
          <Button onClick={handleCreateNewWill} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Will
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedWill?.title || 'Will Preview'}</DialogTitle>
            <DialogDescription>
              Created on {selectedWill ? formatDate(selectedWill.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 font-serif whitespace-pre-wrap prose dark:prose-invert max-w-none border border-gray-200 dark:border-gray-700 max-h-[500px] overflow-y-auto">
            {selectedWill?.content ? (
              <div dangerouslySetInnerHTML={{ __html: selectedWill.content }} />
            ) : (
              <p className="text-gray-500 italic">No content available for preview.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
            <Button onClick={() => selectedWill && handleDownloadPdf(selectedWill)}>
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Will</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this will? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/50">
            <p className="text-red-600 dark:text-red-400 text-sm">
              <strong>{selectedWill?.title || 'Untitled Will'}</strong>
              <br />
              Created on {selectedWill ? formatDate(selectedWill.createdAt) : ''}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedWill && handleDeleteWill(selectedWill.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WillsPage;