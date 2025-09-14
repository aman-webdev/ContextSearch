'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import FileUpload from '../upload/FileUpload';
import WebsiteInput from '../upload/WebsiteInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FileMetadata {
  fileName: string;
  uploadedAt: number;
  type: "DOCUMENT" | "WEBSITE";
  ext: string;
}

interface NewChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onFileUpload: (file: File) => void;
  onWebsiteSubmit: (url: string) => void;
  uploadStatus: string;
  uploadedFiles: FileMetadata[];
  selectedFile: FileMetadata | null;
  onFileSelect: (file: FileMetadata | null) => void;
}

export default function NewChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading,
  onFileUpload,
  onWebsiteSubmit,
  uploadStatus,
  uploadedFiles,
  selectedFile,
  onFileSelect
}: NewChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);

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

  const suggestionChips = [
    "Summarize this document",
    "What are the key findings?", 
    "Extract important dates",
    "Find specific information",
    "Compare multiple sources"
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/50 backdrop-blur-sm border-r border-stone-200/60 flex flex-col">
        {/* Sidebar Header */}
        <div className="px-6 py-5 border-b border-stone-200/60">
          <h2 className="text-lg font-semibold text-stone-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Knowledge Base
          </h2>
        </div>
        
        {/* Content Sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* Uploaded Files Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">Documents</h3>
                </div>
                <button
                  onClick={() => setIsFileModalOpen(true)}
                  className="group p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                  title="Upload document"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              {uploadedFiles.filter(file => file.type === 'DOCUMENT').length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">No documents yet</p>
                  <p className="text-xs text-stone-400 mt-1">Upload PDFs to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.filter(file => file.type === 'DOCUMENT').map(file => (
                    <button
                      key={file.fileName}
                      onClick={() => onFileSelect(file)}
                      className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                        selectedFile?.fileName === file.fileName 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 shadow-md' 
                          : 'bg-white border-stone-200/60 hover:bg-stone-50/50 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedFile?.fileName === file.fileName 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            selectedFile?.fileName === file.fileName ? 'text-blue-900' : 'text-stone-800'
                          }`}>
                            {file.fileName}
                          </p>
                          <p className={`text-xs mt-1 ${
                            selectedFile?.fileName === file.fileName ? 'text-blue-600' : 'text-stone-500'
                          }`}>
                            {new Date(file.uploadedAt).toLocaleDateString()} • {file.ext}
                          </p>
                        </div>
                        {selectedFile?.fileName === file.fileName && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Websites Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">Websites</h3>
                </div>
                <button
                  onClick={() => setIsWebsiteModalOpen(true)}
                  className="group p-2 text-stone-400 hover:text-green-600 hover:bg-green-50/50 rounded-lg transition-all duration-200"
                  title="Add website"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              {uploadedFiles.filter(file => file.type === 'WEBSITE').length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">No websites yet</p>
                  <p className="text-xs text-stone-400 mt-1">Add web content to search</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.filter(file => file.type === 'WEBSITE').map(file => (
                    <button
                      key={file.fileName}
                      onClick={() => onFileSelect(file)}
                      className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                        selectedFile?.fileName === file.fileName 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/60 shadow-md' 
                          : 'bg-white border-stone-200/60 hover:bg-stone-50/50 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedFile?.fileName === file.fileName 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            selectedFile?.fileName === file.fileName ? 'text-green-900' : 'text-stone-800'
                          }`}>
                            {file.fileName}
                          </p>
                          <p className={`text-xs mt-1 ${
                            selectedFile?.fileName === file.fileName ? 'text-green-600' : 'text-stone-500'
                          }`}>
                            {new Date(file.uploadedAt).toLocaleDateString()} • Website
                          </p>
                        </div>
                        {selectedFile?.fileName === file.fileName && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Selection */}
            {selectedFile && (
              <button
                onClick={() => onFileSelect(null)}
                className="w-full p-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                ✕ Clear Selection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 bg-stone-50/80 border-b border-stone-200">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-stone-900">ContextSearch</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Register
          </button>
          <button className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors">
            Login
          </button>
        </div>
      </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center px-8">
              <div className="max-w-2xl w-full text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-stone-900">
                  Ask questions about your documents
                </h2>
                <p className="text-lg text-stone-600">
                  Get instant answers from your documents and web content
                </p>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-3 justify-center">
                {suggestionChips.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  {message.role === 'user' ? (
                    // User Message - Minimal Design
                    <div className="flex justify-end">
                      <div className="bg-stone-200 text-stone-900 px-4 py-3 rounded-3xl max-w-xs sm:max-w-md">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    // Assistant Message - Clean Design  
                    <div className="flex justify-start">
                      <div className="bg-white text-stone-900 px-4 py-3 rounded-3xl border border-stone-200 max-w-2xl">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-800 px-4 py-3 rounded-3xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-150"></div>
                      </div>
                      <span className="text-stone-300 text-sm">
                        {selectedFile ? `Searching in ${selectedFile.fileName}...` : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Fixed Input Area - Always Visible */}
        <div className="px-6 py-6 pt-4">
          <div className="max-w-4xl mx-auto">
            {/* Context Indicator */}
            {selectedFile && (
              <div className="text-xs text-blue-600 mb-2">
                🔍 Searching in {selectedFile.fileName}
              </div>
            )}
          
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedFile 
                  ? `Ask about ${selectedFile.fileName}...`
                  : "Ask ContextSearch anything..."
              }
              className="w-full px-6 py-4 pr-16 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 text-stone-900 placeholder-stone-400 resize-none transition-all shadow-sm"
              rows={3}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-4 bottom-4 p-2 bg-stone-200 hover:bg-stone-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        title="Upload Document"
      >
        <FileUpload 
          onUpload={(file) => {
            onFileUpload(file);
            setIsFileModalOpen(false);
          }}
          status=""
        />
      </Modal>

      <Modal
        isOpen={isWebsiteModalOpen}
        onClose={() => setIsWebsiteModalOpen(false)}
        title="Add Website"
      >
        <WebsiteInput 
          onSubmit={(url) => {
            onWebsiteSubmit(url);
            setIsWebsiteModalOpen(false);
          }}
          status=""
        />
      </Modal>

      {/* Toast Notification */}
      {uploadStatus && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            uploadStatus.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : uploadStatus.includes('Failed') || uploadStatus.includes('Error')
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {uploadStatus.includes('successfully') ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : uploadStatus.includes('Failed') || uploadStatus.includes('Error') ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
              <p className="text-sm font-medium">{uploadStatus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}