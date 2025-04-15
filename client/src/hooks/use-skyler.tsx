import React, { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface SkylerMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

interface SkylerContextType {
  messages: SkylerMessage[];
  addMessage: (message: SkylerMessage) => void;
  streamingMessage: string;
  streamingContent?: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  sendStreamingMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

const SkylerContext = createContext<SkylerContextType | null>(null);

export const SkylerProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<SkylerMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addMessage = (message: SkylerMessage) => {
    // Generate a unique ID and timestamp if not provided
    const enrichedMessage = {
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: message.timestamp || Date.now()
    };
    setMessages((prev) => [...prev, enrichedMessage]);
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setStreamingMessage('');
    setStreamingContent('');
    setError(null);
  }, []);

  // Regular non-streaming message
  const sendMessage = async (content: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to context
      const userMessage: SkylerMessage = {
        role: 'user',
        content: content,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      };
      
      // Prepare messages history including previous context 
      const messagesToSend = [...messages, userMessage];
      setMessages(messagesToSend);

      // Send to API
      const response = await apiRequest('POST', '/api/skyler/chat', {
        messages: messagesToSend.map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with Skyler');
      }

      const data = await response.json();
      
      // Add assistant response to context
      const assistantMessage: SkylerMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error communicating with Skyler:', error);
      setError(error.message || 'Failed to communicate with Skyler');
      toast({
        title: 'Error',
        description: 'Failed to communicate with Skyler. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Streaming message implementation
  const sendStreamingMessage = async (content: string): Promise<void> => {
    try {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');
      setStreamingContent('');
      setError(null);

      // Add user message to context
      const userMessage: SkylerMessage = {
        role: 'user',
        content: content,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      };
      
      // Update messages with the new user message
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Use updated messages array (not the stale state variable)
      const messagesToSend = updatedMessages;

      // Create fetch request with appropriate options for streaming
      const response = await fetch('/api/skyler/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to communicate with Skyler');
      }

      // Handle the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to create stream reader');
      }

      let accumulatedMessage = '';
      const decoder = new TextDecoder();

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            // Decode the chunk and process it
            const chunk = decoder.decode(value, { stream: true });
            
            // Process the chunk which may contain multiple SSE messages
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
                    setStreamingMessage(accumulatedMessage);
                    setStreamingContent(accumulatedMessage);
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
          throw error;
        }
      };

      await processStream();
      
      // After streaming is done, add the assistant message to the messages array
      const assistantMessage: SkylerMessage = {
        role: 'assistant',
        content: accumulatedMessage,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage(''); // Clear streaming message as it's now in the messages array
      setStreamingContent('');

    } catch (error: any) {
      console.error('Error with streaming message:', error);
      setError(error.message || 'Failed to communicate with Skyler');
      toast({
        title: 'Error',
        description: 'Failed to communicate with Skyler. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <SkylerContext.Provider
      value={{
        messages,
        addMessage,
        streamingMessage,
        streamingContent,
        isLoading,
        isStreaming,
        error,
        sendMessage,
        sendStreamingMessage,
        clearChat
      }}
    >
      {children}
    </SkylerContext.Provider>
  );
};

export const useSkyler = () => {
  const context = useContext(SkylerContext);
  if (!context) {
    throw new Error('useSkyler must be used within a SkylerProvider');
  }
  return context;
};