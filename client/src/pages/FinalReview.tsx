import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  FileText,
  Video,
  User,
  Check,
  Edit,
  X,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2,
  Shield,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import { saveWillProgress, WillCreationStep } from '@/lib/will-progress-tracker';

// Interface for will data
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
    share: string;
  }>;
  executor?: {
    name: string;
    relationship: string;
  };
  assets: Array<{
    type: string;
    description: string;
    beneficiary: string;
  }>;
  specialInstructions?: string;
}

// Interface for contact
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  relationship: string;
  role: string;
}

// Interface for document
interface Document {
  id: number;
  willId: number;
  name: string;
  path: string;
  type: string;
  uploadDate: string;
  size: number;
}

const FinalReview: React.FC = () => {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [willData, setWillData] = useState<WillData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [hasVideo, setHasVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    will: true,
    documents: true,
    contacts: true,
    video: true
  });
  const [willId, setWillId] = useState<string | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, authLoading, navigate]);

  // Load all required data
  useEffect(() => {
    if (!user) return;
    
    saveWillProgress(WillCreationStep.FINAL_REVIEW);
    loadAllData();
  }, [user]);

  // Load all data needed for the preview
  const loadAllData = async () => {
    setIsLoading(true);
    
    try {
      // Get will ID from localStorage
      const storedWillId = localStorage.getItem('currentWillId');
      setWillId(storedWillId);
      
      if (!storedWillId) {
        throw new Error('No will ID found');
      }
      
      // Load will data
      await loadWillData(storedWillId);
      
      // Load contacts
      await loadContacts();
      
      // Load documents
      await loadDocuments(storedWillId);
      
      // Check for video
      await checkVideo(storedWillId);
      
    } catch (error) {
      console.error('Error loading preview data:', error);
      
      // Fall back to localStorage data
      const savedWillData = localStorage.getItem('willData');
      if (savedWillData) {
        try {
          setWillData(JSON.parse(savedWillData));
        } catch (e) {
          console.error('Error parsing saved will data:', e);
        }
      }
      
      const savedContacts = localStorage.getItem('willContacts');
      if (savedContacts) {
        try {
          setContacts(JSON.parse(savedContacts));
        } catch (e) {
          console.error('Error parsing saved contacts:', e);
        }
      }
      
      toast({
        title: 'Loading Error',
        description: 'Some will information could not be loaded from the server.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load will data from API
  const loadWillData = async (willId: string) => {
    try {
      const response = await apiRequest('GET', `/api/wills/${willId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load will data');
      }
      
      const data = await response.json();
      
      // Extract will data from content
      if (data.content) {
        try {
          const content = JSON.parse(data.content);
          if (content.extracted) {
            setWillData(content.extracted);
          }
        } catch (error) {
          console.error('Error parsing will content:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading will data:', error);
      throw error;
    }
  };

  // Load contacts from API
  const loadContacts = async () => {
    try {
      const response = await apiRequest('GET', `/api/beneficiaries`);
      
      if (!response.ok) {
        throw new Error('Failed to load contacts');
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      throw error;
    }
  };

  // Load documents from API
  const loadDocuments = async (willId: string) => {
    try {
      const response = await apiRequest('GET', `/api/wills/${willId}/documents`);
      
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
      throw error;
    }
  };

  // Check if video exists
  const checkVideo = async (willId: string) => {
    try {
      // First check localStorage flag
      const videoRecorded = localStorage.getItem('willVideoRecorded');
      
      if (videoRecorded === 'true') {
        setHasVideo(true);
        
        // Try to get video URL from API
        try {
          const response = await apiRequest('GET', `/api/wills/${willId}/video`);
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.videoUrl) {
              setVideoUrl(data.videoUrl);
            }
          }
        } catch (e) {
          // Ignore error, we'll just not show the video preview
          console.error('Error fetching video URL:', e);
        }
      }
    } catch (error) {
      console.error('Error checking video:', error);
      // Don't throw, just continue
    }
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle edit buttons
  const handleEditWill = () => {
    navigate('/will-creation/details');
  };

  const handleEditDocuments = () => {
    navigate('/will-creation/documents');
  };

  const handleEditContacts = () => {
    navigate('/will-creation/contacts');
  };

  const handleEditVideo = () => {
    navigate('/will-creation/video');
  };

  // Handle proceeding to payment
  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Mark the will as completed
      await apiRequest('POST', '/api/user/will-status', {
        willId: parseInt(willId || '0'),
        progress: WillCreationStep.PAYMENT,
        willInProgress: true,
        willCompleted: false
      });
      
      // Save progress
      saveWillProgress(WillCreationStep.PAYMENT);
      
      // Navigate to subscription page
      navigate(`/subscription?willId=${willId}`);
    } catch (error) {
      console.error('Error proceeding to payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to proceed to payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading || authLoading) {
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
      
      <div className="container mx-auto px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Final Review</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review all information before finalizing your will
            </p>
          </div>
          
          {/* Will Information Section */}
          <Card className="mb-6 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
            <div 
              className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('will')}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-lg font-semibold">Will Information</h2>
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditWill();
                  }}
                  className="mr-2"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {expandedSections.will ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
            
            {expandedSections.will && willData && (
              <CardContent className="p-6">
                {/* Personal Information */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="text-gray-900 dark:text-white">{willData.personalInfo?.fullName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <p className="text-gray-900 dark:text-white">{willData.personalInfo?.dateOfBirth || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-900 dark:text-white">{willData.personalInfo?.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Marital Status</p>
                      <p className="text-gray-900 dark:text-white">{willData.personalInfo?.maritalStatus || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Beneficiaries */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Beneficiaries
                  </h3>
                  {willData.beneficiaries && willData.beneficiaries.length > 0 ? (
                    <div className="space-y-4">
                      {willData.beneficiaries.map((beneficiary, index) => (
                        <div key={`beneficiary-${index}`} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{beneficiary.name}</p>
                              <p className="text-sm text-gray-500">{beneficiary.relationship}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Share: {beneficiary.share}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No beneficiaries specified</p>
                  )}
                </div>
                
                {/* Executor */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Executor
                  </h3>
                  {willData.executor ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="font-medium">{willData.executor.name}</p>
                      <p className="text-sm text-gray-500">{willData.executor.relationship}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No executor specified</p>
                  )}
                </div>
                
                {/* Assets */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Assets
                  </h3>
                  {willData.assets && willData.assets.length > 0 ? (
                    <div className="space-y-4">
                      {willData.assets.map((asset, index) => (
                        <div key={`asset-${index}`} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{asset.type}</p>
                              <p className="text-sm text-gray-500">{asset.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">To: {asset.beneficiary}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No assets specified</p>
                  )}
                </div>
                
                {/* Special Instructions */}
                {willData.specialInstructions && (
                  <div>
                    <h3 className="text-md font-semibold mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Special Instructions
                    </h3>
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                      {willData.specialInstructions}
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Documents Section */}
          <Card className="mb-6 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
            <div 
              className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('documents')}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-lg font-semibold">Supporting Documents</h2>
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditDocuments();
                  }}
                  className="mr-2"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {expandedSections.documents ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
            
            {expandedSections.documents && (
              <CardContent className="p-6">
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mr-3">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={doc.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No documents uploaded</p>
                    <Button
                      onClick={handleEditDocuments}
                      variant="outline"
                      className="mt-4"
                    >
                      Upload Documents
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Contacts Section */}
          <Card className="mb-6 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
            <div 
              className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('contacts')}
            >
              <div className="flex items-center">
                <User className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditContacts();
                  }}
                  className="mr-2"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {expandedSections.contacts ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
            
            {expandedSections.contacts && (
              <CardContent className="p-6">
                {contacts.length > 0 ? (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{contact.name}</h3>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs">
                            {contact.role.charAt(0).toUpperCase() + contact.role.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-2" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-2" />
                            <span>{contact.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-2" />
                            <span>{contact.country}</span>
                          </div>
                          <div className="pt-1">Relationship: {contact.relationship}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No contacts added</p>
                    <Button
                      onClick={handleEditContacts}
                      variant="outline"
                      className="mt-4"
                    >
                      Add Contacts
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Video Section */}
          <Card className="mb-8 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
            <div 
              className="p-4 bg-gray-100 dark:bg-gray-800 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('video')}
            >
              <div className="flex items-center">
                <Video className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-lg font-semibold">Video Testimony</h2>
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditVideo();
                  }}
                  className="mr-2"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {expandedSections.video ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
            
            {expandedSections.video && (
              <CardContent className="p-6">
                {hasVideo ? (
                  <div>
                    <div className="mb-3 flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Video testimony recorded</span>
                    </div>
                    
                    {videoUrl && (
                      <div className="mt-4">
                        <p className="mb-2 font-medium">Video Preview:</p>
                        <video 
                          src={videoUrl} 
                          controls 
                          className="w-full max-w-lg h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                        ></video>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No video testimony recorded</p>
                    <Button
                      onClick={handleEditVideo}
                      variant="outline"
                      className="mt-4"
                    >
                      Record Video
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Security Notice */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300">
            <div className="flex">
              <Shield className="h-5 w-5 flex-shrink-0 mt-1 mr-3" />
              <div>
                <h3 className="font-medium mb-1">Security and Privacy Notice</h3>
                <p className="text-sm">
                  All your documents, contacts, and videos are encrypted and securely stored. Only you and your authorized beneficiaries will have access to them. Your will information is saved in compliance with legal standards for digital wills.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/will-creation/video')}
              className="order-2 md:order-1"
            >
              Back
            </Button>
            
            <div className="order-1 md:order-2 flex flex-col items-center">
              <Button
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg px-8 py-6 rounded-lg text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Your will and documents will be finalized after payment
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinalReview;