'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Modal from '../ui/Modal';
import FileUpload from '../upload/FileUpload';
import SubtitleUpload from '../upload/SubtitleUpload';
import WebsiteInput from '../upload/WebsiteInput';
import { authenticatedPost } from '../../lib/api';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FileMetadata {
  id: string;
  fileName: string;
  uploadedAt: string;
  documentType: "FILE" | "WEBSITE" | "YOUTUBE_TRANSCRIPT" | "SUBTITLE";
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
  onSubtitleUpload: (files: File[]) => void;
  onWebsiteSubmit: (url: string) => void;
  onAddMetadata: (metadata: FileMetadata) => void;
  uploadStatus: string;
  uploadedFiles: FileMetadata[];
  selectedFile: FileMetadata | null;
  onFileSelect: (file: FileMetadata | null) => void;
  isLoadingFiles?: boolean;
  isFileUploading?: boolean;
  isSubtitleUploading?: boolean;
  isWebsiteProcessing?: boolean;
}

export default function NewChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onFileUpload,
  onSubtitleUpload,
  onWebsiteSubmit,
  onAddMetadata,
  uploadStatus,
  uploadedFiles,
  selectedFile,
  onFileSelect,
  isLoadingFiles = false,
  isFileUploading = false,
  isSubtitleUploading = false,
  isWebsiteProcessing = false
}: NewChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isSubtitleModalOpen, setIsSubtitleModalOpen] = useState(false);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth auto-scroll to bottom
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
        const response = await authenticatedPost('/api/youtube', { url: websiteUrl });

        if (!response.ok) {
          const errorData = await response.json();
          // Handle limit reached vs other errors
          if (response.status === 429 && errorData.limitReached) {
            setUrlError(errorData.error);
          } else if (response.status === 409) {
            // Handle duplicate YouTube video conflicts
            setUrlError(errorData.error || 'YouTube video already exists.');
          } else {
            setUrlError(errorData.error || 'Failed to process YouTube URL');
          }
          // Clear the URL input and reset processing state even on error
          setWebsiteUrl('');
          setIsProcessingUrl(false);
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
    if (!input.trim() || isLoading || isFileUploading || isSubtitleUploading || isWebsiteProcessing) return;
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
    <div className={`min-h-screen bg-stone-100 flex ${inter.className}`}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-84 bg-white/50 backdrop-blur-sm border-r border-stone-200/60 flex flex-col z-20">
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
        <div className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100">
          <div className="p-5 space-y-6">
            {/* Uploaded Files Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">Documents</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedFile && selectedFile.documentType === 'FILE' && (
                    <button
                      onClick={() => onFileSelect(null)}
                      className="group flex items-center px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-xs transition-all duration-200"
                    >
                      <svg className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsFileModalOpen(true)}
                    disabled={isFileUploading || isSubtitleUploading || isWebsiteProcessing || isProcessingUrl}
                    className="group p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-stone-400 disabled:hover:bg-transparent"
                    title="Upload document"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
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
                  {uploadedFiles.filter(file => file.documentType === 'FILE').map((file) => (
                    <button
                      key={file.id}
                      onClick={() => onFileSelect(file)}
                      className={`group w-full text-left p-4 rounded-xl border transition-all duration-300 hover:shadow-sm animate-in slide-in-from-left-1 hover:scale-[1.02] ${
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

            {/* Subtitles Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wide">Subtitles</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedFile && selectedFile.documentType === 'SUBTITLE' && (
                    <button
                      onClick={() => onFileSelect(null)}
                      className="group flex items-center px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-xs transition-all duration-200"
                    >
                      <svg className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsSubtitleModalOpen(true)}
                    disabled={isFileUploading || isSubtitleUploading || isWebsiteProcessing || isProcessingUrl}
                    className="px-3 py-1.5 bg-stone-600 hover:bg-stone-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3h6v2H9V9zm0 4h6v2H9v-2z" />
                    </svg>
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {isLoadingFiles ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-stone-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">Loading subtitles...</p>
                </div>
              ) : uploadedFiles.filter(file => file.documentType === 'SUBTITLE').length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3h6v2H9V9zm0 4h6v2H9v-2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">No subtitles yet</p>
                  <p className="text-xs text-stone-400 mt-1">Upload SRT or VTT files to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.filter(file => file.documentType === 'SUBTITLE').map((file) => (
                    <button
                      key={file.id}
                      onClick={() => onFileSelect(file)}
                      className={`group w-full text-left p-4 rounded-xl border transition-all duration-300 hover:shadow-sm animate-in slide-in-from-left-1 hover:scale-[1.02] ${
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3h6v2H9V9zm0 4h6v2H9v-2z" />
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
                {selectedFile && (selectedFile.documentType === 'WEBSITE' || selectedFile.documentType === 'YOUTUBE_TRANSCRIPT') && (
                  <button
                    onClick={() => onFileSelect(null)}
                    className="group flex items-center px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-xs transition-all duration-200"
                  >
                    <svg className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
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
                      if (e.key === 'Enter' && websiteUrl.trim() && isValidUrl(websiteUrl) && !isProcessingUrl && !isWebsiteProcessing) {
                        handleUrlSubmit();
                      }
                    }}
                    placeholder="Enter website or YouTube URL..."
                    disabled={isProcessingUrl || isWebsiteProcessing}
                    className={`flex-1 px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 placeholder-stone-400 transition-all disabled:bg-stone-100 disabled:cursor-not-allowed ${
                      urlError
                        ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                        : 'border-stone-200/60 focus:ring-stone-400 focus:border-stone-400'
                    }`}
                  />
                  <button
                    onClick={handleUrlSubmit}
                    disabled={isFileUploading || isSubtitleUploading || isWebsiteProcessing || isProcessingUrl}
                    className="flex-shrink-0 px-3 py-1.5 bg-stone-600 hover:bg-stone-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-stone-600"
                  >
                    {isProcessingUrl ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add</span>
                      </>
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
                      className={`group w-full text-left p-4 rounded-xl border transition-all duration-300 hover:shadow-sm animate-in slide-in-from-left-1 hover:scale-[1.02] ${
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
                            {file.author || (file.documentType === 'WEBSITE' && file.source !== file.title ? file.source : (file.documentType === 'WEBSITE' ? 'Website' : file.source))}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Auth Section - Fixed */}
        {false && (
        <div className="mt-auto border-t border-stone-200/60 bg-white/80 backdrop-blur-sm">
          <div className="p-5 space-y-4">
            {/* Guest User Limits */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Guest User</p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed mb-3">
                You have limited access. <span className="font-medium">10 messages</span> and <span className="font-medium">5 uploads</span> only.
              </p>
              <p className="text-xs text-amber-600 font-medium">
                💾 Sign up or Login to get more access!
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-2">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-stone-800 to-stone-900 text-white rounded-xl text-sm font-semibold hover:from-stone-700 hover:to-stone-800 transition-all duration-200 border border-stone-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center px-4 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-all duration-200 border border-stone-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </Link>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-84">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-stone-50 border-b border-stone-200 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            {/* Logo Icon */}
            <div className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Logo Text */}
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">ContextSearch</h1>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center px-8 pb-32">
              <div className="max-w-2xl w-full text-center space-y-8">
                <div className="space-y-8">
                  {/* Icon Section */}
                  <div className="flex justify-center">
                    <div className="relative">
                      {/* Main search icon */}
                      <div className="w-32 h-32 bg-gradient-to-br from-stone-800 to-stone-900 rounded-full flex items-center justify-center shadow-xl z-20 relative">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* Floating content type icons - messy/scattered */}

                      {/* PDF icon - top right, slightly rotated */}
                      <div className="absolute -top-6 -right-10 w-20 h-20 bg-black rounded-lg shadow-lg flex items-center justify-center transform rotate-12">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      {/* YouTube icon - bottom left, rotated */}
                      <div className="absolute -bottom-8 -left-10 w-22 h-22 bg-black rounded-lg shadow-lg flex items-center justify-center transform -rotate-6">
                        <svg className="w-11 h-11 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>

                      {/* Website icon - middle left, different size */}
                      <div className="absolute top-6 -left-12 w-18 h-18 bg-black rounded-lg shadow-lg flex items-center justify-center transform rotate-45">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>

                      {/* Subtitles icon - top left, different angle */}
                      <div className="absolute -top-7 -left-6 w-19 h-19 bg-black rounded-lg shadow-lg flex items-center justify-center transform -rotate-12">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-stone-900">
                      Ask questions about your content
                    </h2>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                      Upload PDFs, subtitles, websites, and YouTube videos to get intelligent answers from all your content in one place
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages - Clean, Modern Design
            <div className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-stone-100 px-6 py-6 pb-32">
              <div className="max-w-4xl mx-auto">
                {messages.map((message, index) => (
                  <div key={index} className="mb-8">
                    {message.role === 'user' ? (
                      // User Message - Light Neutral
                      <div className="flex justify-end mb-4">
                        <div className="relative">
                          <div className="bg-gradient-to-br from-neutral-50 to-stone-50 text-stone-900 px-6 py-4 rounded-3xl rounded-br-lg max-w-2xl border border-neutral-200/60 shadow-sm">
                            <p className="text-sm leading-relaxed font-medium text-stone-700">{message.content}</p>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-neutral-200 to-stone-200 rounded-full border border-white"></div>
                        </div>
                      </div>
                    ) : (
                      // Assistant Message - Dark Gradient
                      <div className="flex justify-start">
                        <div className="relative">
                          <div className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-black text-white px-6 py-5 rounded-3xl rounded-bl-lg max-w-3xl border border-neutral-700/50 shadow-xl">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal text-white">{message.content}</p>
                          </div>
                          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-neutral-700 to-black rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start mb-8 animate-in fade-in duration-300">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-black text-white px-6 py-5 rounded-3xl rounded-bl-lg border border-neutral-700/50 shadow-xl">
                        <div className="flex items-center space-x-4">
                          <div className="flex space-x-1.5">
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-stone-300 to-stone-400 rounded-full animate-bounce"></div>
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-stone-300 to-stone-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-stone-300 to-stone-400 rounded-full animate-bounce delay-150"></div>
                          </div>
                          <span className="text-stone-200 text-sm font-medium">
                            {selectedFile ? `Searching in ${selectedFile.title || selectedFile.fileName}...` : 'Thinking...'}
                          </span>
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-neutral-700 to-black rounded-full"></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area - Clean Design */}
      <div className="fixed bottom-0 left-84 right-0 border-t border-gray-200 bg-white px-6 py-4 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Context Indicator */}
          {selectedFile && (
            <div className="mb-4">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-stone-100 to-stone-200 text-stone-700 rounded-full text-sm border border-stone-300/40">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate max-w-xs font-medium">{selectedFile.title || selectedFile.fileName}</span>
                <button
                  onClick={() => onFileSelect(null)}
                  className="ml-2 text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedFile
                  ? `Ask about ${(selectedFile.title || selectedFile.fileName || '').slice(0, 30)}${(selectedFile.title || selectedFile.fileName || '').length > 30 ? '...' : ''}...`
                  : "Type a message..."
              }
              className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 resize-none overflow-hidden break-words text-base"
              rows={2}
              style={{
                minHeight: '60px',
                maxHeight: '160px',
                lineHeight: '1.5',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isFileUploading || isSubtitleUploading || isWebsiteProcessing}
              className={`p-4 rounded-xl transition-colors ${
                !input.trim() || isLoading || isFileUploading || isSubtitleUploading || isWebsiteProcessing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-stone-600 hover:bg-stone-700 text-white'
              }`}
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
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
          isUploading={isFileUploading}
        />
      </Modal>

      <Modal
        isOpen={isSubtitleModalOpen}
        onClose={() => setIsSubtitleModalOpen(false)}
        title="Upload Subtitle Files"
      >
        <SubtitleUpload
          onUpload={(files) => {
            onSubtitleUpload(files);
            setIsSubtitleModalOpen(false);
          }}
          status=""
          isUploading={isSubtitleUploading}
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
          isUploading={isWebsiteProcessing}
        />
      </Modal>

      {/* Toast Notification */}
      {uploadStatus && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`px-6 py-4 rounded-xl shadow-lg border backdrop-blur-sm ${
            uploadStatus.includes('successfully')
              ? 'bg-white/90 border-green-200 text-green-700'
              : uploadStatus.includes('Failed') || uploadStatus.includes('Error') || uploadStatus.includes('already exists')
              ? 'bg-white/90 border-red-200 text-red-700'
              : uploadStatus.includes('limit') || uploadStatus.includes('expired')
              ? 'bg-white/90 border-amber-200 text-amber-700'
              : 'bg-white/90 border-stone-300 text-stone-700'
          }`}>
            <div className="flex items-center space-x-3 max-w-md">
              <div className="flex-shrink-0">
                {uploadStatus.includes('successfully') ? (
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : uploadStatus.includes('Failed') || uploadStatus.includes('Error') || uploadStatus.includes('already exists') ? (
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : uploadStatus.includes('limit') || uploadStatus.includes('expired') ? (
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-stone-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-stone-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium leading-relaxed">{uploadStatus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}