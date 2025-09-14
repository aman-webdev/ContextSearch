'use client';

import { useState } from 'react';
import ChatMessage from './ChatMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatArea({ messages, onSendMessage, isLoading }: ChatAreaProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-700/50 p-6 bg-gray-800/30 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Ask anything about your documents
          </h1>
          <p className="text-gray-400">
            Upload files or add websites to get started with intelligent Q&A
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-md mx-auto px-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-300">Start a conversation</h3>
                <p className="text-gray-500">
                  Once you upload documents or add websites, you can ask questions and get intelligent answers based on your content.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-full text-sm">PDF Support</span>
                <span className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-full text-sm">Website Crawling</span>
                <span className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-full text-sm">Smart Search</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                role={message.role} 
                content={message.content} 
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-gray-600/50">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-gray-300 text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700/50 p-6 bg-gray-800/30 backdrop-blur-sm">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              rows={1}
              className="
                w-full px-6 py-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl 
                focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                text-white placeholder-gray-400 resize-none backdrop-blur-sm
                transition-all duration-200
              "
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="
              px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 
              hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600
              disabled:cursor-not-allowed rounded-2xl transition-all duration-200 
              font-medium text-white shadow-lg hover:shadow-xl
              transform hover:scale-105 disabled:hover:scale-100
              flex items-center justify-center min-w-[56px]
            "
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}