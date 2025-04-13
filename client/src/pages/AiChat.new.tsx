import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useSkyler, SkylerMessage } from '@/hooks/use-skyler';
import { Send, User, PenSquare, Loader2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import AnimatedAurora from '@/components/ui/AnimatedAurora';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  guardianships?: Array<{
    name: string;
    relationship: string;
    contact?: string;
  }>;
  specialInstructions?: string;
}

const AiChat: React.FC = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [willData, setWillData] = useState<WillData>({
    personalInfo: {},
    beneficiaries: [],
    assets: []
  });
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [currentStage, setCurrentStage] = useState('introduction');
  const [isWillComplete, setIsWillComplete] = useState(false);
  const [isProcessingWill, setIsProcessingWill] = useState(false);
  
  // Template information
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Get Skyler AI state
  const {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    sendStreamingMessage,
    error
  } = useSkyler();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoadingAuth, navigate]);

  // Get selected template from localStorage
  useEffect(() => {
    const template = localStorage.getItem('selectedWillTemplate');
    if (template) {
      setSelectedTemplate(template);
    } else {
      // If no template is selected, redirect back to template selection
      navigate('/template-selection');
    }
  }, [navigate]);

  // Auto scroll to the latest message
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, streamingContent]);

  // Focus on input after loading
  useEffect(() => {
    if (inputRef.current && !isLoading && !isStreaming) {
      inputRef.current.focus();
    }
  }, [isLoading, isStreaming]);

  // Initialize Skyler with context when first loading
  useEffect(() => {
    if (messages.length === 0 && selectedTemplate) {
      // Set initial system message based on template
      sendStreamingMessage(
        `I'm creating a will using the "${selectedTemplate}" template. I need you to guide me through creating a complete will document step by step, starting with my personal information, then beneficiaries, assets, and so on. Please start by introducing yourself as Skyler and asking for my full legal name to begin.`
      );
    }
  }, [messages.length, selectedTemplate]);

  // Handle user's message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isStreaming) return;
    
    // Save the input and clear the field
    const userInput = input.trim();
    setInput('');
    
    // Extract information from conversation
    try {
      if (userInput.toLowerCase().includes('done') || 
          userInput.toLowerCase().includes('complete') || 
          userInput.toLowerCase().includes('finish')) {
        
        if (currentStage === 'confirmation') {
          setIsWillComplete(true);
        }
      }
      
      // Send the message to Skyler
      await sendStreamingMessage(userInput);
      
      // Try to detect will completion from AI response
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        const content = lastMessage.content.toLowerCase();
        
        if (content.includes('all the information') && 
            content.includes('will') && 
            (content.includes('complete') || content.includes('finish'))) {
          setCurrentStage('confirmation');
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle completion of will creation
  const handleCompleteWill = async () => {
    setIsProcessingWill(true);
    
    try {
      // Extract will data by asking Skyler to summarize
      await sendStreamingMessage('Please summarize all the information I've provided for my will in a structured JSON format.');
      
      // Create will in database
      const response = await apiRequest('POST', '/api/wills', {
        title: 'My Will',
        type: selectedTemplate || 'Standard',
        content: JSON.stringify({
          messages: messages,
          extracted: willData
        }),
        status: 'draft'
      });
      
      if (!response.ok) {
        throw new Error('Failed to save will');
      }
      
      const data = await response.json();
      
      // Store the will ID
      localStorage.setItem('currentWillId', data.id.toString());
      
      // Navigate to document upload
      navigate('/document-upload');
    } catch (error) {
      console.error('Error completing will:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete your will. Please try again.',
        variant: 'destructive'
      });
      setIsProcessingWill(false);
    }
  };

  // Format date for the document preview
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

  // Loading state
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <AnimatedAurora />
      </div>
      
      {/* Chat Area */}
      <div 
        className="flex-1 flex flex-col h-screen border-r border-gray-200 dark:border-gray-700"
        ref={chatContainerRef}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 backdrop-blur-sm z-10">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mr-3">
              <span className="text-white font-bold">S</span>
            </div>
            <div>
              <h2 className="font-semibold">Skyler</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden sm:block">
              <a href="/dashboard" className="text-sm text-primary hover:underline mr-4">Dashboard</a>
            </div>
            <a href="/" className="flex items-center">
              <Logo size="md" withText={false} />
            </a>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 relative">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' ? (
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg py-2 px-4 max-w-[85%] shadow-sm">
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="bg-blue-500 rounded-lg py-2 px-4 max-w-[85%] shadow-sm">
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 flex justify-start"
              >
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg py-2 px-4 max-w-[85%] shadow-sm">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {streamingContent}
                      <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Will completion button */}
            {isWillComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 mb-10 w-full flex justify-center"
              >
                <button
                  onClick={handleCompleteWill}
                  disabled={isProcessingWill}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                >
                  {isProcessingWill ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Complete Will & Continue to Documents"
                  )}
                </button>
              </motion.div>
            )}
            
            <div ref={endOfMessagesRef} />
          </AnimatePresence>
        </div>
        
        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 dark:text-gray-200"
                rows={1}
                style={{
                  minHeight: '50px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className={`absolute right-2 bottom-2 p-2 rounded-full ${
                  !input.trim() || isStreaming
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-primary hover:bg-primary/10'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Preview Panel */}
      <div className="w-full md:w-1/3 lg:w-2/5 h-screen bg-white dark:bg-gray-800 overflow-y-auto relative hidden md:block">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Will Preview</h3>
          </div>
          <button
            onClick={() => setPreviewExpanded(!previewExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {previewExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        
        <AnimatePresence>
          {previewExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <div className="prose prose-sm dark:prose-invert mx-auto">
                <h1 className="text-center text-2xl mb-8">Last Will and Testament</h1>
                
                <section className="mb-6">
                  <h2 className="text-lg font-semibold border-b pb-2 mb-3">Personal Information</h2>
                  <p>
                    <strong>Full Name:</strong> {willData.personalInfo.fullName || 'Not specified'}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong> {formatDate(willData.personalInfo.dateOfBirth) || 'Not specified'}
                  </p>
                  <p>
                    <strong>Address:</strong> {willData.personalInfo.address || 'Not specified'}
                  </p>
                  <p>
                    <strong>Marital Status:</strong> {willData.personalInfo.maritalStatus || 'Not specified'}
                  </p>
                </section>
                
                <section className="mb-6">
                  <h2 className="text-lg font-semibold border-b pb-2 mb-3">Beneficiaries</h2>
                  {willData.beneficiaries.length > 0 ? (
                    <ul>
                      {willData.beneficiaries.map((beneficiary, index) => (
                        <li key={index} className="mb-2">
                          <strong>{beneficiary.name}</strong> - {beneficiary.relationship}
                          {beneficiary.share && ` (${beneficiary.share})`}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No beneficiaries specified</p>
                  )}
                </section>
                
                <section className="mb-6">
                  <h2 className="text-lg font-semibold border-b pb-2 mb-3">Assets</h2>
                  {willData.assets.length > 0 ? (
                    <ul>
                      {willData.assets.map((asset, index) => (
                        <li key={index} className="mb-2">
                          <strong>{asset.type}</strong>: {asset.description}
                          {asset.estimatedValue && ` (Est. Value: ${asset.estimatedValue})`}
                          {asset.beneficiary && ` - To: ${asset.beneficiary}`}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No assets specified</p>
                  )}
                </section>
                
                <section className="mb-6">
                  <h2 className="text-lg font-semibold border-b pb-2 mb-3">Executor</h2>
                  {willData.executor ? (
                    <p>
                      <strong>{willData.executor.name}</strong> - {willData.executor.relationship}
                      {willData.executor.contact && ` (${willData.executor.contact})`}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No executor specified</p>
                  )}
                </section>
                
                {willData.specialInstructions && (
                  <section className="mb-6">
                    <h2 className="text-lg font-semibold border-b pb-2 mb-3">Special Instructions</h2>
                    <p>{willData.specialInstructions}</p>
                  </section>
                )}
                
                <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                  <p>This is a preview. The final document will be generated after completion.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiChat;