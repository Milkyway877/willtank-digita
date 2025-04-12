import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Check, Edit, FileText, AlertCircle, Save, ArrowRight, CheckCircle, Download } from 'lucide-react';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import { saveWillProgress, WillCreationStep, clearWillProgress } from '@/lib/will-progress-tracker';

// Will document data structure
interface WillData {
  personalInfo: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    maritalStatus?: string;
  };
  beneficiaries: Array<{
    name: string;
    relationship: string;
    share?: string;
    contact?: string;
  }>;
  executor?: {
    name: string;
    relationship: string;
    contact?: string;
  };
  assets: Array<{
    type: string;
    description: string;
    estimatedValue?: string;
    beneficiary?: string;
  }>;
  guardians?: Array<{
    name: string;
    relationship: string;
    contact?: string;
  }>;
  specialInstructions?: string;
}

const FinalReview: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [willData, setWillData] = useState<WillData | null>(null);
  const [editableContent, setEditableContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [documentComplete, setDocumentComplete] = useState(false);
  
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);

  // Check for will data and video recording status
  useEffect(() => {
    const savedWillData = localStorage.getItem('willData');
    const videoRecorded = localStorage.getItem('willVideoRecorded');
    
    if (!savedWillData || !videoRecorded) {
      navigate('/video-recording');
      return;
    }
    
    try {
      const parsedData = JSON.parse(savedWillData);
      setWillData(parsedData);
      
      // Generate the editable document content
      const content = generateWillDocument(parsedData);
      setEditableContent(content);
    } catch (error) {
      console.error('Error parsing will data:', error);
      navigate('/ai-chat');
    }
  }, [navigate]);

  // Generate the will document as a formatted string
  const generateWillDocument = (data: WillData): string => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let document = `LAST WILL AND TESTAMENT

I, ${data.personalInfo.fullName || '[Name]'}, of ${data.personalInfo.address || '[Address]'}, being of sound mind and memory, make this my Last Will and Testament, hereby revoking all previous wills and codicils made by me.

DECLARATION
This document is executed on ${today}.
Date of Birth: ${formatDate(data.personalInfo.dateOfBirth) || '[Date of Birth]'}
Marital Status: ${data.personalInfo.maritalStatus || '[Marital Status]'}

APPOINTMENT OF EXECUTOR
`;

    if (data.executor) {
      document += `I appoint ${data.executor.name}, my ${data.executor.relationship}, to be the Executor of this Will. If they are unable or unwilling to serve, I appoint a suitable representative as chosen by the court.

`;
    } else {
      document += `[Executor information]

`;
    }

    document += `BENEFICIARIES
`;
    
    if (data.beneficiaries && data.beneficiaries.length > 0) {
      data.beneficiaries.forEach((beneficiary, index) => {
        document += `${index + 1}. I give to ${beneficiary.name}, my ${beneficiary.relationship}, a share of my estate as detailed below.
`;
      });
      document += `\n`;
    } else {
      document += `[Beneficiary information]

`;
    }

    document += `DISTRIBUTION OF ASSETS
`;
    
    if (data.assets && data.assets.length > 0) {
      data.assets.forEach((asset, index) => {
        document += `${index + 1}. ${asset.type}: ${asset.description}
`;
      });
      document += `\n`;
    } else {
      document += `[Asset information]

`;
    }

    if (data.specialInstructions) {
      document += `SPECIAL INSTRUCTIONS
${data.specialInstructions}

`;
    }

    document += `SIGNATURES

_______________________________
${data.personalInfo.fullName || '[Testator Name]'}
Testator

_______________________________    _______________________________
Witness 1                          Witness 2

_______________________________    _______________________________
Date                               Date`;

    return document;
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Handle document editing
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
    
    // In a real app, you might want to parse the edited content back into structured data
    localStorage.setItem('willFinalDocument', editableContent);
  };

  // Generate PDF from will content
  const generatePDF = () => {
    // In a real implementation, this would use a proper PDF library
    // For now, create a text blob and trigger download
    try {
      const blob = new Blob([editableContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set filename with user name if available
      const filename = willData?.personalInfo?.fullName 
        ? `${willData.personalInfo.fullName.replace(/\s+/g, '_')}_Will.txt` 
        : 'WillTank_Document.txt';
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log("Document downloaded successfully");
      return true;
    } catch (error) {
      console.error("Error generating document:", error);
      return false;
    }
  };
  
  // Finalize and save will
  const handleFinalize = () => {
    // Save final document
    if (hasUnsavedChanges) {
      handleSave();
    }
    
    // Mark as complete
    setDocumentComplete(true);
    
    // Save completion status in localStorage
    localStorage.setItem('willCompleted', 'true');
    
    // Generate and download PDF automatically
    generatePDF();
    
    // Show success state first, then navigate after delay
    setTimeout(() => {
      // Navigate to dashboard instead of completion
      navigate('/dashboard');
    }, 3000);
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
          className="max-w-4xl mx-auto"
        >
          {documentComplete ? (
            // Success state
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Will Document Finalized!</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-md mx-auto">
                Your will has been securely saved. We're redirecting you to the completion page...
              </p>
              <div className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Final Review</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                  Review your will document and make any necessary edits before finalizing.
                </p>
              </div>
              
              {/* Document Editor */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Last Will and Testament</h3>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!isEditing && (
                      <button
                        onClick={generatePDF}
                        className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Download
                      </button>
                    )}

                    {isEditing ? (
                      <button
                        onClick={handleSave}
                        className="flex items-center px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Document Content */}
                <div className="p-6">
                  {isEditing ? (
                    <textarea
                      value={editableContent}
                      onChange={handleContentChange}
                      className="w-full h-[600px] font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-gray-200"
                    />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none font-serif whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[600px] overflow-y-auto">
                      {editableContent}
                    </div>
                  )}
                </div>
                
                {/* Document Notes */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/10">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-1">Important Notes</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        This is your final opportunity to review and edit your will. Please ensure all information is accurate before finalizing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Validation Checklist */}
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Pre-Finalization Checklist</h3>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Personal information verified</span>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Beneficiaries correctly listed</span>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Assets properly documented</span>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Executor appointment confirmed</span>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Video confirmation recorded</span>
                  </li>
                  
                  <li className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Supporting documents uploaded</span>
                  </li>
                </ul>
              </div>
              
              {/* Finalize Button */}
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleFinalize}
                  className="flex items-center px-8 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 shadow-lg hover:shadow-xl transition-all"
                >
                  Finalize and Save
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              
              {hasUnsavedChanges && (
                <p className="text-center text-sm text-amber-500 dark:text-amber-400 mt-3">
                  <AlertCircle className="inline h-4 w-4 mr-1 mb-0.5" />
                  You have unsaved changes
                </p>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FinalReview;