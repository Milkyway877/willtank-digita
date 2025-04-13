import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Message interface
export interface SkylerMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Hook for managing Skyler chat state and API communication
export function useSkyler() {
  const [messages, setMessages] = useState<SkylerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Initialize with system message on first render
  useEffect(() => {
    if (messages.length === 0) {
      const systemMessage: SkylerMessage = {
        id: 'system-1',
        role: 'system',
        content: 'You are Skyler, a helpful AI assistant for WillTank. You assist users with will creation, document uploads, video testimony, beneficiary management, check-ins, 5-way death verification, viewing & managing wills, account settings, and billing questions. Always be polite, accurate, and concise. Refer users to the correct pages when needed.',
        timestamp: new Date()
      };
      
      const welcomeMessage: SkylerMessage = {
        id: 'assistant-1',
        role: 'assistant',
        content: "Hello! I'm Skyler, your AI assistant at WillTank. How can I help you today with your will planning needs?",
        timestamp: new Date()
      };
      
      setMessages([systemMessage, welcomeMessage]);
    }
  }, []);

  // Send message to Skyler API
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: SkylerMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Format messages for API
      const apiMessages = messages
        .filter(msg => msg.role !== 'system')
        .concat(userMessage)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Add system message at the beginning
      const systemMessage = messages.find(msg => msg.role === 'system');
      if (systemMessage) {
        apiMessages.unshift({
          role: 'system',
          content: systemMessage.content
        });
      }
      
      // Call API
      const response = await apiRequest('POST', '/api/skyler/chat', { messages: apiMessages });
      const data = await response.json();
      
      if (response.ok) {
        // Add assistant response
        const assistantMessage: SkylerMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else {
        setError(data.error || 'Failed to get response from Skyler');
      }
    } catch (err) {
      console.error('Error sending message to Skyler:', err);
      setError('Failed to communicate with Skyler. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // Send streaming message to Skyler API
  const sendStreamingMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: SkylerMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsStreaming(true);
    setError(null);
    setStreamingContent('');
    
    try {
      // Format messages for API
      const apiMessages = messages
        .filter(msg => msg.role !== 'system')
        .concat(userMessage)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Add system message at the beginning
      const systemMessage = messages.find(msg => msg.role === 'system');
      if (systemMessage) {
        apiMessages.unshift({
          role: 'system',
          content: systemMessage.content
        });
      }
      
      // Call streaming API with credentials
      const response = await fetch('/api/skyler/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication error: User not authenticated');
          throw new Error('You need to be authenticated to use Skyler. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');
      
      const decoder = new TextDecoder();
      let done = false;
      let streamingText = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              // Stream is complete
              done = true;
              break;
            }
            
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.content) {
                streamingText += parsedData.content;
                setStreamingContent(streamingText);
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
      
      // Add assistant response after streaming is complete
      const assistantMessage: SkylerMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: streamingText,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (err) {
      console.error('Error in streaming message:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to communicate with Skyler. Please try again.';
      setError(errorMessage);
      
      // Add error message to chat for better user experience
      const errorResponseMessage: SkylerMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again or contact support if this persists.`,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [messages]);

  // Clear chat history
  const clearChat = useCallback(() => {
    // Keep system message but remove all others
    const systemMessage = messages.find(msg => msg.role === 'system');
    
    const welcomeMessage: SkylerMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "Hello! I'm Skyler, your AI assistant at WillTank. How can I help you today with your will planning needs?",
      timestamp: new Date()
    };
    
    setMessages(systemMessage ? [systemMessage, welcomeMessage] : [welcomeMessage]);
  }, [messages]);

  return {
    messages,
    isLoading,
    error,
    streamingContent,
    isStreaming,
    sendMessage,
    sendStreamingMessage,
    clearChat
  };
}