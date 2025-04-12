import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText, Download, Edit, Printer, Share, ArrowLeft, Save, Check, X } from 'lucide-react';

const WillPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [willDocument, setWillDocument] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedWillDocument, setEditedWillDocument] = useState<string>('');

  useEffect(() => {
    // Get will document from localStorage
    const savedWill = localStorage.getItem('willFinalDocument');
    if (savedWill) {
      setWillDocument(savedWill);
      setEditedWillDocument(savedWill);
    } else {
      // If no will document is found, use a default empty template
      const defaultText = 'Your will document will appear here once created.\n\nClick "Edit My Will" to start the process with Skyler, our AI assistant.';
      setWillDocument(defaultText);
      setEditedWillDocument(defaultText);
    }
    
    // Check if we should enter edit mode directly
    const editMode = localStorage.getItem('willEditMode');
    if (editMode === 'true') {
      setIsEditing(true);
      // Clear the flag after using it
      localStorage.removeItem('willEditMode');
    }
  }, []);

  const handleEditWill = () => {
    if (willDocument.includes('Click "Edit My Will" to start the process with Skyler')) {
      // If it's a new document, navigate to the AI assistant
      navigate('/ai-chat');
    } else {
      // Otherwise, enable editing mode
      setIsEditing(true);
      setEditedWillDocument(willDocument);
    }
  };

  const handleSaveWill = () => {
    setWillDocument(editedWillDocument);
    localStorage.setItem('willFinalDocument', editedWillDocument);
    setIsEditing(false);
    
    // Show success notification (could use a toast component in a real app)
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in';
    notification.innerHTML = '<div class="flex items-center"><span class="mr-2">✓</span>Will saved successfully</div>';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedWillDocument(willDocument);
  };

  const handleDownloadWill = () => {
    try {
      const blob = new Blob([willDocument], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'WillTank_Document.txt';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleShareWill = () => {
    // In a real implementation, this would open a sharing dialog
    alert('Sharing functionality would be implemented here');
  };

  const handlePrintWill = () => {
    window.print();
  };

  return (
    <DashboardLayout title="My Will">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

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
            <button 
              onClick={handleEditWill}
              className="px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit My Will
            </button>
          </div>
        </div>

        {/* Document Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-6"
        >
          {isEditing ? (
            <div className="relative">
              <textarea 
                value={editedWillDocument}
                onChange={(e) => setEditedWillDocument(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 rounded-lg p-8 font-serif whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-primary border border-gray-300 dark:border-gray-600 min-h-[600px] text-gray-800 dark:text-gray-200"
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button 
                  onClick={handleCancelEdit}
                  className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </button>
                <button 
                  onClick={handleSaveWill}
                  className="p-2 rounded-md bg-primary text-white hover:bg-primary-dark transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 font-serif whitespace-pre-wrap prose dark:prose-invert max-w-none border border-gray-200 dark:border-gray-700 min-h-[600px]">
              {willDocument}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>Last Updated: {new Date().toLocaleDateString()}</div>
            <div>WillTank Document ID: WL-{Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
          </div>
          {isEditing && (
            <div className="mt-2 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300 text-sm">
              <strong>Editing mode:</strong> Make changes to your will document, then click "Save Changes" when you're done.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WillPage;