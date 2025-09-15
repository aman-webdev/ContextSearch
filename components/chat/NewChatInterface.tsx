'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from '../ui/Modal';
import FileUpload from '../upload/FileUpload';
import WebsiteInput from '../upload/WebsiteInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FileMetadata {
  id: string;
  fileName: string;
  uploadedAt: string;
  documentType: "FILE" | "WEBSITE" | "YOUTUBE_TRANSCRIPT";
  ext: string;
  source: string;
  title?: string;
  thumbnail?: string;
  author?: string;
  videoId?: string;
  video?: {
    id: string;
    title: string;
    description: string;
    author: string;
    thumbnail: string;
    uploadedAt: string;
  };
}

interface NewChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onFileUpload: (file: File) => void;
  onWebsiteSubmit: (url: string) => void;
  onAddMetadata: (metadata: FileMetadata) => void;
  uploadStatus: string;
  uploadedFiles: FileMetadata[];
  selectedFile: FileMetadata | null;
  onFileSelect: (file: FileMetadata | null) => void;
  isLoadingFiles?: boolean;
}

export default function NewChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onFileUpload,
  onWebsiteSubmit,
  onAddMetadata,
  uploadStatus,
  uploadedFiles,
  selectedFile,
  onFileSelect,
  isLoadingFiles = false
}: NewChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Function to detect if URL is a YouTube video
  const isYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)/;
    return youtubeRegex.test(url);
  };

  // Function to validate URL format
  const isValidUrl = (url: string) => {
    try {
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(urlToTest);

      // Must have valid protocol and hostname
      const hasValidProtocol = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      const hasValidHostname = urlObj.hostname &&
        urlObj.hostname.includes('.') &&
        urlObj.hostname.length > 3 &&
        !urlObj.hostname.startsWith('.') &&
        !urlObj.hostname.endsWith('.');

      return hasValidProtocol && hasValidHostname;
    } catch {
      return false;
    }
  };

  // Handle website/YouTube URL submission
  const handleUrlSubmit = async () => {
    // Validate URL format first - return immediately if invalid
    if (!websiteUrl.trim() || !isValidUrl(websiteUrl)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    // Clear previous error and set loading
    setUrlError('');
    setIsProcessingUrl(true);

    try {
      if (isYouTubeUrl(websiteUrl)) {
        // Send ONLY to YouTube endpoint for YouTube URLs
        const response = await fetch('/api/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: websiteUrl })
        });

        if (!response.ok) {
          setUrlError('Failed to process YouTube URL');
          return;
        }

        // Add YouTube video to the sidebar
        const responseData = await response.json();
        if (responseData.data) {
          // Pass the full response data to onAddMetadata
          onAddMetadata(responseData.data);
        }
      } else {
        // Send ONLY to website endpoint for regular URLs
        onWebsiteSubmit(websiteUrl);
      }

      setWebsiteUrl('');
      setUrlError('');
    } catch (error) {
      console.error('Error submitting URL:', error);
      setUrlError('Failed to add URL');
    } finally {
      setIsProcessingUrl(false);
    }
  };

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
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white/50 backdrop-blur-sm border-r border-stone-200/60 flex flex-col z-20">
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
              
              {isLoadingFiles ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-stone-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">Loading documents...</p>
                </div>
              ) : uploadedFiles.filter(file => file.documentType === 'FILE').length === 0 ? (
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
                  {uploadedFiles.filter(file => file.documentType === 'FILE').map(file => (
                    <button
                      key={file.id}
                      onClick={() => onFileSelect(file)}
                      className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                        selectedFile?.id === file.id
                          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-stone-700 border-gray-600 shadow-md'
                          : 'bg-white border-stone-200/60 hover:bg-stone-50/50 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedFile?.id === file.id
                            ? 'bg-gray-600 text-white'
                            : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            selectedFile?.id === file.id ? 'text-white' : 'text-stone-800'
                          }`}>
                            {file.fileName}
                          </p>
                          <p className={`text-xs mt-1 ${
                            selectedFile?.id === file.id ? 'text-gray-300' : 'text-stone-500'
                          }`}>
                            {new Date(file.uploadedAt).toLocaleDateString()} • {file.ext}
                          </p>
                        </div>
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
                  <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">Websites / YouTube Videos</h3>
                </div>
              </div>

              {/* URL Input */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => {
                      const value = e.target.value;
                      setWebsiteUrl(value);

                      // Real-time validation
                      if (value.trim() && !isValidUrl(value)) {
                        setUrlError('Please enter a valid URL');
                      } else {
                        setUrlError('');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && websiteUrl.trim() && isValidUrl(websiteUrl)) {
                        handleUrlSubmit();
                      }
                    }}
                    placeholder="Enter website or YouTube URL..."
                    className={`flex-1 px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 placeholder-stone-400 transition-all ${
                      urlError
                        ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                        : 'border-stone-200/60 focus:ring-stone-400 focus:border-stone-400'
                    }`}
                  />
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!websiteUrl.trim() || !isValidUrl(websiteUrl) || isProcessingUrl}
                    className="px-4 py-2 bg-stone-600 hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isProcessingUrl ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Add</span>
                    )}
                  </button>
                </div>
                {urlError && (
                  <p className="text-xs text-red-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {urlError}
                  </p>
                )}
              </div>
              
              {isLoadingFiles ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-stone-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">Loading content...</p>
                </div>
              ) : uploadedFiles.filter(file => file.documentType === 'WEBSITE' || file.documentType === 'YOUTUBE_TRANSCRIPT').length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">No content yet</p>
                  <p className="text-xs text-stone-400 mt-1">Add websites or YouTube videos to search</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.filter(file => file.documentType === 'WEBSITE' || file.documentType === 'YOUTUBE_TRANSCRIPT').map(file => (
                    <button
                      key={file.id}
                      onClick={() => onFileSelect(file)}
                      className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                        selectedFile?.id === file.id
                          ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-stone-700 border-gray-600 shadow-md'
                          : 'bg-white border-stone-200/60 hover:bg-stone-50/50 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Thumbnail or Icon */}
                        <div className="relative">
                          {file.thumbnail && (file.source?.includes('youtube.com') || file.source?.includes('youtu.be')) ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                              <img
                                src={file.thumbnail}
                                alt={file.title || file.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              selectedFile && (
                                selectedFile.fileName === file.fileName ||
                                selectedFile.title === file.title ||
                                (selectedFile.source === file.source && file.source)
                              )
                                ? 'bg-gray-600 text-white'
                                : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                            }`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 2H3a1 1 0 00-1 1v18a1 1 0 001 1h18a1 1 0 001-1V3a1 1 0 00-1-1zM2 6h20M6 2v4m6-4v4m6-4v4" />
                              </svg>
                            </div>
                          )}

                          {/* YouTube indicator */}
                          {file.source && (file.source.includes('youtube.com') || file.source.includes('youtu.be')) && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            selectedFile?.id === file.id ? 'text-white' : 'text-stone-800'
                          }`}>
                            {file.title || file.fileName}
                          </p>
                          <p className={`text-xs mt-1 truncate ${
                            selectedFile?.id === file.id ? 'text-gray-300' : 'text-stone-500'
                          }`}>
                            {file.author || (file.source || 'Website')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Selection */}
            {selectedFile && (
              <div className="pt-4 border-t border-stone-200/60">
                <button
                  onClick={() => onFileSelect(null)}
                  className="group w-full flex items-center justify-center p-3 text-sm text-red-500 hover:text-red-700 hover:bg-red-50/80 rounded-xl transition-all duration-200 border border-red-200/60 hover:border-red-300"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-80">
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
            <div className="flex-1 flex items-center justify-center px-8 pb-32">
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
            // Chat Messages - Scrollable Area with bottom padding for fixed input
            <div className="flex-1 overflow-y-auto px-6 py-4 pb-40">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="flex flex-col space-y-2">
                    {message.role === 'user' ? (
                      // User Message
                      <div className="flex justify-end">
                        <div className="bg-stone-700 text-white px-5 py-3 rounded-2xl max-w-lg shadow-sm">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      // Assistant Message
                      <div className="flex justify-start">
                        <div className="bg-white text-stone-900 px-5 py-4 rounded-2xl border border-stone-200 max-w-3xl shadow-sm">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-black text-white px-5 py-4 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                        </div>
                        <span className="text-white text-sm">
                          {selectedFile ? `Searching in ${selectedFile.title || selectedFile.fileName}...` : 'Thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area at Bottom of Screen */}
      <div className="fixed bottom-0 left-80 right-0 border-t border-stone-200 bg-stone-50/80 backdrop-blur-sm px-6 py-4 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Context Indicator above input */}
            {selectedFile && (
              <div className="mb-3">
                <div className="inline-flex items-center px-3 py-2 bg-black text-white rounded-lg text-xs font-medium shadow-sm">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="truncate max-w-xs">Searching: {selectedFile.title || selectedFile.fileName}</span>
                  <button
                    onClick={() => onFileSelect(null)}
                    className="ml-2 text-white/70 hover:text-white transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedFile
                  ? `Ask about ${selectedFile.title || selectedFile.fileName}...`
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