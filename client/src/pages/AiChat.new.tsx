import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useSkyler } from '@/hooks/use-skyler';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import AnimatedAurora from '@/components/ui/AnimatedAurora';

// Message interface
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Will data structure that we're collecting
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
  const [, navigate] = useLocation();
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingWill, setIsProcessingWill] = useState(false);
  const [willData, setWillData] = useState<WillData>({
    personalInfo: {},
    beneficiaries: [],
    assets: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Skyler client
  const { sendStreamingMessage, streamingMessage, isLoading } = useSkyler();
  
  // Load selected template from localStorage
  useEffect(() => {
    const template = localStorage.getItem('selectedWillTemplate');
    if (template) {
      setSelectedTemplate(template);
    }
  }, []);
  
  // Mark user as having a will in progress when they start the AI chat
  useEffect(() => {
    const updateWillStatus = async () => {
      try {
        // Mark will as in progress
        const response = await apiRequest('POST', '/api/user/update-profile', {
          willInProgress: true
        });
        
        if (!response.ok) {
          console.error('Failed to update will progress');
        } else {
          // Refetch user to update state
          await refetchUser();
        }
      } catch (error) {
        console.error('Error updating will progress:', error);
      }
    };
    
    // Check if this is the first message 
    if (messages.length === 1 && messages[0].role === 'system') {
      updateWillStatus();
    }
  }, [messages, refetchUser]);
  
  // Set initial system message
  useEffect(() => {
    // Only initialize once and only if we have a template selected
    if (messages.length === 0 && selectedTemplate) {
      // Create a system message to set up Skyler's role
      const templateNames: Record<string, string> = {
        'standard': 'Standard Will',
        'family': 'Family Protection Will',
        'business': 'Business Owner Will',
        'property': 'Real Estate Focused Will'
      };
      
      const templateName = templateNames[selectedTemplate] || 'Standard Will';
      
      const systemMessage: Message = {
        role: 'system',
        content: `You are Skyler, an AI assistant specializing in ${templateName} creation. Guide the user through creating their will in a conversational manner.
        
Your task is to extract the following information:
1. Personal details (name, date of birth, address, marital status)
2. Beneficiaries (name, relationship, share of estate)
3. Executor information
4. Assets and their distribution
5. Guardian information (if applicable)
6. Special instructions

Be friendly, compassionate, and patient. Ask one question at a time. When the user has provided sufficient information, let them know they can proceed to document upload.`
      };
      
      setMessages([systemMessage]);
      
      // Add first assistant message
      setTimeout(() => {
        const welcomeMessage: Message = {
          role: 'assistant',
          content: `Hi there! I'm Skyler, your personal will creation assistant. I'll help you create a ${templateName} by asking you some questions about your personal information, beneficiaries, assets, and other important details.

Let's get started! First, could you please tell me your full legal name?`
        };
        
        setMessages(prevMessages => [...prevMessages, welcomeMessage]);
      }, 500);
    }
  }, [messages, selectedTemplate]);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);
  
  // Update will data based on assistant's analysis
  const updateWillData = (content: string) => {
    try {
      // Look for JSON in the message
      const jsonMatch = content.match(/```json([\s\S]*?)```/);
      
      if (jsonMatch && jsonMatch[1]) {
        const extractedJson = jsonMatch[1].trim();
        const parsedData = JSON.parse(extractedJson);
        
        if (parsedData) {
          setWillData(prevData => ({
            ...prevData,
            ...parsedData
          }));
          
          // Store in localStorage for use in other steps
          localStorage.setItem('willData', JSON.stringify({
            ...willData,
            ...parsedData
          }));
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error parsing will data:', error);
      return false;
    }
  };
  
  // Send message to Skyler
  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      await sendStreamingMessage(input.trim());
      
      // After streaming is complete, add the full response to messages
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: 'assistant', content: streamingMessage }
      ]);
      
      // Try to extract will data from assistant's response
      updateWillData(streamingMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to communicate with Skyler. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle completion of will creation
  const handleCompleteWill = async () => {
    setIsProcessingWill(true);
    
    try {
      // Extract will data by asking Skyler to summarize
      await sendStreamingMessage('Please summarize all the information I have provided for my will in a structured JSON format.');
      
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
  
  // Filter out system messages for display
  const displayMessages = messages.filter(message => message.role !== 'system');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <AnimatedAurora />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Will with Skyler
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chat with Skyler, your AI assistant, to complete your will information step by step.
            </p>
          </motion.div>
          
          {/* Chat container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-[70vh]"
          >
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
              {displayMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>Loading conversation with Skyler...</p>
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mt-2" />
                  </div>
                </div>
              ) : (
                displayMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex items-start mb-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-10 w-10 mr-3 bg-primary text-white flex items-center justify-center">
                        <span className="text-sm font-semibold">AI</span>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-2xl rounded-tr-sm py-2 px-4'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm py-2 px-4'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                    
                    {message.role === 'user' && (
                      <Avatar className="h-10 w-10 ml-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center justify-center">
                        <span className="text-sm font-semibold">You</span>
                      </Avatar>
                    )}
                  </motion.div>
                ))
              )}
              
              {/* Current streaming message from assistant */}
              {isProcessing && streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start mb-4 justify-start"
                >
                  <Avatar className="h-10 w-10 mr-3 bg-primary text-white flex items-center justify-center">
                    <span className="text-sm font-semibold">AI</span>
                  </Avatar>
                  
                  <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm py-2 px-4">
                    <div className="whitespace-pre-wrap">{streamingMessage || 'Thinking...'}</div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <Separator />
            
            {/* Input area */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message to Skyler..."
                  className="flex-1 mr-2"
                  disabled={isProcessing || isProcessingWill}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isProcessing || isProcessingWill}
                  className="bg-primary hover:bg-primary-dark"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {/* Progress buttons */}
              <div className="flex justify-between mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic self-center">
                  Your responses are saved automatically
                </p>
                <Button
                  onClick={handleCompleteWill}
                  disabled={isProcessingWill || messages.length < 5}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                >
                  {isProcessingWill ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Complete & Continue
                    </>
                  )}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Help card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Tips for Creating Your Will</h3>
              <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <li>• Be as specific as possible when describing assets and beneficiaries</li>
                <li>• Consider any special circumstances or conditions for inheritance</li>
                <li>• Think about who you would trust to be your executor</li>
                <li>• If you have dependents, think about guardianship arrangements</li>
                <li>• You'll have a chance to review and edit the will later</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;