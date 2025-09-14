'use client';

import { useState, useRef, DragEvent } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  status: string;
}

export default function FileUpload({ onUpload, status }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragOver 
            ? 'border-blue-500 bg-blue-500/10 scale-105' 
            : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50'
          }
        `}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-stone-200 rounded-full">
            <svg 
              className="w-8 h-8 text-stone-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-stone-900">
              {isDragOver ? 'Drop your file here' : 'Upload a file'}
            </p>
            <p className="text-sm text-stone-600 mt-2">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Supports PDF, TXT, DOCX and more
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.txt,.docx,.doc"
        />
      </div>

      {status && (
        <div className={`
          text-sm text-center px-4 py-2 rounded-lg
          ${status.includes('success') 
            ? 'text-green-700 bg-green-100 border border-green-200' 
            : status.includes('Failed') 
            ? 'text-red-700 bg-red-100 border border-red-200'
            : 'text-blue-700 bg-blue-100 border border-blue-200'
          }
        `}>
          {status}
        </div>
      )}
    </div>
  );
}