import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ArrowLeft, FileText, Download, Printer, Share, Edit, Trash2, Copy, Video, File, FilePlus, Check
} from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  dateAdded: string;
}

const ViewWillDetails: React.FC = () => {
  const [, navigate] = useLocation();
  const [willDocument, setWillDocument] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDuplicateModalOpen, setConfirmDuplicateModalOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [hasVideoTestimony, setHasVideoTestimony] = useState(false);
  
  // Load will document and attachments
  useEffect(() => {
    // In a real app, this would fetch from an API
    const savedWill = localStorage.getItem('willFinalDocument');
    
    if (savedWill) {
      setWillDocument(savedWill);
    } else {
      setWillDocument('Default will template - please edit your will using the AI assistant.');
    }
    
    // Sample attachments
    setAttachments([
      {
        id: '1',
        name: 'Property_Deed.pdf',
        type: 'PDF',
        size: '1.2 MB',
        dateAdded: new Date().toLocaleDateString()
      },
      {
        id: '2',
        name: 'Family_Photo.jpg',
        type: 'Image',
        size: '3.4 MB',
        dateAdded: new Date().toLocaleDateString()
      }
    ]);
    
    // Check if there's a video testimony
    const videoRecorded = localStorage.getItem('willVideoRecorded');
    setHasVideoTestimony(videoRecorded === 'true');
  }, []);

  const handleEditWill = () => {
    navigate('/dashboard/will');
  };

  const handleDeleteWill = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // In a real app, this would make an API call to delete the will
    localStorage.removeItem('willFinalDocument');
    localStorage.removeItem('willVideoRecorded');
    
    // Close modal
    setDeleteModalOpen(false);
    
    // Navigate back to dashboard
    navigate('/dashboard');
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in';
    notification.innerHTML = '<div class="flex items-center"><span class="mr-2">✓</span>Will deleted successfully</div>';
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => {
        try {
          document.body.removeChild(notification);
        } catch (e) {
          // Element might have been removed already
        }
      }, 500);
    }, 3000);
  };

  const handleDuplicateWill = () => {
    setConfirmDuplicateModalOpen(true);
  };

  const confirmDuplicate = () => {
    // In a real app, this would make an API call to duplicate the will
    
    // Close modal
    setConfirmDuplicateModalOpen(false);
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in';
    notification.innerHTML = '<div class="flex items-center"><span class="mr-2">✓</span>Will duplicated successfully</div>';
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => {
        try {
          document.body.removeChild(notification);
        } catch (e) {
          // Element might have been removed already
        }
      }, 500);
    }, 3000);
  };

  const handleDownloadWill = async () => {
    try {
      // Import JSZip dynamically
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add will document
      zip.file("will_document.txt", willDocument);
      
      // Create documents folder
      const docsFolder = zip.folder("documents");
      
      // Add attachments
      attachments.forEach(attachment => {
        // In a real app, this would fetch the actual file content
        docsFolder?.file(attachment.name, `Sample content for ${attachment.name}`);
      });
      
      // Add video testimony if exists
      if (hasVideoTestimony) {
        zip.file("video_testimony.txt", "Video testimony reference");
      }
      
      // Generate zip
      const blob = await zip.generateAsync({ type: "blob" });
      
      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'WillTank_Package.zip';
      document.body.appendChild(link);
      link.click();
      
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in';
      notification.innerHTML = '<div class="flex items-center"><span class="mr-2">✓</span>Will package downloaded successfully</div>';
      document.body.appendChild(notification);
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Remove notification after 3 seconds
        notification.classList.add('animate-fade-out');
        setTimeout(() => {
          try {
            document.body.removeChild(notification);
          } catch (e) {
            // Element might have been removed already
          }
        }, 500);
      }, 3000);
    } catch (error) {
      console.error("Error downloading will package:", error);
    }
  };

  const handleShareWill = () => {
    // In a real app, this would open a sharing dialog
    alert('Sharing functionality would be implemented here');
  };

  const handlePrintWill = () => {
    window.print();
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    // In a real app, this would download the actual file
    alert(`Downloading ${attachment.name}`);
  };

  const handleViewVideo = () => {
    navigate('/dashboard/video-testimony');
  };

  return (
    <DashboardLayout title="View Will Details">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Will Document Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Last Will and Testament</h3>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleDownloadWill}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button 
                  onClick={handlePrintWill}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleShareWill}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <Share className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Document Preview */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-6"
            >
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 font-serif whitespace-pre-wrap prose dark:prose-invert max-w-none border border-gray-200 dark:border-gray-700 min-h-[300px] max-h-[500px] overflow-y-auto">
                {willDocument}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
              <button 
                onClick={handleEditWill}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Will
              </button>
              <button 
                onClick={handleDuplicateWill}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </button>
              <button 
                onClick={handleDeleteWill}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Will
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar with Attachments and Video */}
        <div className="lg:col-span-1 space-y-6">
          {/* Video Testimony */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                <Video className="h-5 w-5 text-primary mr-2" />
                Video Testimony
              </h3>
            </div>
            <div className="p-5">
              {hasVideoTestimony ? (
                <div className="flex flex-col items-center">
                  <div className="aspect-video w-full bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-600" />
                  </div>
                  <button 
                    onClick={handleViewVideo}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                  >
                    View Video Testimony
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No video testimony attached</p>
                  <button 
                    onClick={() => navigate('/video-recording')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Record Video
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                <File className="h-5 w-5 text-primary mr-2" />
                Attached Documents
              </h3>
              <button 
                onClick={() => navigate('/document-upload')} 
                className="text-primary hover:text-primary-dark transition-colors"
              >
                <FilePlus className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2">
              {attachments.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {attachments.map(attachment => (
                    <li key={attachment.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3">
                            <File className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{attachment.name}</p>
                            <div className="flex text-xs text-gray-500 dark:text-gray-400 space-x-2">
                              <span>{attachment.type}</span>
                              <span>•</span>
                              <span>{attachment.size}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <File className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No documents attached</p>
                  <button 
                    onClick={() => navigate('/document-upload')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Add Documents
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4"
          >
            <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-500">Delete Will?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this will? This action cannot be undone, and all associated documents and video testimony will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Duplicate Confirmation Modal */}
      {confirmDuplicateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Copy className="h-5 w-5 text-primary mr-2" />
              Duplicate Will
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This will create a new copy of your will and all its attachments. The new will can be modified independently from the original.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDuplicateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDuplicate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Create Duplicate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ViewWillDetails;