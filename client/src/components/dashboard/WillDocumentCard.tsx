import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share, Edit, Eye, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface WillDocumentCardProps {
  dateCreated?: string;
  lastModified?: string;
}

const WillDocumentCard: React.FC<WillDocumentCardProps> = ({
  dateCreated = 'May 10, 2024',
  lastModified = 'May 15, 2024'
}) => {
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [, navigate] = useLocation();

  const handleEditClick = () => {
    navigate('/ai-chat');
  };

  const handleViewPreview = () => {
    navigate('/dashboard/will');
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
          <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
            <Download className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
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
        <div className="w-full max-w-xs mx-auto bg-white dark:bg-gray-800 p-5 rounded-md shadow-md font-serif text-sm text-gray-800 dark:text-gray-200">
          <h2 className="text-center text-base font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
            LAST WILL AND TESTAMENT
          </h2>
          <p className="text-xs mb-2">
            I, <span className="font-bold">John Doe</span>, being of sound mind, make this my Last Will and Testament...
          </p>
          <div className="text-xs opacity-75 mb-1">
            <span className="font-semibold">Executor:</span> Jane Smith
          </div>
          <div className="text-xs opacity-75 mb-1">
            <span className="font-semibold">Beneficiaries:</span> 4 people
          </div>
          <div className="text-xs opacity-75">
            <span className="font-semibold">Assets:</span> 7 items
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-center text-xs">
            <em>This is a preview. Click to view full document.</em>
          </div>
        </div>

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
          <div>Created: {dateCreated}</div>
          <div>Last Modified: {lastModified}</div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs font-medium text-green-800 dark:text-green-400">Active</span>
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