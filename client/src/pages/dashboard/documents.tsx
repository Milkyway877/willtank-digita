import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { UploadCloud, File, FileText, FilePlus, FileMinus, ArrowLeft, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Will {
  id: number;
  userId: number;
  title: string;
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

const DocumentsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedWillId, setSelectedWillId] = useState<number | null>(null);
  
  // Fetch user's wills
  const { data: wills, isLoading: isLoadingWills } = useQuery<Will[]>({
    queryKey: ['/api/wills'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/wills');
      return res.json();
    }
  });
  
  // Get most recent will ID from wills response
  useEffect(() => {
    if (wills && wills.length > 0) {
      // Sort by update date, descending
      const sortedWills = [...wills].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setSelectedWillId(sortedWills[0].id);
    }
  }, [wills]);
  
  // Fetch documents for selected will
  const { 
    data: documents, 
    isLoading: isLoadingDocs,
    refetch: refetchDocuments
  } = useQuery<WillDocument[]>({
    queryKey: ['/api/wills', selectedWillId, 'documents'],
    queryFn: async () => {
      if (!selectedWillId) return [];
      const res = await apiRequest('GET', `/api/wills/${selectedWillId}/documents`);
      return res.json();
    },
    enabled: !!selectedWillId
  });
  
  // Mutation to delete documents
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest('DELETE', `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/wills', selectedWillId, 'documents']});
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedWillId) {
      toast({
        title: "No will selected",
        description: "Please create a will before uploading documents.",
        variant: "destructive"
      });
      return;
    }
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingFile(file);
      setUploadProgress(0);
      setUploadError(null);
      
      try {
        // Create FormData for the upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Set up XMLHttpRequest to track progress
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/api/wills/${selectedWillId}/documents`, true);
        xhr.withCredentials = true;
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };
        
        // Handle response
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploadingFile(null);
            refetchDocuments();
            toast({
              title: "Upload complete",
              description: "Document uploaded successfully.",
              variant: "default"
            });
          } else {
            setUploadError(`Server error: ${xhr.status}`);
            toast({
              title: "Upload failed",
              description: `Server returned error: ${xhr.status}`,
              variant: "destructive"
            });
          }
        };
        
        // Handle upload error
        xhr.onerror = () => {
          setUploadError("Network error during upload");
          toast({
            title: "Upload failed",
            description: "Network error during upload. Please try again.",
            variant: "destructive"
          });
        };
        
        // Start the upload
        xhr.send(formData);
      } catch (error) {
        console.error("Error uploading document:", error);
        setUploadError("Failed to upload document");
        setUploadingFile(null);
        toast({
          title: "Upload failed",
          description: "Failed to upload document. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleDeleteDocument = async (id: number) => {
    try {
      await deleteDocumentMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };
  
  return (
    <DashboardLayout title="Supporting Documents">
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
        {/* Main Documents List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <UploadCloud className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white">My Documents</h3>
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                {documents.length}
              </span>
            </div>
            
            <label className="cursor-pointer px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center">
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <FilePlus className="h-4 w-4 mr-1.5" />
              Upload New
            </label>
          </div>
          
          {/* Upload Progress */}
          {uploadingFile && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <File className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{uploadingFile.name}</span>
                </div>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setUploadingFile(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Uploading... {uploadProgress}%</span>
                <span>{Math.round((uploadingFile.size / (1024 * 1024)) * 100) / 100} MB</span>
              </div>
              
              {uploadError && (
                <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                  {uploadError}
                </div>
              )}
            </div>
          )}
          
          {/* Documents List */}
          <div className="p-4">
            {isLoadingDocs ? (
              <div className="text-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
              </div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center py-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Documents Yet</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Upload important documents to ensure they are securely stored and accessible to your executor when needed.
                </p>
                <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors inline-flex items-center">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </label>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white text-sm">{doc.fileName}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">{doc.fileType}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
                            {Math.round((doc.fileSize / (1024 * 1024)) * 100) / 100} MB
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <a 
                        href={`/uploads/${doc.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors mr-1"
                        title="View document"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                      <button 
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400 transition-colors"
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete document"
                      >
                        <FileMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Required Documents Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Required Documents</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              These documents are needed for your will to be complete.
            </p>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {requiredDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className={`p-3 rounded-lg flex items-center ${
                    doc.completed 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-amber-50 dark:bg-amber-900/20'
                  }`}
                >
                  {doc.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-3 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`font-medium ${
                      doc.completed 
                        ? 'text-green-800 dark:text-green-300' 
                        : 'text-amber-800 dark:text-amber-300'
                    }`}>
                      {doc.name}
                    </h4>
                    <p className={`text-xs ${
                      doc.completed 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-amber-700 dark:text-amber-400'
                    }`}>
                      {doc.completed ? 'Uploaded' : 'Missing'}
                    </p>
                  </div>
                  {!doc.completed && (
                    <label className="ml-auto cursor-pointer px-2 py-1 bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300 rounded text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-800/60 transition-colors">
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      Upload
                    </label>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800 dark:text-white text-sm">Completion Status</h4>
                <span className="text-sm font-medium text-primary">
                  75% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage;