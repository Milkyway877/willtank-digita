import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkyler, SkylerMessage } from '@/hooks/use-skyler';
import { Send, X, Minimize2, Maximize2, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface SkylerChatbotProps {
  // Optional props for positioning and customization
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  secondaryColor?: string;
}

export default function SkylerChatbot({
  position = 'bottom-right',
  primaryColor = '#4F46E5',
  secondaryColor = '#6366F1'
}: SkylerChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    isLoading,
    error,
    streamingContent,
    isStreaming,
    sendStreamingMessage,
    clearChat
  } = useSkyler();

  // Only show Skyler to authenticated users
  if (!user) return null;

  // Position styles based on prop
  const positionStyles = position === 'bottom-right'
    ? 'right-4 sm:right-8'
    : 'left-4 sm:left-8';

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isStreaming) return;
    
    const messageCopy = message;
    setMessage('');
    await sendStreamingMessage(messageCopy);
  };

  // Handle text area auto height
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(100, e.target.scrollHeight) + 'px';
  };

  // Handle Enter key to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        className={`fixed ${positionStyles} bottom-4 sm:bottom-8 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
        }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        aria-label="Chat with Skyler AI"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed ${positionStyles} bottom-24 z-50 w-full sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1,
              height: isMinimized ? '76px' : '500px',
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Skyler</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? 
                    <Maximize2 className="h-4 w-4" /> : 
                    <Minimize2 className="h-4 w-4" />
                  }
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Body - Hidden when minimized */}
            <AnimatePresence>
              {!isMinimized && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 bg-gray-50 dark:bg-gray-900"
                  >
                    {messages.filter(m => m.role !== 'system').map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70 text-right">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Streaming Message */}
                    {isStreaming && streamingContent && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                        </div>
                      </div>
                    )}

                    {/* Loading Indicator */}
                    {isStreaming && !streamingContent && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="flex justify-center">
                        <div className="max-w-[85%] rounded-lg p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm">
                          {error}
                        </div>
                      </div>
                    )}

                    {/* Scroll anchor */}
                    <div ref={messageEndRef} />
                  </motion.div>

                  {/* Chat Controls */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-end space-x-2">
                      <button
                        onClick={clearChat}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        aria-label="Clear chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <form onSubmit={handleSendMessage} className="flex-1 flex items-end space-x-2">
                        <div className="flex-1 relative">
                          <textarea
                            ref={inputRef}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none min-h-[40px] max-h-[100px] text-sm"
                            placeholder="Type your message..."
                            value={message}
                            onChange={handleTextAreaChange}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            disabled={isStreaming}
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={!message.trim() || isStreaming}
                          className={`p-2 rounded-lg ${
                            !message.trim() || isStreaming
                              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                              : 'bg-indigo-500 hover:bg-indigo-600'
                          } text-white flex-shrink-0`}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}