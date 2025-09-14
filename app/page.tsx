'use client';

import { useState } from 'react';
import NewChatInterface from '../components/chat/NewChatInterface';

interface FileMetadata {
  fileName: string;
  uploadedAt: number;
  type: "DOCUMENT" | "WEBSITE";
  ext: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);

  const handleSendMessage = async (input: string) => {
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const requestBody = {
        query: input,
        ...(selectedFile && {
          additionalMetadata: {
            fileName: selectedFile.fileName,
            type: selectedFile.type,
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
        setMessages(prev => [...prev, { role: 'assistant', content: data.data }]);
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
        // Store file metadata
        console.log('Adding file metadata:', data.metadata);
        setUploadedFiles(prev => {
          const newFiles = [...prev, data.metadata];
          console.log('Updated uploadedFiles:', newFiles);
          return newFiles;
        });
        // Automatically select the newly uploaded file
        setSelectedFile(data.metadata);
        console.log('Auto-selected file:', data.metadata);
        setUploadStatus(data.message);
      } else {
        setUploadStatus('Failed to upload file.');
      }
    } catch (error) {
      setUploadStatus('Failed to upload file.');
    }

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
        setUploadStatus('Website processed successfully!');
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
        uploadStatus={uploadStatus}
        uploadedFiles={uploadedFiles}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
      />
    </div>
  );
}
