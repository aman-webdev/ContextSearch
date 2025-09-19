'use client';

import { useState, useEffect } from 'react';
import NewChatInterface from '../components/chat/NewChatInterface';
import { authenticatedGet, authenticatedPost, authenticatedFormData } from '../lib/api';

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

export default function Home() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [authToken, setAuthToken] = useState<string>('');
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);

  // Initialize authentication on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Fetch data after auth is initialized
  useEffect(() => {
    if (authToken && !isInitializingAuth) {
      fetchAllData();
    }
  }, [authToken, isInitializingAuth]);

  const initializeAuth = async () => {
    try {
      setIsInitializingAuth(true);

      // Check if token exists in localStorage
      const existingToken = localStorage.getItem('authToken');

      if (existingToken) {
        // TODO: Add token validation/expiration check here
        setAuthToken(existingToken);
        console.log('Using existing token from localStorage');
      } else {
        // No token found, call /api/me to get guest session
        console.log('No token found, creating guest session...');
        const response = await fetch('/api/me');
        const data = await response.json();

        if (response.ok && data.data) {
          const token = data.data;
          localStorage.setItem('authToken', token);
          setAuthToken(token);
          console.log('Guest session created:', data.message);
        } else {
          console.error('Failed to create guest session:', data.message);
          setUploadStatus('Failed to initialize session');
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUploadStatus('Failed to initialize session');
    } finally {
      setIsInitializingAuth(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setIsLoadingFiles(true);

      // Fetch documents, videos, and chats in parallel with auth headers
      const [documentsRes, videosRes, chatsRes] = await Promise.all([
        authenticatedGet('/api/documents'),
        authenticatedGet('/api/videos'),
        authenticatedGet('/api/chat')
      ]);

      const [documentsData, videosData, chatsData] = await Promise.all([
        documentsRes.json(),
        videosRes.json(),
        chatsRes.json()
      ]);

      // Load existing chats if available
      if (chatsData.data && chatsData.data.length > 0) {
        const formattedMessages = chatsData.data.map((chat: any) => ({
          role: chat.role as 'user' | 'assistant',
          content: chat.content
        }));
        setMessages(formattedMessages);
      }

      // Combine documents and videos into uploadedFiles
      let allFiles: FileMetadata[] = [];

      // Add documents
      if (documentsData.success) {
        const transformedDocs = documentsData.data.map((doc: any) => ({
          id: doc.id,
          fileName: doc.title || doc.video?.title || doc.source,
          uploadedAt: doc.uploadedAt,
          documentType: doc.documentType,
          ext: doc.ext || '',
          source: doc.source,
          title: doc.title || doc.video?.title || doc.source,
          thumbnail: doc.video?.thumbnail,
          author: doc.video?.author,
          videoId: doc.videoId,
          video: doc.video
        }));
        allFiles = [...allFiles, ...transformedDocs];
      }

      // Add videos (those not already linked to documents)
      if (videosData.success) {
        const transformedVideos = videosData.data
          .filter((video: any) => !video.uploadedDocument) // Only unlinked videos
          .map((video: any) => ({
            id: video.id,
            fileName: video.title,
            uploadedAt: video.uploadedAt,
            documentType: 'YOUTUBE_TRANSCRIPT' as const,
            ext: 'youtube',
            source: `https://youtube.com/watch?v=${video.id}`,
            title: video.title,
            thumbnail: video.thumbnail,
            author: video.author,
            videoId: video.id,
            video: video
          }));
        allFiles = [...allFiles, ...transformedVideos];
      }

      // Sort by upload date (newest first)
      allFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      setUploadedFiles(allFiles);

    } catch (error) {
      console.error('Error fetching data:', error);
      setUploadStatus('Failed to load data from database');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSendMessage = async (input: string) => {
    // Add user message first, before making the API call
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const requestBody = {
        query: input,
        ...(selectedFile && {
          additionalMetadata: selectedFile.documentType === 'YOUTUBE_TRANSCRIPT' ? {
            title: selectedFile.title,
            source: selectedFile.source,
            type: selectedFile.documentType
          } : selectedFile.documentType === 'WEBSITE' ? {
            source: selectedFile.source,
            type: selectedFile.documentType
          } : {
            fileName: selectedFile.fileName,
            type: selectedFile.documentType,
            ext: selectedFile.ext
          }
        })
      };

      console.log('Frontend sending:', requestBody);
      console.log('Selected file:', selectedFile);

      const response = await authenticatedPost('/api/chat', requestBody);

      const data = await response.json();

      if (response.ok) {

        // Handle API response - only add assistant message since user message is already added
        if (data.data && Array.isArray(data.data)) {
          // If API returns array of messages, only add assistant messages
          const assistantMessages = data.data.filter((msg: any) => msg.role === 'assistant').map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }));
          setMessages(prev => [...prev, ...assistantMessages]);
        } else {
          // Fallback: if API returns single response, treat as assistant message
          setMessages(prev => [...prev, { role: 'assistant', content: data.data }]);
        }
      } else {
        // Remove the user message we just added since there was an error
        setMessages(prev => prev.slice(0, -1));
        // Show error as toast instead
        if (response.status === 429 && data.limitReached) {
          setUploadStatus(data.error); // Use existing toast system
        } else {
          setUploadStatus(data.error || 'Sorry, something went wrong.');
        }
        setTimeout(() => setUploadStatus(''), 5000);
      }
    } catch (error) {
      // Remove the user message we just added since there was an error
      setMessages(prev => prev.slice(0, -1));
      setUploadStatus('Sorry, something went wrong.');
      setTimeout(() => setUploadStatus(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadStatus('Uploading and processing file...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await authenticatedFormData('/api/upload', formData);

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok) {
        // Transform the backend response to match our interface
        const newFile: FileMetadata = {
          id: data.data.id,
          fileName: data.data.source,
          uploadedAt: data.data.uploadedAt,
          documentType: data.data.documentType,
          ext: data.data.ext || '',
          source: data.data.source,
          title: data.data.source,
          videoId: data.data.videoId,
          video: data.data.video
        };

        // Add to uploadedFiles at the top and auto-select
        setUploadedFiles(prev => [newFile, ...prev]);
        setSelectedFile(newFile);
        setUploadStatus(data.message);
      } else {
        const errorData = await response.json();
        // Handle limit reached vs other errors
        if (response.status === 429 && errorData.limitReached) {
          setUploadStatus(errorData.error);
        } else {
          setUploadStatus(errorData.error || 'Failed to upload file.');
        }
      }
    } catch (error) {
      setUploadStatus('Failed to upload file.');
    }

    setTimeout(() => setUploadStatus(''), 5000);
  };

  // Function to handle adding metadata directly (for YouTube)
  const handleAddMetadata = (metadata: any) => {
    // Transform the YouTube data to match our interface
    const youtubeFile: FileMetadata = {
      id: metadata.id,
      fileName: metadata.video?.title || metadata.source,
      uploadedAt: metadata.uploadedAt,
      documentType: metadata.documentType,
      ext: metadata.ext || 'youtube',
      source: metadata.source,
      title: metadata.video?.title,
      thumbnail: metadata.video?.thumbnail,
      author: metadata.video?.author,
      videoId: metadata.video?.id,
      video: metadata.video
    };

    setUploadedFiles(prev => [youtubeFile, ...prev]);
    setSelectedFile(youtubeFile);
    setUploadStatus(`${youtubeFile.title || youtubeFile.source} added successfully!`);
    setTimeout(() => setUploadStatus(''), 5000);
  };

  const handleWebsiteSubmit = async (url: string) => {
    if (!url.trim()) return;

    setUploadStatus('Processing website...');

    try {
      const response = await authenticatedPost('/api/website', { url });

      if (response.ok) {
        const data = await response.json();

        // Transform the backend response to match our interface
        if (data.data) {
          const websiteFile: FileMetadata = {
            id: data.data.id,
            fileName: data.data.title || data.data.source,
            uploadedAt: data.data.uploadedAt,
            documentType: data.data.documentType,
            ext: data.data.ext || '',
            source: data.data.source,
            title: data.data.title || data.data.source
          };

          setUploadedFiles(prev => [websiteFile, ...prev]);
          setSelectedFile(websiteFile);
        }

        setUploadStatus(data.message || 'Website processed successfully!');
      } else {
        const errorData = await response.json();
        // Handle limit reached vs other errors
        if (response.status === 429 && errorData.limitReached) {
          setUploadStatus(errorData.error);
        } else {
          setUploadStatus(errorData.error || 'Failed to process website.');
        }
      }
    } catch (error) {
      setUploadStatus('Failed to process website.');
    }

    setTimeout(() => setUploadStatus(''), 5000);
  };

  // Show loading state while initializing auth
  if (isInitializingAuth) {
    return (
      <div className="min-h-screen w-full bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
          <p className="text-stone-600">Initializing session...</p>
        </div>
      </div>
    );
  }

  // Show error state if auth failed
  if (!authToken) {
    return (
      <div className="min-h-screen w-full bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to initialize session</p>
          <button
            onClick={initializeAuth}
            className="px-4 py-2 bg-stone-600 text-white rounded hover:bg-stone-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-stone-100">
      <NewChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onFileUpload={handleFileUpload}
        onWebsiteSubmit={handleWebsiteSubmit}
        onAddMetadata={handleAddMetadata}
        uploadStatus={uploadStatus}
        uploadedFiles={uploadedFiles}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        isLoadingFiles={isLoadingFiles}
      />
    </div>
  );
}
