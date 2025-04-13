import { createContext, ReactNode, useContext, useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { v4 as uuidv4 } from 'uuid';

// Message types
export interface SkylerMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

// Context for Skyler AI
type SkylerContextType = {
  messages: SkylerMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  sendStreamingMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
};

export const SkylerContext = createContext<SkylerContextType | null>(null);

export function SkylerProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<SkylerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<Error | null>(null);

  // Send a message to Skyler AI and get a full response
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to the conversation
      const userMessage: SkylerMessage = {
        id: uuidv4(),
        role: 'user',
        content
      };

      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Send message to API
      const response = await apiRequest('POST', '/api/skyler/chat', {
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Skyler');
      }

      const responseData = await response.json();
      
      // Add Skyler's response to the conversation
      const assistantMessage: SkylerMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseData.content
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (err) {
      console.error('Error sending message to Skyler:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // Send a message to Skyler AI with streaming response
  const sendStreamingMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    try {
      // Add user message to the conversation 
      const userMessage: SkylerMessage = {
        id: uuidv4(),
        role: 'user',
        content
      };

      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Set up stream
      const response = await fetch('/api/skyler/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get streaming response from Skyler');
      }

      const reader = response.body?.getReader();
      let receivedContent = '';

      if (!reader) {
        throw new Error('ReadableStream not supported or response body is null');
      }

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Convert bytes to text
        const chunk = new TextDecoder().decode(value);
        
        // Handle SSE format (each line starts with "data: ")
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                receivedContent += parsed.content;
                setStreamingContent(receivedContent);
              }
            } catch (e) {
              console.error('Error parsing JSON from stream:', e);
            }
          }
        }
      }

      // Add the final message
      const assistantMessage: SkylerMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: receivedContent
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

    } catch (err) {
      console.error('Error with streaming message:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [messages]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <SkylerContext.Provider
      value={{
        messages,
        isLoading,
        isStreaming,
        streamingContent,
        error,
        sendMessage,
        sendStreamingMessage,
        clearMessages
      }}
    >
      {children}
    </SkylerContext.Provider>
  );
}

export function useSkyler() {
  const context = useContext(SkylerContext);
  if (!context) {
    throw new Error('useSkyler must be used within a SkylerProvider');
  }
  return context;
}