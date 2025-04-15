import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Upload, X, Check, AlertCircle, FileText, Image, Film, File, ArrowRight } from 'lucide-react';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import Logo from '@/components/ui/Logo';
import { WillCreationStep, saveWillProgress as trackWillProgress } from '@/lib/will-progress-tracker';

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
  const [location, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [willData, setWillData] = useState<any>(null);
  const [documents, setDocuments] = useState<DocumentRequirement[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [allRequired, setAllRequired] = useState(false);
  const [uploadedCount, setUploadedCount] = useState<number>(0);
  const [requiredCount, setRequiredCount] = useState<number>(0);
  const [fileInputKey, setFileInputKey] = useState<string>("fileInput-0"); // Used to reset file input
  const [willId, setWillId] = useState<number | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);
  
  // Get willId from URL query parameters and load existing documents
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const willIdParam = searchParams.get('willId');
      
      if (willIdParam) {
        try {
          const parsedWillId = parseInt(willIdParam, 10);
          console.log(`Found willId in URL: ${parsedWillId}`);
          setWillId(parsedWillId);
          
          // Store in localStorage for other components
          localStorage.setItem('currentWillId', parsedWillId.toString());
          
          // Load any existing documents for this will
          const loadDocuments = async () => {
            try {
              const response = await fetch(`/api/wills/${parsedWillId}/documents`);
              
              if (response.ok) {
                const existingDocs = await response.json();
                console.log('Loaded existing documents:', existingDocs);
                
                // Map server documents to our upload format
                if (existingDocs && existingDocs.length > 0) {
                  const mappedDocs = existingDocs.map((doc: {
                    id?: number;
                    type?: string;
                    name?: string;
                    description?: string;
                  }) => ({
                    id: doc.type || 'unknown-doc', // Use the type field as a document ID
                    file: new File([''], doc.name || 'document.pdf'), // Create placeholder File object
                    name: doc.name || 'Unnamed Document',
                    progress: 100,
                    status: 'success' as const,
                  }));
                  
                  setUploadedFiles(prev => [...prev, ...mappedDocs]);
                }
              } else if (response.status === 403) {
                // Handle unauthorized access
                console.error('Unauthorized access to will documents');
                navigate('/template-selection');
              }
            } catch (error) {
              console.error('Error loading existing documents:', error);
            }
          };
          
          loadDocuments();
        } catch (error) {
          console.error('Error parsing willId from URL:', error);
        }
      } else {
        // Check localStorage if URL doesn't have willId
        const storedWillId = localStorage.getItem('currentWillId');
        if (storedWillId) {
          const parsedId = parseInt(storedWillId, 10);
          if (!isNaN(parsedId)) {
            console.log(`Using stored willId: ${parsedId}`);
            setWillId(parsedId);
            
            // Redirect to add willId to URL for clarity
            navigate(`/document-upload?willId=${parsedId}`, { replace: true });
          }
        }
      }
    }
  }, [navigate]);

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
      },
      {
        id: 'proof-of-address',
        name: 'Proof of Address',
        description: 'Utility bill, bank statement, or other official document showing your current address',
        required: false,
        fileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
        maxSize: 10
      },
      {
        id: 'birth-certificate',
        name: 'Birth Certificate',
        description: 'A copy of your birth certificate or similar vital record',
        required: false,
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
  const handleFileUpload = async (file: File, documentId: string) => {
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
    
    // Make sure we have a willId before trying to upload
    if (!willId) {
      console.error("Cannot upload file - missing willId");
      setUploadedFiles(prev => [
        ...prev.filter(f => f.id !== documentId),
        {
          id: documentId,
          file,
          name: file.name,
          progress: 100,
          status: 'error',
          error: 'Cannot upload file - will information is missing'
        }
      ]);
      return;
    }
    
    // Start upload
    const newFile: UploadedFile = {
      id: documentId,
      file,
      name: file.name,
      progress: 0,
      status: 'uploading'
    };
    
    setUploadedFiles(prev => [...prev.filter(f => f.id !== documentId), newFile]);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', doc.name);
      formData.append('description', doc.description);
      
      // Show initial progress
      let progress = 10;
      setUploadedFiles(prev => prev.map(f => 
        f.id === documentId ? { ...f, progress } : f
      ));
      
      // Send to server
      const response = await fetch(`/api/wills/${willId}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });
      
      // Update progress to 70%
      progress = 70;
      setUploadedFiles(prev => prev.map(f => 
        f.id === documentId ? { ...f, progress } : f
      ));
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      // Complete the upload
      progress = 100;
      setUploadedFiles(prev => prev.map(f => 
        f.id === documentId ? { ...f, progress, status: 'success' } : f
      ));
      
    } catch (err) {
      const error = err as Error;
      console.error('Error uploading file:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === documentId ? { 
          ...f, 
          progress: 100, 
          status: 'error',
          error: error.message || 'Failed to upload file'
        } : f
      ));
    }
  };

  // Handle file removal
  const handleRemoveFile = (documentId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== documentId));
  };

  // Handle continue to video recording
  const handleContinue = () => {
    // Update progress tracker
    trackWillProgress(WillCreationStep.VIDEO_RECORDING);
    
    // Continue to video recording with the willId
    if (willId) {
      console.log(`Continuing to video recording with willId: ${willId}`);
      navigate(`/video-recording?willId=${willId}`);
    } else {
      // Fallback if willId is missing
      console.error('Missing willId when trying to proceed to video recording');
      navigate('/video-recording');
    }
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
      
      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header with Logo */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Supporting Documents</h1>
            <a href="/" className="flex items-center">
              <Logo size="lg" withText={false} />
            </a>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              <span>Document Upload</span>
              <span>{uploadedCount} of {requiredCount} required documents</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: requiredCount ? `${(uploadedCount / requiredCount) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
            These documents help establish the authenticity of your assets and identity.
          </p>
          
          {/* Document Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 space-y-6">
            {documents.map((document) => (
              <div key={document.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-base md:text-lg flex items-center">
                      {document.name}
                      {document.required && (
                        <span className="text-xs font-medium bg-red-100 text-red-800 ml-2 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs md:text-sm">
                      {document.description}
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
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3"
                  >
                    {uploadedFiles.map(file => file.id === document.id && (
                      <div key={file.name} className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              {getFileIcon(file.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{file.name}</p>
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
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
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
                    
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-primary font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {document.fileTypes.join(', ')} • Max: {document.maxSize}MB
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Continue Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleContinue}
                disabled={!allRequired}
                className={`flex items-center px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-200 ${
                  allRequired 
                    ? 'bg-purple-600 hover:bg-purple-700 shadow hover:shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            
            {!allRequired ? (
              <p className="text-xs text-amber-500 dark:text-amber-400 text-center mt-2">
                <AlertCircle className="inline h-3 w-3 mr-1 mb-0.5" />
                Please upload all required documents to continue
              </p>
            ) : (
              <p className="text-xs text-green-500 dark:text-green-400 text-center mt-2">
                <Check className="inline h-3 w-3 mr-1 mb-0.5" />
                All required documents uploaded successfully
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentUpload;