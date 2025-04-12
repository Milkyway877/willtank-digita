import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { UploadCloud, File, FileText, FilePlus, FileMinus, ArrowLeft, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'complete' | 'pending' | 'required';
}

const DocumentsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'ID.jpg',
      type: 'Photo ID',
      size: '1.2 MB',
      uploadDate: '2024-05-15',
      status: 'complete'
    },
    {
      id: '2',
      name: 'Property_Deed.pdf',
      type: 'Property Deed',
      size: '3.5 MB',
      uploadDate: '2024-05-15',
      status: 'complete'
    },
    {
      id: '3',
      name: 'Insurance_Policy.pdf',
      type: 'Insurance Policy',
      size: '2.1 MB',
      uploadDate: '2024-05-16',
      status: 'complete'
    }
  ]);
  
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const requiredDocuments = [
    { id: 'doc1', name: 'Photo ID', completed: true },
    { id: 'doc2', name: 'Property Deed', completed: true },
    { id: 'doc3', name: 'Insurance Policy', completed: true },
    { id: 'doc4', name: 'Banking Information', completed: false }
  ];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingFile(file);
      simulateUpload(file);
    }
  };
  
  const simulateUpload = (file: File) => {
    setUploadProgress(0);
    setUploadError(null);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Add the file to documents
          const newDocument: Document = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type.split('/')[1].toUpperCase() || 'Document',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'complete'
          };
          
          setDocuments(prev => [...prev, newDocument]);
          setUploadingFile(null);
          
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  const handleDeleteDocument = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
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
            {documents.length === 0 ? (
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
                        <h4 className="font-medium text-gray-800 dark:text-white text-sm">{doc.name}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">{doc.type}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">{doc.size}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Uploaded: {doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors mr-1">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400 transition-colors"
                        onClick={() => handleDeleteDocument(doc.id)}
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