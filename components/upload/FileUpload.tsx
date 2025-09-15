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
    <div className="space-y-6">
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group border border-stone-200 rounded-lg bg-white hover:bg-stone-50/50
          transition-all duration-200 cursor-pointer overflow-hidden
          ${isDragOver ? 'border-blue-300 bg-blue-50/30' : 'hover:border-stone-300'}
        `}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="currentColor" className="text-stone-400"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative px-6 py-12">
          <div className="flex flex-col items-center space-y-6">
            {/* Icon */}
            <div className="relative">
              <div className={`
                p-4 rounded-2xl transition-all duration-200
                ${isDragOver
                  ? 'bg-blue-100 text-blue-600 scale-110'
                  : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
                }
              `}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              {/* Floating plus icon */}
              <div className={`
                absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2
                flex items-center justify-center transition-all duration-200
                ${isDragOver ? 'border-blue-400 text-blue-600' : 'border-stone-300 text-stone-400'}
              `}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-3">
              <h3 className={`
                text-xl font-semibold transition-colors duration-200
                ${isDragOver ? 'text-blue-700' : 'text-stone-800'}
              `}>
                {isDragOver ? 'Drop your file here' : 'Upload a file'}
              </h3>

              <div className="space-y-2">
                <p className="text-stone-600">
                  Drag and drop or <span className="text-stone-800 font-medium underline underline-offset-2">click to browse</span>
                </p>
                <p className="text-sm text-stone-500">
                  PDF, TXT, DOCX and more formats supported
                </p>
              </div>
            </div>

            {/* Feature pills */}
            <div className="flex gap-2 flex-wrap justify-center">
              <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                PDF
              </span>
              <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                DOCX
              </span>
              <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                TXT
              </span>
            </div>
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
          flex items-center justify-center gap-2 px-4 py-3 rounded-lg border
          ${status.includes('success')
            ? 'text-green-700 bg-green-50 border-green-200'
            : status.includes('Failed')
            ? 'text-red-700 bg-red-50 border-red-200'
            : 'text-blue-700 bg-blue-50 border-blue-200'
          }
        `}>
          {status.includes('success') ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : status.includes('Failed') ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span className="text-sm font-medium">{status}</span>
        </div>
      )}
    </div>
  );
}