import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Upload, X, Check, AlertCircle, FileText, Image, Film, File, ArrowRight } from 'lucide-react';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

// Document type interface
interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  fileTypes: string[];
  maxSize: number; // in MB
}

// File upload state interface
interface UploadedFile {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const DocumentUpload: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [willData, setWillData] = useState<any>(null);
  const [documents, setDocuments] = useState<DocumentRequirement[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [allRequired, setAllRequired] = useState(false);
  const [uploadedCount, setUploadedCount] = useState<number>(0);
  const [requiredCount, setRequiredCount] = useState<number>(0);
  const [fileInputKey, setFileInputKey] = useState<string>("fileInput-0"); // Used to reset file input

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);

  // Load will data from localStorage
  useEffect(() => {
    const savedWillData = localStorage.getItem('willData');
    if (savedWillData) {
      try {
        const parsedData = JSON.parse(savedWillData);
        setWillData(parsedData);
        
        // Generate document requirements based on will data
        generateDocumentRequirements(parsedData);
      } catch (error) {
        console.error('Error parsing will data:', error);
        // Navigate back to chat if data is invalid
        navigate('/ai-chat');
      }
    } else {
      // No will data found, redirect back to chat
      navigate('/ai-chat');
    }
  }, [navigate]);

  // Generate document requirements based on will data
  const generateDocumentRequirements = (data: any) => {
    const requiredDocs: DocumentRequirement[] = [
      {
        id: 'id-proof',
        name: 'Government-issued ID',
        description: 'Your passport, driver\'s license, or national ID card',
        required: true,
        fileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
        maxSize: 10
      }
    ];

    // Check for assets in will data
    if (data.assets && data.assets.length > 0) {
      data.assets.forEach((asset: any, index: number) => {
        if (asset.type.toLowerCase().includes('property') || asset.type.toLowerCase().includes('real estate')) {
          requiredDocs.push({
            id: `property-deed-${index}`,
            name: 'Property Deed or Title',
            description: `Documentation for your ${asset.description}`,
            required: true,
            fileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
            maxSize: 20
          });
        } else if (asset.type.toLowerCase().includes('vehicle') || asset.type.toLowerCase().includes('car')) {
          requiredDocs.push({
            id: `vehicle-registration-${index}`,
            name: 'Vehicle Registration',
            description: `Documentation for your ${asset.description}`,
            required: true,
            fileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
            maxSize: 10
          });
        } else if (asset.type.toLowerCase().includes('bank') || asset.type.toLowerCase().includes('account')) {
          requiredDocs.push({
            id: `bank-statement-${index}`,
            name: 'Bank Statement',
            description: `Documentation for your ${asset.description}`,
            required: true,
            fileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
            maxSize: 10
          });
        }
      });
    }

    // Add optional documents
    requiredDocs.push({
      id: 'additional-document',
      name: 'Additional Supporting Document',
      description: 'Any additional document that may be relevant',
      required: false,
      fileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
      maxSize: 25
    });

    setDocuments(requiredDocs);
    
    // Count required documents
    const requiredCount = requiredDocs.filter(doc => doc.required).length;
    setRequiredCount(requiredCount);
  };

  // Check if all required documents are uploaded
  useEffect(() => {
    if (documents.length === 0) return;
    
    const requiredDocIds = documents.filter(doc => doc.required).map(doc => doc.id);
    const uploadedRequiredDocs = uploadedFiles.filter(file => 
      requiredDocIds.includes(file.id) && file.status === 'success'
    );
    
    setUploadedCount(uploadedRequiredDocs.length);
    setAllRequired(uploadedRequiredDocs.length >= requiredDocIds.length);
  }, [documents, uploadedFiles]);

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, documentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file, documentId);
    }
  };

  // Handle file selection via input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file, documentId);
      
      // Reset the file input to allow selecting the same file again
      setFileInputKey(`fileInput-${Date.now()}`);
    }
  };

  // Handle file upload simulation
  const handleFileUpload = (file: File, documentId: string) => {
    // Check if file type is allowed
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!doc.fileTypes.includes(fileExtension)) {
      // Add file with error
      setUploadedFiles(prev => [
        ...prev.filter(f => f.id !== documentId),
        {
          id: documentId,
          file,
          name: file.name,
          progress: 100,
          status: 'error',
          error: `Invalid file type. Allowed types: ${doc.fileTypes.join(', ')}`
        }
      ]);
      return;
    }
    
    // Check if file size is within limit
    if (file.size > doc.maxSize * 1024 * 1024) {
      // Add file with error
      setUploadedFiles(prev => [
        ...prev.filter(f => f.id !== documentId),
        {
          id: documentId,
          file,
          name: file.name,
          progress: 100,
          status: 'error',
          error: `File size exceeds maximum allowed (${doc.maxSize}MB)`
        }
      ]);
      return;
    }
    
    // Start upload simulation
    const newFile: UploadedFile = {
      id: documentId,
      file,
      name: file.name,
      progress: 0,
      status: 'uploading'
    };
    
    setUploadedFiles(prev => [...prev.filter(f => f.id !== documentId), newFile]);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      
      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(f => 
          f.id === documentId ? { ...f, progress: 100, status: 'success' } : f
        ));
      } else {
        setUploadedFiles(prev => prev.map(f => 
          f.id === documentId ? { ...f, progress } : f
        ));
      }
    }, 200);
  };

  // Handle file removal
  const handleRemoveFile = (documentId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== documentId));
  };

  // Handle continue to video recording
  const handleContinue = () => {
    navigate('/video-recording');
  };

  // Get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <Image className="h-5 w-5" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return <Film className="h-5 w-5" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      <div className="container mx-auto py-16 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Supporting Documents</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              To finalize your will, please upload the following supporting documents.
              These documents help establish the authenticity of your assets and identity.
            </p>
          </div>
          
          {/* Document Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="space-y-8">
              {documents.map((document) => (
                <div key={document.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center">
                        {document.name}
                        {document.required && (
                          <span className="text-xs font-medium bg-red-100 text-red-800 ml-2 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        {document.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Accepted formats: {document.fileTypes.join(', ')} • Max size: {document.maxSize}MB
                      </p>
                    </div>
                    
                    {uploadedFiles.some(f => f.id === document.id && f.status === 'success') && (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 p-1.5 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  
                  {/* Display uploaded file or upload area */}
                  {uploadedFiles.some(f => f.id === document.id) ? (
                    // Show uploaded file
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                    >
                      {uploadedFiles.map(file => file.id === document.id && (
                        <div key={file.name} className="w-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                {getFileIcon(file.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveFile(document.id)}
                              className="ml-2 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                          
                          {file.status === 'uploading' && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                          )}
                          
                          {file.status === 'error' && (
                            <div className="mt-2 flex items-center text-sm text-red-500">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span>{file.error}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    // Show file upload area
                    <div
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, document.id)}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      <input
                        key={fileInputKey}
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept={document.fileTypes.join(',')}
                        onChange={(e) => handleFileSelect(e, document.id)}
                      />
                      
                      <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-primary font-medium">Click to upload</span> or drag and drop
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Continue Button */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleContinue}
                disabled={!allRequired}
                className={`flex items-center px-8 py-3 rounded-lg text-white font-medium ${
                  allRequired 
                    ? 'bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 shadow-lg hover:shadow-xl transition-all'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Video Recording
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-3 text-center">
              {!allRequired ? (
                <p className="text-sm text-amber-500 dark:text-amber-400">
                  <AlertCircle className="inline h-4 w-4 mr-1 mb-0.5" />
                  Please upload all required documents to continue
                </p>
              ) : (
                <p className="text-sm text-green-500 dark:text-green-400">
                  <Check className="inline h-4 w-4 mr-1 mb-0.5" />
                  All required documents uploaded successfully
                </p>
              )}
              
              {/* Document count indicator */}
              <div className="mt-2 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {uploadedCount} of {requiredCount} required documents uploaded
                  {allRequired && ' ✅'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentUpload;