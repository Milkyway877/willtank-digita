import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share, Edit, Eye, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface WillDocument {
  id: number;
  willId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  filePath: string;
}

interface Will {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
}

interface WillDocumentCardProps {
  dateCreated?: string;
  lastModified?: string;
  willId?: number;
}

const WillDocumentCard: React.FC<WillDocumentCardProps> = ({
  dateCreated = 'May 10, 2024',
  lastModified = 'May 15, 2024',
  willId
}) => {
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [, navigate] = useLocation();
  const [willDocument, setWillDocument] = useState<string>('');
  const { toast } = useToast();
  
  // Get active will ID from localStorage if not provided
  const activeWillId = willId || parseInt(localStorage.getItem('activeWillId') || '0');
  
  // Fetch will details
  const { data: will, isLoading: isLoadingWill } = useQuery<Will>({
    queryKey: ['/api/wills', activeWillId],
    queryFn: async () => {
      if (!activeWillId) return null;
      const res = await apiRequest('GET', `/api/wills/${activeWillId}`);
      return res.json();
    },
    enabled: !!activeWillId
  });
  
  // Fetch will documents
  const { data: documents, isLoading: isLoadingDocs } = useQuery<WillDocument[]>({
    queryKey: ['/api/wills', activeWillId, 'documents'],
    queryFn: async () => {
      if (!activeWillId) return [];
      const res = await apiRequest('GET', `/api/wills/${activeWillId}/documents`);
      return res.json();
    },
    enabled: !!activeWillId
  });

  useEffect(() => {
    // Set will document content from API or localStorage fallback
    if (will?.content) {
      setWillDocument(will.content);
    } else {
      // Fallback to localStorage
      const savedWill = localStorage.getItem('willFinalDocument');
      if (savedWill) {
        setWillDocument(savedWill);
      }
    }
  }, [will]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from triggering other handlers
    
    // Get will document
    const savedWill = localStorage.getItem('willFinalDocument');
    
    if (savedWill && !savedWill.includes('Click "Edit My Will" to start the process with Skyler')) {
      // If there's an actual will document, navigate to the will page for editing
      navigate('/dashboard/will');
      
      // Set a flag in localStorage to indicate we want to enter edit mode
      localStorage.setItem('willEditMode', 'true');
    } else {
      // If no proper will document exists, go to the AI chat to create one
      navigate('/ai-chat');
    }
  };

  const handleViewPreview = () => {
    navigate('/dashboard/will');
  };

  const handleDownloadWill = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from triggering other handlers
    
    if (isLoadingWill || isLoadingDocs) {
      toast({
        title: "Please wait",
        description: "Loading will data and documents...",
        variant: "default",
      });
      return;
    }

    try {
      // Import JSZip dynamically to avoid loading on initial page load
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Create will filename
      const willFileName = will?.title 
        ? `${will.title.replace(/\s+/g, '_')}.txt` 
        : "will_document.txt";

      // Add will document content
      const content = willDocument || 'Default will template - please edit your will using the AI assistant.';
      zip.file(willFileName, content);
      
      // Create documents folder
      const docsFolder = zip.folder("attachments");
      
      // Add actual documents from API
      if (documents && documents.length > 0) {
        toast({
          title: "Preparing download",
          description: `Including ${documents.length} attached document(s)...`,
          variant: "default",
        });
        
        // Fetch and add each document to the ZIP
        await Promise.all(documents.map(async (doc) => {
          try {
            // Fetch the actual document file
            const response = await fetch(`/uploads/${doc.filePath}`);
            if (!response.ok) throw new Error(`Failed to fetch document: ${doc.fileName}`);
            
            const fileBlob = await response.blob();
            docsFolder?.file(doc.fileName, fileBlob);
          } catch (err) {
            console.error(`Error fetching document ${doc.fileName}:`, err);
            // Add placeholder if document fetch fails
            docsFolder?.file(
              `${doc.fileName}.unavailable.txt`, 
              `The document "${doc.fileName}" could not be included in this package.\n`+
              `Please download it separately.`
            );
          }
        }));
      } else {
        // No documents found - add a placeholder note
        docsFolder?.file("README.txt", "No attachments have been added to this will.");
      }
      
      // Add video testimony if it exists
      const videoRecorded = localStorage.getItem('willVideoRecorded');
      if (videoRecorded === 'true') {
        const videoFolder = zip.folder("video_testimony");
        videoFolder?.file(
          "README.txt", 
          "Your video testimony is stored securely on our servers and will be made " +
          "available to your beneficiaries according to your delivery instructions."
        );
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create a filename based on will title or default
      const zipName = will?.title 
        ? `WillTank_${will.title.replace(/\s+/g, '_')}.zip` 
        : 'WillTank_Package.zip';
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Download complete",
        description: "Your will package has been downloaded successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error packaging documents:", error);
      toast({
        title: "Download failed",
        description: "There was an error creating your document package. Trying simpler download...",
        variant: "destructive",
      });
      
      // Fallback to simple text download if packaging fails
      try {
        const content = willDocument || 'Default will template - please edit your will using the AI assistant.';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const filename = will?.title 
          ? `${will.title.replace(/\s+/g, '_')}.txt` 
          : 'WillTank_Document.txt';
          
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        toast({
          title: "Basic download complete",
          description: "Your will document was downloaded as a text file. Attachments could not be included.",
          variant: "default",
        });
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError);
        toast({
          title: "Download failed",
          description: "We couldn't download your document. Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold text-gray-800 dark:text-white">My Will</h3>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={handleDownloadWill}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              alert('Sharing functionality would be implemented here');
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Share className="h-4 w-4" />
          </button>
          <button 
            onClick={handleEditClick}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Document Preview */}
      <div 
        className="p-5 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 relative cursor-pointer"
        onMouseEnter={() => setIsPreviewHovered(true)}
        onMouseLeave={() => setIsPreviewHovered(false)}
        onClick={handleViewPreview}
        style={{ minHeight: '200px' }}
      >
        {isLoadingWill ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading will document...</p>
          </div>
        ) : (
          <div className="w-full max-w-xs mx-auto bg-white dark:bg-gray-800 p-5 rounded-md shadow-md font-serif text-sm text-gray-800 dark:text-gray-200">
            <h2 className="text-center text-base font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
              {will?.title || "LAST WILL AND TESTAMENT"}
            </h2>
            <p className="text-xs mb-2 line-clamp-2">
              {willDocument ? (
                willDocument.substring(0, 120) + "..."
              ) : (
                <>I, <span className="font-bold">John Doe</span>, being of sound mind, make this my Last Will and Testament...</>
              )}
            </p>
            
            {/* Attached documents count */}
            <div className="text-xs opacity-75 mb-1">
              <span className="font-semibold">Attachments:</span> {documents?.length || 0} document(s)
            </div>
            
            {/* Last update info */}
            <div className="text-xs opacity-75 mb-1">
              <span className="font-semibold">Last updated:</span> {
                will?.updatedAt 
                  ? new Date(will.updatedAt).toLocaleDateString() 
                  : lastModified
              }
            </div>
            
            {/* Creation date */}
            <div className="text-xs opacity-75">
              <span className="font-semibold">Created:</span> {
                will?.createdAt 
                  ? new Date(will.createdAt).toLocaleDateString() 
                  : dateCreated
              }
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-center text-xs">
              <em>This is a preview. Click to view full document.</em>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isPreviewHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gray-900/60 flex items-center justify-center"
        >
          <button className="bg-white dark:bg-gray-800 text-primary hover:bg-primary hover:text-white dark:hover:bg-primary px-4 py-2 rounded-md flex items-center transition-colors shadow-lg">
            <Eye className="h-4 w-4 mr-2" />
            View Full Document
          </button>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap justify-between text-xs text-gray-600 dark:text-gray-400">
          <div>Created: {will?.createdAt ? new Date(will.createdAt).toLocaleDateString() : dateCreated}</div>
          <div>Last Modified: {will?.updatedAt ? new Date(will.updatedAt).toLocaleDateString() : lastModified}</div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs font-medium text-green-800 dark:text-green-400">
              {will?.isComplete ? "Complete" : "In Progress"}
            </span>
          </div>
          <button 
            onClick={handleViewPreview}
            className="text-xs text-primary hover:text-primary-dark flex items-center transition-colors"
          >
            View Details
            <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WillDocumentCard;