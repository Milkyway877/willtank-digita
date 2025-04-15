import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, RefreshCw, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useSkyler, SkylerMessage } from '@/hooks/use-skyler';
import { useAuth } from '@/hooks/use-auth';
import { WillCreationStep, saveWillProgress as trackWillProgress } from '@/lib/will-progress-tracker';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

/**
 * Interface for Will Data extracted from Skyler conversation
 */
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

/**
 * Template instructions for different will types
 */
const TEMPLATE_INSTRUCTIONS = {
  standard: `
For a Standard Will, cover the essentials:
- Personal property distribution
- Basic beneficiary designations
- Simple executor instructions
- Digital asset instructions
- Basic funeral/memorial wishes`,
  
  family: `
For a Family Protection Will, you should focus on:
- Guardianship for minor children
- Trust arrangements for children's inheritance
- Specific provisions for spouse/partner
- Family heirlooms and their distribution
- Education funds or special provisions for dependents`,
  
  business: `
For a Business Owner Will, you should focus on:
- Business succession planning
- Ownership transfer instructions
- Partner buyout provisions
- Treatment of business assets vs personal assets
- Any special instructions for business continuation`,
  
  property: `
For a Real Estate Focused Will, you should focus on:
- Detailed inventory of all real estate holdings
- Specific instructions for each property
- Rental/income properties management
- Mortgage and debt handling
- Joint ownership considerations`
};

/**
 * Map template IDs to display names
 */
const TEMPLATE_NAMES: Record<string, string> = {
  'standard': 'Standard Will',
  'family': 'Family Protection Will',
  'business': 'Business Owner Will',
  'property': 'Real Estate Focused Will'
};

/**
 * Skyler AI Chat Component - Completely Redesigned
 */
export const AiChat = () => {
  // UI State
  const [input, setInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [willData, setWillData] = useState<WillData>({
    personalInfo: {},
    beneficiaries: [],
    assets: [],
    specialInstructions: ''
  });
  const [willId, setWillId] = useState<number | null>(null);
  const [isConversationInitialized, setIsConversationInitialized] = useState(false);
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const savingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, refetchUser } = useAuth();
  
  // Skyler Chat API
  const {
    messages,
    sendStreamingMessage,
    streamingContent,
    isLoading,
    isStreaming,
    error,
    clearMessages,
    addMessage,
    retryLastMessage
  } = useSkyler();

  // Load template selection and handle URL parameters
  useEffect(() => {
    // Update progress tracker
    trackWillProgress(WillCreationStep.CHAT);
    
    // Check URL for willId parameter first (this indicates a new will creation from template)
    const params = new URLSearchParams(window.location.search);
    const willIdParam = params.get('willId');
    
    if (willIdParam) {
      // This is a brand new will from template selection
      const willIdNum = parseInt(willIdParam, 10);
      if (!isNaN(willIdNum)) {
        setWillId(willIdNum);
        
        // Update localStorage with this new will ID
        localStorage.setItem('currentWillId', willIdParam);
        
        // Do NOT load existing will data as this is a new creation
        console.log('Starting fresh will creation for ID:', willIdNum);
        
        // Ensure we clear any previous will data
        localStorage.removeItem('willData');
      }
    } else {
      // No willId in URL, try to resume existing will from localStorage
      
      // Get selected template
      const storedTemplate = localStorage.getItem('selectedWillTemplate');
      if (storedTemplate) {
        setSelectedTemplate(storedTemplate);
      }
      
      // Check if there's an in-progress will
      const storedWillId = localStorage.getItem('currentWillId');
      if (storedWillId) {
        const willIdNum = parseInt(storedWillId, 10);
        if (!isNaN(willIdNum)) {
          setWillId(willIdNum);
          loadExistingWill(willIdNum);
        }
      }
      
      // Try to load saved will data
      const savedWillData = localStorage.getItem('willData');
      if (savedWillData) {
        try {
          const parsedData = JSON.parse(savedWillData);
          if (parsedData) {
            setWillData(prevData => ({
              ...prevData,
              ...parsedData
            }));
          }
        } catch (error) {
          console.error('Error parsing saved will data:', error);
        }
      }
    }
    
    // Clean up saving timeout on unmount
    return () => {
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
    };
  }, []);
  
  // Update user's will in progress status
  useEffect(() => {
    const updateWillStatus = async () => {
      try {
        const response = await apiRequest('POST', '/api/user/update-profile', {
          willInProgress: true
        });
        
        if (response.ok) {
          await refetchUser();
        }
      } catch (error) {
        console.error('Error updating will progress status:', error);
      }
    };
    
    // Only update status if conversation has started
    if (messages.length > 0 && !isSaving) {
      updateWillStatus();
    }
  }, [messages.length, refetchUser, isSaving]);
  
  // Initialize Skyler conversation - only once when component mounts
  useEffect(() => {
    // Check URL for willId and selectedTemplate params (when coming from template selection)
    const params = new URLSearchParams(window.location.search);
    const willIdParam = params.get('willId');
    
    // If we have a will ID in the URL and no conversation yet, immediately initialize
    // with the stored template (this would be the case for a fresh will creation)
    if (willIdParam && !isConversationInitialized && messages.length === 0) {
      const storedTemplate = localStorage.getItem('selectedWillTemplate');
      if (storedTemplate) {
        console.log('Starting new will conversation with template:', storedTemplate);
        initializeConversation(storedTemplate);
        setIsConversationInitialized(true);
      }
    }
    // Normal initialization for cases where we already have a template selected
    else if (selectedTemplate && !isConversationInitialized && messages.length === 0) {
      initializeConversation(selectedTemplate);
      setIsConversationInitialized(true);
    }
  }, [selectedTemplate, isConversationInitialized, messages.length]);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, streamingContent]);
  
  // Auto-save will progress after user inactivity
  useEffect(() => {
    // Only try to save if there are actual messages and a template
    if (messages.length > 1 && selectedTemplate) {
      // Clear any existing timeout
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
      
      // Set a new timeout to save after inactivity (3 seconds)
      savingTimeoutRef.current = setTimeout(() => {
        saveWillProgress();
      }, 3000);
    }
    
    return () => {
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
    };
  }, [messages, willData]);
  
  /**
   * Initialize the conversation with a system message and welcome message
   */
  const initializeConversation = (template: string) => {
    // Clear any previous messages
    clearMessages();
    
    const templateName = TEMPLATE_NAMES[template] || 'Standard Will';
    const templateInstructions = TEMPLATE_INSTRUCTIONS[template as keyof typeof TEMPLATE_INSTRUCTIONS] || TEMPLATE_INSTRUCTIONS.standard;
    
    // Add system message to guide Skyler's behavior
    const systemMessage: Omit<SkylerMessage, 'id' | 'timestamp'> = {
      role: 'system',
      content: `You are Skyler, an AI assistant specializing in ${templateName} creation. Guide the user through creating their will in a conversational manner.
        
Your task is to extract the following information step by step:
1. Personal details (name, date of birth, address, marital status)
2. Beneficiaries (name, relationship, share of estate)
3. Executor information
4. Assets and their distribution
5. Guardian information (if applicable)
6. Special instructions

${templateInstructions}

IMPORTANT GUIDELINES:
- Be friendly, compassionate, and patient
- Ask ONE question at a time and wait for a response
- After each answer, acknowledge it and ask the next logical question
- Store information provided in a structured way
- If an answer is unclear, ask for clarification before moving on
- When all information is gathered, help the user summarize their will
- Tell the user they can proceed to document upload when finished

When all questions are answered, output a JSON summary of the will in this format:
\`\`\`json
{
  "personalInfo": {
    "fullName": "",
    "dateOfBirth": "",
    "address": "",
    "maritalStatus": ""
  },
  "beneficiaries": [
    {"name": "", "relationship": "", "share": ""}
  ],
  "executor": {"name": "", "relationship": ""},
  "assets": [
    {"type": "", "description": "", "beneficiary": ""}
  ],
  "specialInstructions": ""
}
\`\`\`

Let the conversation flow naturally. Each of your responses should end with a question that guides the user to provide the next piece of information.`
    };
    
    // Add system message
    addMessage(systemMessage);
    
    // Add welcome message with slight delay
    setTimeout(() => {
      const welcomeMessage: Omit<SkylerMessage, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: `Hi there! I'm Skyler, your personal will creation assistant. I'll help you create a ${templateName} by asking you some questions about your personal information, beneficiaries, assets, and other important details.

Let's get started! First, could you please tell me your full legal name?`
      };
      
      addMessage(welcomeMessage);
    }, 300);
  };
  
  /**
   * Load an existing will from the database
   */
  const loadExistingWill = async (willId: number) => {
    try {
      const response = await apiRequest('GET', `/api/wills/${willId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load will');
      }
      
      const willData = await response.json();
      
      // Try to parse stored messages and data
      if (willData.content) {
        try {
          const content = JSON.parse(willData.content);
          
          // If there are stored messages, use them
          if (content.messages && Array.isArray(content.messages)) {
            // Need to convert to proper format with IDs and timestamps
            const formattedMessages = content.messages.map((msg: any) => ({
              id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp || Date.now()
            }));
            
            // Update Skyler with these messages
            if (formattedMessages.length > 0) {
              // Clear messages first
              clearMessages();
              
              // Add messages one by one with slight delay
              formattedMessages.forEach((msg: any, index: number) => {
                setTimeout(() => {
                  addMessage({
                    role: msg.role,
                    content: msg.content
                  });
                }, index * 50);
              });
              
              setIsConversationInitialized(true);
            }
          }
          
          // If there's extracted data, use it
          if (content.extracted) {
            setWillData(prevData => ({
              ...prevData,
              ...content.extracted
            }));
          }
          
        } catch (error) {
          console.error('Error parsing will content:', error);
          // If there was an error, initialize a new conversation
          setTimeout(() => {
            if (!isConversationInitialized && messages.length === 0) {
              initializeConversation(selectedTemplate);
              setIsConversationInitialized(true);
            }
          }, 500);
        }
      }
      
    } catch (error) {
      console.error('Error loading will:', error);
      toast({
        title: 'Error loading will',
        description: 'Failed to load your previous will progress. Starting fresh.',
        variant: 'destructive'
      });
      
      // Initialize a new conversation if loading failed
      setTimeout(() => {
        if (!isConversationInitialized && messages.length === 0) {
          initializeConversation(selectedTemplate);
          setIsConversationInitialized(true);
        }
      }, 500);
    }
  };
  
  /**
   * Extract will data from AI response
   */
  const extractWillData = useCallback((content: string): boolean => {
    try {
      // Try different JSON extraction patterns
      const jsonPatterns = [
        /```json([\s\S]*?)```/, // Standard markdown
        /```([\s\S]*?)```/,     // Generic code block
        /{[\s\S]*"personalInfo"[\s\S]*}/  // JSON with expected structure
      ];
      
      let extractedJson = null;
      
      // Try each pattern
      for (const pattern of jsonPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          extractedJson = match[1].trim();
          break;
        }
      }
      
      // If no match with regex, try finding JSON object directly
      if (!extractedJson && content.includes('{') && content.includes('}')) {
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}') + 1;
        if (start >= 0 && end > start) {
          extractedJson = content.substring(start, end);
        }
      }
      
      if (extractedJson) {
        try {
          const parsedData = JSON.parse(extractedJson);
          
          // Make sure it has expected structure
          if (parsedData && typeof parsedData === 'object') {
            console.log('Extracted will data:', parsedData);
            
            // Merge with existing data
            const updatedData = {
              ...willData,
              personalInfo: {
                ...willData.personalInfo,
                ...(parsedData.personalInfo || {})
              },
              beneficiaries: parsedData.beneficiaries || willData.beneficiaries || [],
              executor: parsedData.executor || willData.executor,
              assets: parsedData.assets || willData.assets || [],
              specialInstructions: parsedData.specialInstructions || willData.specialInstructions
            };
            
            setWillData(updatedData);
            
            // Save to localStorage
            localStorage.setItem('willData', JSON.stringify(updatedData));
            return true;
          }
        } catch (error) {
          console.warn('Error parsing extracted JSON:', error);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error extracting will data:', error);
      return false;
    }
  }, [willData]);
  
  /**
   * Save will progress to database
   */
  const saveWillProgress = async () => {
    // Don't save if already saving or no messages
    if (isSaving || messages.length <= 1) return;
    
    setIsSaving(true);
    
    try {
      const payload = {
        title: willData.personalInfo?.fullName 
          ? `Will for ${willData.personalInfo.fullName} (Draft)` 
          : 'My Will (Draft)',
        type: selectedTemplate || 'standard',
        content: JSON.stringify({
          messages: messages,
          extracted: willData
        }),
        status: 'draft'
      };
      
      // Determine if we're creating or updating
      const endpoint = willId ? `/api/wills/${willId}` : '/api/wills';
      const method = willId ? 'PUT' : 'POST';
      
      console.log(`${method} request to ${endpoint} for will progress`);
      const response = await apiRequest(method, endpoint, payload);
      
      if (!response.ok) {
        const errorResponse = await response.json();
        
        // If we get a 403 Unauthorized error for a will update, we need to create a new will instead
        if (response.status === 403 && errorResponse.error === "Unauthorized access to will" && willId) {
          console.warn("Unauthorized access to will, creating a new will instead");
          // Reset willId so we create a new will
          setWillId(null);
          localStorage.removeItem('currentWillId');
          
          // Recursively call saveWillProgress to create a new will
          return await saveWillProgress();
        }
        
        throw new Error(`Failed to save will progress: ${errorResponse.error || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store will ID for future updates
      if (!willId && data.id) {
        setWillId(data.id);
        localStorage.setItem('currentWillId', data.id.toString());
        console.log(`Created new will with ID: ${data.id}`);
      } else {
        console.log(`Updated existing will with ID: ${data.id}`);
      }
      
      return data.id;
    } catch (error) {
      console.error('Error saving will progress:', error);
      // Don't show toast for every auto-save error to avoid spamming the user
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * Handle sending a message to Skyler
   */
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    setInput('');
    
    try {
      // Send message to Skyler
      const assistantMessage = await sendStreamingMessage(userInput);
      
      // Try to extract will data from response
      if (assistantMessage) {
        extractWillData(assistantMessage.content);
      }
      
      // Auto-save will progress
      // Handled by the useEffect
      
    } catch (error) {
      console.error('Error in chat conversation:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong with the conversation. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Handle completing the will creation and moving to Document Upload
   */
  const handleCompleteWill = async () => {
    if (isLoading || isFinalizing) return;
    
    setIsFinalizing(true);
    
    try {
      // Ask Skyler to summarize the will
      await sendStreamingMessage("Can you please provide a final summary of my will in JSON format that includes all the information I have shared with you?");
      
      // Save the final will and get the possibly updated willId
      const savedWillId = await saveWillProgress();
      
      if (!savedWillId) {
        throw new Error("Failed to save will data before proceeding");
      }
      
      // Always use the most recent willId (it might have changed if we encountered auth errors)
      console.log(`Using willId: ${savedWillId} for will status update`);
      
      // Mark the will as in progress, NOT completed (it's not completed until final review)
      await apiRequest('POST', '/api/user/will-status', {
        willId: savedWillId,
        progress: WillCreationStep.DOCUMENT_UPLOAD,
        willInProgress: true,
        willCompleted: false
      });
      
      // Update progress tracker to document upload (next step)
      trackWillProgress(WillCreationStep.DOCUMENT_UPLOAD);
      
      // Navigate to document upload as the next step in the will creation flow
      toast({
        title: 'Information Collected Successfully',
        description: 'Next, please upload important documents to accompany your will.',
      });
      
      console.log(`Will creation continuing to document upload. WillId: ${savedWillId}`);
      
      // Use timeout to allow the toast to be shown
      setTimeout(() => {
        // Always pass the most up-to-date willId
        navigate(`/will-creation/documents?willId=${savedWillId}`);
      }, 1000);
      
    } catch (error) {
      console.error('Error proceeding to document upload:', error);
      toast({
        title: 'Error',
        description: 'Failed to proceed to the document upload step. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsFinalizing(false);
    }
  };
  
  /**
   * Filter system messages for display
   */
  const displayMessages = messages.filter(message => message.role !== 'system');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Dynamic background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <AnimatedAurora />
      </div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Will with Skyler
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chat with Skyler, your personal AI assistant, to complete your will step by step.
            </p>
          </motion.div>
          
          {/* Main chat container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col h-[70vh]"
          >
            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto p-4 pt-6">
              {/* Loading state */}
              {displayMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>Starting conversation with Skyler...</p>
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mt-3" />
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {/* Display chat messages */}
                  {displayMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start mb-4 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-10 w-10 mr-3 bg-primary text-white flex items-center justify-center shadow-sm">
                          <span className="text-sm font-semibold">S</span>
                        </Avatar>
                      )}
                      
                      <div 
                        className={`max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-primary text-white rounded-2xl rounded-tr-sm py-3 px-4 shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm py-3 px-4 shadow-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {message.role === 'user' && (
                        <Avatar className="h-10 w-10 ml-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center justify-center shadow-sm">
                          <span className="text-sm font-semibold">You</span>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Streaming message (currently typing) */}
                  {isStreaming && streamingContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start mb-4 justify-start"
                    >
                      <Avatar className="h-10 w-10 mr-3 bg-primary text-white flex items-center justify-center shadow-sm">
                        <span className="text-sm font-semibold">S</span>
                      </Avatar>
                      
                      <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm py-3 px-4 shadow-sm">
                        <div className="whitespace-pre-wrap">{streamingContent}</div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Thinking indicator */}
                  {isLoading && !isStreaming && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start mb-4 justify-start"
                    >
                      <Avatar className="h-10 w-10 mr-3 bg-primary text-white flex items-center justify-center shadow-sm">
                        <span className="text-sm font-semibold">S</span>
                      </Avatar>
                      
                      <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm py-3 px-4 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <span>Thinking</span>
                          <div className="flex">
                            <span className="animate-bounce inline-block mx-px delay-0">.</span>
                            <span className="animate-bounce inline-block mx-px delay-150">.</span>
                            <span className="animate-bounce inline-block mx-px delay-300">.</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              
              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start mb-4 justify-center"
                >
                  <div className="max-w-[90%] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg py-3 px-4 shadow-sm flex flex-col">
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">Error communicating with Skyler</span>
                    </div>
                    <p className="text-sm ml-7">{error}</p>
                    <div className="mt-2 ml-7">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={retryLastMessage}
                        className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Anchor for scrolling to bottom */}
              <div ref={messagesEndRef} className="h-1" />
            </div>
            
            <Separator />
            
            {/* Input area */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type your message to Skyler..."
                  className="flex-1 mr-2 shadow-sm"
                  disabled={isLoading || isFinalizing}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isLoading || isFinalizing}
                  className="bg-primary hover:bg-primary-dark shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {/* Auto-save indicator and completion button */}
              <div className="flex justify-between mt-4 items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {isSaving ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <span>Saving your progress...</span>
                    </div>
                  ) : (
                    <span>Your responses are saved automatically</span>
                  )}
                </div>
                
                <Button
                  onClick={handleCompleteWill}
                  disabled={isFinalizing || isLoading || displayMessages.length < 6}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center"
                >
                  {isFinalizing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span>Complete & Continue</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Tips card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Tips for Creating Your Will</h3>
              <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1.5">
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>Be specific when describing assets and their intended distribution</span>
                </li>
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>Consider special circumstances or conditions for inheritance</span>
                </li>
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>Choose a trustworthy executor who will follow your wishes</span>
                </li>
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>For dependents, include detailed guardianship arrangements</span>
                </li>
                <li className="flex">
                  <span className="mr-2">•</span>
                  <span>You'll have a chance to upload documents and review everything later</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;