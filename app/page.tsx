'use client';

import { useState, useEffect } from 'react';
import NewChatInterface from '../components/chat/NewChatInterface';

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

  // Fetch all data from database on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoadingFiles(true);

      // Fetch documents, videos, and chats in parallel
      const [documentsRes, videosRes, chatsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/videos'),
        fetch('/api/chat')
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
          fileName: doc.source,
          uploadedAt: doc.uploadedAt,
          documentType: doc.documentType,
          ext: doc.ext || '',
          source: doc.source,
          title: doc.video?.title || doc.source,
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
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (response.ok) {
        // The API now returns both user and assistant messages
        if (data.data && Array.isArray(data.data)) {
          // If API returns array of messages, use them
          const newMessages = data.data.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }));
          setMessages(prev => [...prev, ...newMessages.slice(1)]); // Skip user message since we already added it
        } else {
          // Fallback: if API returns single response, treat as assistant message
          setMessages(prev => [...prev, { role: 'assistant', content: data.data }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
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
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

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

        // Add to uploadedFiles and auto-select
        setUploadedFiles(prev => [...prev, newFile]);
        setSelectedFile(newFile);
        setUploadStatus(data.message);
      } else {
        setUploadStatus('Failed to upload file.');
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

    setUploadedFiles(prev => [...prev, youtubeFile]);
    setSelectedFile(youtubeFile);
    setUploadStatus(`${youtubeFile.title || youtubeFile.source} added successfully!`);
    setTimeout(() => setUploadStatus(''), 5000);
  };

  const handleWebsiteSubmit = async (url: string) => {
    if (!url.trim()) return;

    setUploadStatus('Processing website...');

    try {
      const response = await fetch('/api/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();

        // Transform the backend response to match our interface
        if (data.data) {
          const websiteFile: FileMetadata = {
            id: data.data.id,
            fileName: data.data.source,
            uploadedAt: data.data.uploadedAt,
            documentType: data.data.documentType,
            ext: data.data.ext || '',
            source: data.data.source,
            title: data.data.source
          };

          setUploadedFiles(prev => [...prev, websiteFile]);
          setSelectedFile(websiteFile);
        }

        setUploadStatus(data.message || 'Website processed successfully!');
      } else {
        const data = await response.json();
        setUploadStatus(data.error || 'Failed to process website.');
      }
    } catch (error) {
      setUploadStatus('Failed to process website.');
    }

    setTimeout(() => setUploadStatus(''), 5000);
  };

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
