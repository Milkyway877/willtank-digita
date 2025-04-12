import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Send, ChevronUp, ChevronDown, User, PenSquare, Paperclip, FileText } from 'lucide-react';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

// Message types
type MessageRole = 'assistant' | 'user';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

// Questions for will creation
interface Question {
  id: string;
  text: string;
  fieldName: string;
  responseType: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: string[];
  validation?: (value: string) => boolean;
  required?: boolean;
  followupResponse?: string;
}

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

const AiChat: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [willData, setWillData] = useState<WillData>({
    personalInfo: {},
    beneficiaries: [],
    assets: []
  });
  const [previewExpanded, setPreviewExpanded] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Template information
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/sign-in');
    }
  }, [user, isLoading, navigate]);

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

  // Skyler questions based on the template
  const questions: Question[] = [
    {
      id: 'name',
      text: "Hi there! I'm Skyler, your AI will creation assistant. To start with, what's your full legal name?",
      fieldName: 'fullName',
      responseType: 'text',
      required: true,
      followupResponse: "Great! Nice to meet you, {response}. Let's create your will document together."
    },
    {
      id: 'dob',
      text: "What's your date of birth?",
      fieldName: 'dateOfBirth',
      responseType: 'date',
      required: true,
      followupResponse: "Thanks for sharing that information."
    },
    {
      id: 'address',
      text: "What's your current residential address?",
      fieldName: 'address',
      responseType: 'text',
      required: true,
      followupResponse: "Got it, thank you."
    },
    {
      id: 'maritalStatus',
      text: "What's your marital status?",
      fieldName: 'maritalStatus',
      responseType: 'select',
      options: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Domestic Partnership'],
      required: true,
      followupResponse: "Thank you for sharing that."
    },
    {
      id: 'beneficiary1',
      text: "Now let's add your first beneficiary. Who would you like to include in your will? Please provide their full name.",
      fieldName: 'beneficiaryName',
      responseType: 'text',
      required: true,
      followupResponse: "Great! {response} has been added as a beneficiary."
    },
    {
      id: 'beneficiaryRelationship',
      text: "What is your relationship to this beneficiary?",
      fieldName: 'beneficiaryRelationship',
      responseType: 'text',
      required: true,
      followupResponse: "Got it, thank you for that information."
    },
    {
      id: 'asset1',
      text: "Let's add your first asset. What type of asset would you like to include? (e.g., real estate, vehicle, bank account, investments)",
      fieldName: 'assetType',
      responseType: 'text',
      required: true,
      followupResponse: "Thank you. Now I'll need some more details about this asset."
    },
    {
      id: 'assetDescription',
      text: "Please provide a brief description of this asset.",
      fieldName: 'assetDescription',
      responseType: 'text',
      required: true,
      followupResponse: "Got it. This asset has been added to your will."
    },
    {
      id: 'executor',
      text: "Who would you like to name as the executor of your will? This person will be responsible for carrying out your wishes.",
      fieldName: 'executorName',
      responseType: 'text',
      required: true,
      followupResponse: "{response} has been designated as your executor."
    },
    {
      id: 'executorRelationship',
      text: "What is your relationship to your executor?",
      fieldName: 'executorRelationship',
      responseType: 'text',
      required: true,
      followupResponse: "Thank you for that information."
    },
    {
      id: 'specialInstructions',
      text: "Do you have any special instructions or additional wishes you'd like to include in your will?",
      fieldName: 'specialInstructions',
      responseType: 'text',
      required: false,
      followupResponse: "I've included those special instructions in your will."
    },
    {
      id: 'confirmation',
      text: "Perfect! I've gathered all the necessary information to create your will. Would you like to continue to the supporting documents section?",
      fieldName: 'confirmation',
      responseType: 'select',
      options: ['Yes', 'No, I want to review my answers'],
      required: true,
      followupResponse: "Great! Let's move forward."
    }
  ];

  // Initialize first message from Skyler when the component mounts
  useEffect(() => {
    if (questions.length > 0 && messages.length === 0) {
      setIsTyping(true);
      
      // Simulate Skyler's typing delay
      setTimeout(() => {
        const initialMessage: Message = {
          id: `skyler-${Date.now()}`,
          role: 'assistant',
          content: questions[0].text,
          createdAt: new Date()
        };
        setMessages([initialMessage]);
        setIsTyping(false);
      }, 1000);
    }
  }, [questions, messages.length]);

  // Auto scroll to the latest message
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus on input after new message
  useEffect(() => {
    if (inputRef.current && !isTyping) {
      inputRef.current.focus();
    }
  }, [isTyping, messages]);

  // Handle user's message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isTyping) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    
    // Update will data based on current question
    const currentQuestion = questions[currentQuestionIndex];
    
    // Process user response
    updateWillData(currentQuestion.fieldName, input);
    
    // Prepare Skyler's response with typing indicator
    setIsTyping(true);
    
    // Generate followup response
    const followupResponse = currentQuestion.followupResponse 
      ? currentQuestion.followupResponse.replace('{response}', input)
      : 'Thank you for that information.';
      
    // Simulate AI typing delay
    setTimeout(() => {
      const followupMessage: Message = {
        id: `skyler-followup-${Date.now()}`,
        role: 'assistant',
        content: followupResponse,
        createdAt: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, followupMessage]);
      
      // Prepare next question after a brief pause
      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        
        if (nextQuestionIndex < questions.length) {
          const nextQuestion = questions[nextQuestionIndex];
          
          const nextQuestionMessage: Message = {
            id: `skyler-${Date.now()}`,
            role: 'assistant',
            content: nextQuestion.text,
            createdAt: new Date()
          };
          
          setMessages(prevMessages => [...prevMessages, nextQuestionMessage]);
          setCurrentQuestionIndex(nextQuestionIndex);
          setIsTyping(false);
          
          // Special case for final question
          if (nextQuestionIndex === questions.length - 1) {
            // Handle completion logic
          }
        } else {
          // All questions answered, proceed to next step
          setIsTyping(false);
          
          // For demo, just say we're ready to go to document upload
          const finalMessage: Message = {
            id: `skyler-final-${Date.now()}`,
            role: 'assistant',
            content: "You've completed all the questions! Let's move on to uploading supporting documents. Click 'Continue' to proceed.",
            createdAt: new Date()
          };
          
          setMessages(prevMessages => [...prevMessages, finalMessage]);
          
          // Show continue button
          setTimeout(() => {
            const continueMessage: Message = {
              id: `skyler-continue-${Date.now()}`,
              role: 'assistant',
              content: "CONTINUE_BUTTON",
              createdAt: new Date()
            };
            
            setMessages(prevMessages => [...prevMessages, continueMessage]);
          }, 1000);
        }
      }, 800);
    }, 1500);
  };

  // Update will data based on user responses
  const updateWillData = (fieldName: string, value: string) => {
    setWillData(prevData => {
      const newData = { ...prevData };
      
      // Handle different field types
      if (fieldName === 'fullName' || fieldName === 'dateOfBirth' || fieldName === 'address' || fieldName === 'maritalStatus') {
        return {
          ...newData,
          personalInfo: {
            ...newData.personalInfo,
            [fieldName]: value
          }
        };
      } 
      else if (fieldName === 'beneficiaryName') {
        return {
          ...newData,
          beneficiaries: [
            ...newData.beneficiaries,
            { name: value, relationship: '' }
          ]
        };
      }
      else if (fieldName === 'beneficiaryRelationship') {
        const updatedBeneficiaries = [...newData.beneficiaries];
        if (updatedBeneficiaries.length > 0) {
          updatedBeneficiaries[updatedBeneficiaries.length - 1].relationship = value;
        }
        return {
          ...newData,
          beneficiaries: updatedBeneficiaries
        };
      }
      else if (fieldName === 'assetType') {
        return {
          ...newData,
          assets: [
            ...newData.assets,
            { type: value, description: '' }
          ]
        };
      }
      else if (fieldName === 'assetDescription') {
        const updatedAssets = [...newData.assets];
        if (updatedAssets.length > 0) {
          updatedAssets[updatedAssets.length - 1].description = value;
        }
        return {
          ...newData,
          assets: updatedAssets
        };
      }
      else if (fieldName === 'executorName') {
        return {
          ...newData,
          executor: { 
            name: value, 
            relationship: newData.executor?.relationship || ''
          }
        };
      }
      else if (fieldName === 'executorRelationship' && newData.executor) {
        return {
          ...newData,
          executor: { 
            name: newData.executor.name,
            relationship: value,
            contact: newData.executor.contact
          }
        };
      }
      else if (fieldName === 'specialInstructions') {
        return {
          ...newData,
          specialInstructions: value
        };
      }
      
      return newData;
    });
  };

  // Handle proceed to document upload
  const handleProceedToDocumentUpload = () => {
    // Save will data to localStorage
    localStorage.setItem('willData', JSON.stringify(willData));
    navigate('/document-upload');
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
  if (isLoading) {
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
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 backdrop-blur-sm z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center mr-3">
            <span className="text-white font-bold">S</span>
          </div>
          <div>
            <h2 className="font-semibold">Skyler</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 relative">
          <AnimatePresence>
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && message.content === "CONTINUE_BUTTON" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 mb-10 w-full flex justify-center"
                  >
                    <button
                      onClick={handleProceedToDocumentUpload}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                      Continue to Document Upload
                    </button>
                  </motion.div>
                ) : (
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none ml-auto'
                        : 'bg-white dark:bg-gray-800 shadow-sm rounded-tl-none'
                    }`}
                  >
                    {message.content}
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex justify-start"
              >
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm rounded-tl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Invisible element to scroll to */}
          <div ref={endOfMessagesRef}></div>
        </div>
        
        {/* Chat Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white pr-10 resize-none"
                rows={1}
                disabled={isTyping || (messages.length > 0 && messages[messages.length - 1].content === "CONTINUE_BUTTON")}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping || (messages.length > 0 && messages[messages.length - 1].content === "CONTINUE_BUTTON")}
                className={`absolute right-2 bottom-3 p-1 rounded-full ${
                  !input.trim() || isTyping
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-primary hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Document Preview Panel (Desktop) */}
      <div 
        className={`hidden md:flex flex-col w-[400px] h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-semibold">Document Preview</h3>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
              <PenSquare className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
              <Paperclip className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
          <div className="mx-auto max-w-lg font-serif text-gray-800 dark:text-gray-200">
            <h1 className="text-center text-2xl font-bold border-b-2 border-gray-200 dark:border-gray-700 pb-4 mb-6">
              LAST WILL AND TESTAMENT
            </h1>
            
            {/* Personal Information */}
            {willData.personalInfo.fullName && (
              <div className="mb-6">
                <p className="mb-4">
                  I, <span className="font-bold">{willData.personalInfo.fullName}</span>, 
                  {willData.personalInfo.address && ` of ${willData.personalInfo.address}, `}
                  being of sound mind and memory, make this my Last Will and Testament, hereby revoking all previous wills and codicils made by me.
                </p>
                
                {willData.personalInfo.dateOfBirth && (
                  <p className="mb-4">
                    <span className="font-semibold">Date of Birth:</span> {formatDate(willData.personalInfo.dateOfBirth)}
                  </p>
                )}
                
                {willData.personalInfo.maritalStatus && (
                  <p className="mb-4">
                    <span className="font-semibold">Marital Status:</span> {willData.personalInfo.maritalStatus}
                  </p>
                )}
              </div>
            )}
            
            {/* Executor */}
            {willData.executor && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  APPOINTMENT OF EXECUTOR
                </h2>
                <p>
                  I appoint <span className="font-bold">{willData.executor.name}</span>, 
                  my {willData.executor.relationship}, to be the Executor of this Will. 
                  If they are unable or unwilling to serve, I appoint a suitable representative as chosen by the court.
                </p>
              </div>
            )}
            
            {/* Beneficiaries */}
            {willData.beneficiaries.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  BENEFICIARIES
                </h2>
                {willData.beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="mb-2">
                    <p>
                      I give to <span className="font-bold">{beneficiary.name}</span>, 
                      my {beneficiary.relationship}, a share of my estate as detailed below.
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Assets */}
            {willData.assets.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  DISTRIBUTION OF ASSETS
                </h2>
                {willData.assets.map((asset, index) => (
                  <div key={index} className="mb-2">
                    <p>
                      <span className="font-semibold">{asset.type}:</span> {asset.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Special Instructions */}
            {willData.specialInstructions && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                  SPECIAL INSTRUCTIONS
                </h2>
                <p>
                  {willData.specialInstructions}
                </p>
              </div>
            )}
            
            {/* Signature & Witnesses (placeholder) */}
            <div className="mt-12">
              <h2 className="text-lg font-bold mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                SIGNATURES
              </h2>
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-center mb-8">
                  _______________________________<br />
                  {willData.personalInfo.fullName}<br />
                  <span className="text-sm">Testator</span>
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    _______________________<br />
                    <span className="text-sm">Witness 1</span>
                  </div>
                  <div className="text-center">
                    _______________________<br />
                    <span className="text-sm">Witness 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Document Preview Toggle */}
      <div className="md:hidden fixed bottom-20 right-4 z-20">
        <button
          onClick={() => setPreviewExpanded(!previewExpanded)}
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <FileText className="h-6 w-6 text-primary" />
        </button>
      </div>
      
      {/* Mobile Document Preview Drawer */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-xl shadow-xl transition-transform duration-300 ease-in-out z-10 ${
          previewExpanded ? 'translate-y-0' : 'translate-y-[90%]'
        }`}
      >
        <div className="flex justify-center p-2 cursor-pointer" onClick={() => setPreviewExpanded(!previewExpanded)}>
          <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        <div className="flex items-center justify-between px-4 pt-1 pb-3">
          <h3 className="font-semibold">Document Preview</h3>
          <button onClick={() => setPreviewExpanded(!previewExpanded)}>
            {previewExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto p-4">
          <div className="mx-auto max-w-lg font-serif text-gray-800 dark:text-gray-200">
            {/* Mobile Preview Content (simplified) */}
            <h1 className="text-center text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              LAST WILL AND TESTAMENT
            </h1>
            
            {willData.personalInfo.fullName && (
              <p className="mb-3">
                I, <span className="font-bold">{willData.personalInfo.fullName}</span>, 
                being of sound mind, make this my Last Will and Testament.
              </p>
            )}
            
            {willData.executor && (
              <p className="mb-3">
                <span className="font-semibold">Executor:</span> {willData.executor.name} ({willData.executor.relationship})
              </p>
            )}
            
            {willData.beneficiaries.length > 0 && (
              <div className="mb-3">
                <p className="font-semibold">Beneficiaries:</p>
                <ul className="list-disc pl-5">
                  {willData.beneficiaries.map((beneficiary, index) => (
                    <li key={index}>{beneficiary.name} ({beneficiary.relationship})</li>
                  ))}
                </ul>
              </div>
            )}
            
            {willData.assets.length > 0 && (
              <div className="mb-3">
                <p className="font-semibold">Assets:</p>
                <ul className="list-disc pl-5">
                  {willData.assets.map((asset, index) => (
                    <li key={index}>{asset.type}: {asset.description}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;