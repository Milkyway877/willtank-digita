import React, { createContext, ReactNode, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Define message structure for consistency
export interface SkylerMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Clear interface of what Skyler provides
interface SkylerContextType {
  messages: SkylerMessage[];
  addMessage: (message: Omit<SkylerMessage, 'id' | 'timestamp'>) => void;
  removeLastMessage: () => void;
  streamingContent: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<SkylerMessage | null>;
  sendStreamingMessage: (content: string) => Promise<SkylerMessage | null>;
  clearMessages: () => void;
  updateHistory: (newMessages: SkylerMessage[]) => void;
  retryLastMessage: () => Promise<void>;
}

const SkylerContext = createContext<SkylerContextType | null>(null);

/**
 * Provider component that wraps app and makes Skyler API available to any child component
 */
export const SkylerProvider = ({ children }: { children: ReactNode }) => {
  // Core state
  const [messages, setMessages] = useState<SkylerMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [lastCompletedContent, setLastCompletedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  // Refs for preventing race conditions
  const messagesRef = useRef<SkylerMessage[]>([]);
  const lastUserMessageRef = useRef<string | null>(null);
  
  // UI notifications
  const { toast } = useToast();
  
  // Keep ref in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  // Cleanup function for aborting requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  /**
   * Add a new message to the conversation
   */
  const addMessage = useCallback((message: Omit<SkylerMessage, 'id' | 'timestamp'>) => {
    const fullMessage: SkylerMessage = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, fullMessage]);
    return fullMessage;
  }, []);
  
  /**
   * Remove the last message from the conversation
   */
  const removeLastMessage = useCallback(() => {
    setMessages(prev => prev.slice(0, -1));
  }, []);
  
  /**
   * Update the entire message history
   */
  const updateHistory = useCallback((newMessages: SkylerMessage[]) => {
    setMessages(newMessages);
  }, []);
  
  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setLastCompletedContent('');
    setError(null);
    lastUserMessageRef.current = null;
  }, []);
  
  /**
   * Retry the last user message that was sent
   */
  const retryLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current) {
      // Remove the last assistant message if exists
      const lastMessage = messagesRef.current[messagesRef.current.length - 1];
      if (lastMessage?.role === 'assistant') {
        setMessages(prev => prev.slice(0, -1));
      }
      
      // Re-send the last user message
      await sendStreamingMessage(lastUserMessageRef.current);
    }
  }, []);
  
  /**
   * Send a message to Skyler API (non-streaming)
   */
  const sendMessage = async (content: string): Promise<SkylerMessage | null> => {
    try {
      setIsLoading(true);
      setError(null);
      lastUserMessageRef.current = content;
      
      // Create and add user message
      const userMessage: SkylerMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Create new AbortController
      const controller = new AbortController();
      setAbortController(controller);
      
      // Send to API
      const response = await fetch('/api/skyler/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messagesRef.current, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to communicate with Skyler');
      }

      const data = await response.json();
      
      // Create and add assistant response
      const assistantMessage: SkylerMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      return assistantMessage;
      
    } catch (error: any) {
      // Ignore aborted requests
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return null;
      }
      
      console.error('Error communicating with Skyler:', error);
      setError(error.message || 'Failed to communicate with Skyler');
      toast({
        title: 'Error communicating with Skyler',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
      return null;
      
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  /**
   * Send a message with streaming response
   */
  const sendStreamingMessage = async (content: string): Promise<SkylerMessage | null> => {
    try {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingContent('');
      setError(null);
      lastUserMessageRef.current = content;

      // Create and add user message
      const userMessage: SkylerMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Create new AbortController
      const controller = new AbortController();
      setAbortController(controller);
      
      // Use updated messages array with the new user message
      const currentMessages = [...messagesRef.current, userMessage];

      // Create fetch request for streaming
      const response = await fetch('/api/skyler/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to communicate with Skyler';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse the error, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to create stream reader');
      }

      let accumulatedMessage = '';
      const decoder = new TextDecoder();

      // Process the stream
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          
          // Process chunk with multiple SSE messages
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              if (data === '[DONE]') {
                break;
              }
              
              try {
                const parsedData = JSON.parse(data);
                if (parsedData.content) {
                  accumulatedMessage += parsedData.content;
                  setStreamingContent(accumulatedMessage);
                }
              } catch (e) {
                console.warn('Error parsing SSE data:', e);
              }
            }
          }
        }
      } catch (streamError: any) {
        // If the error is due to abort, just return
        if (streamError.name === 'AbortError') {
          console.log('Stream reading aborted');
          return null;
        }
        throw streamError;
      }
      
      setLastCompletedContent(accumulatedMessage);
      
      // Create and add the assistant message
      const assistantMessage: SkylerMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: accumulatedMessage,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
      
      return assistantMessage;

    } catch (error: any) {
      // Ignore aborted requests
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return null;
      }
      
      console.error('Error with streaming message:', error);
      setError(error.message || 'Failed to communicate with Skyler');
      toast({
        title: 'Error communicating with Skyler',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
      return null;
      
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setAbortController(null);
    }
  };

  return (
    <SkylerContext.Provider
      value={{
        messages,
        addMessage,
        removeLastMessage,
        streamingContent,
        isLoading,
        isStreaming,
        error,
        sendMessage,
        sendStreamingMessage,
        clearMessages,
        updateHistory,
        retryLastMessage
      }}
    >
      {children}
    </SkylerContext.Provider>
  );
};

/**
 * Hook to use the Skyler context
 */
export const useSkyler = () => {
  const context = useContext(SkylerContext);
  if (!context) {
    throw new Error('useSkyler must be used within a SkylerProvider');
  }
  return context;
};