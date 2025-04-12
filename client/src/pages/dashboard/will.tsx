import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText, Download, Edit, Printer, Share, ArrowLeft } from 'lucide-react';

const WillPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [willDocument, setWillDocument] = useState<string>('');

  useEffect(() => {
    // Get will document from localStorage
    const savedWill = localStorage.getItem('willFinalDocument');
    if (savedWill) {
      setWillDocument(savedWill);
    } else {
      // If no will document is found, use a default empty template
      setWillDocument('Your will document will appear here once created.\n\nClick "Edit My Will" to start the process with Skyler, our AI assistant.');
    }
  }, []);

  const handleEditWill = () => {
    navigate('/ai-chat');
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
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 font-serif whitespace-pre-wrap prose dark:prose-invert max-w-none border border-gray-200 dark:border-gray-700 min-h-[600px]">
            {willDocument}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>Last Updated: {new Date().toLocaleDateString()}</div>
            <div>WillTank Document ID: WL-{Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WillPage;