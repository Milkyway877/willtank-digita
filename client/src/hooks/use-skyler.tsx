import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SkylerMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SkylerContextType {
  messages: SkylerMessage[];
  addMessage: (message: SkylerMessage) => void;
  streamingMessage: string;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendStreamingMessage: (content: string) => Promise<void>;
}

const SkylerContext = createContext<SkylerContextType | null>(null);

export const SkylerProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<SkylerMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const addMessage = (message: SkylerMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  // Regular non-streaming message
  const sendMessage = async (content: string): Promise<void> => {
    try {
      setIsLoading(true);

      // Add user message to context
      const userMessage: SkylerMessage = {
        role: 'user',
        content: content
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
        content: data.message
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error communicating with Skyler:', error);
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
      setStreamingMessage('');

      // Add user message to context
      const userMessage: SkylerMessage = {
        role: 'user',
        content: content
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
        content: accumulatedMessage
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage(''); // Clear streaming message as it's now in the messages array

    } catch (error) {
      console.error('Error with streaming message:', error);
      toast({
        title: 'Error',
        description: 'Failed to communicate with Skyler. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SkylerContext.Provider
      value={{
        messages,
        addMessage,
        streamingMessage,
        isLoading,
        sendMessage,
        sendStreamingMessage
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