'use client';

import { useState, useRef } from 'react';

interface SubtitleUploadProps {
  onUpload: (files: File[]) => void;
  status: string;
  isUploading?: boolean;
}

export default function SubtitleUpload({ onUpload, status, isUploading = false }: SubtitleUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList | File[]): boolean => {
    const fileArray = Array.from(files);
    const allowedTypes = ['.srt', '.vtt'];

    for (const file of fileArray) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setFileError(`Invalid file type: ${file.name}. Only SRT and VTT files are allowed.`);
        return false;
      }
    }

    if (fileArray.length > 10) {
      setFileError('Maximum 10 files allowed at once.');
      return false;
    }

    setFileError('');
    return true;
  };

  const handleFileSelect = (files: FileList | File[]) => {
    if (validateFiles(files)) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFileError('');
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading
            ? 'cursor-not-allowed opacity-60 border-stone-300'
            : 'cursor-pointer'
        } ${
          dragActive && !isUploading
            ? 'border-blue-400 bg-blue-50'
            : fileError
            ? 'border-red-300 bg-red-50'
            : !isUploading
            ? 'border-stone-300 hover:border-stone-400 hover:bg-stone-50'
            : 'border-stone-300'
        }`}
        onDrop={isUploading ? undefined : handleDrop}
        onDragOver={isUploading ? undefined : handleDragOver}
        onDragLeave={isUploading ? undefined : handleDragLeave}
        onClick={isUploading ? undefined : () => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".srt,.vtt"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3h6v2H9V9zm0 4h6v2H9v-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">
              Drop subtitle files here or click to browse
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Supports SRT and VTT files • Maximum 10 files
            </p>
          </div>
        </div>
      </div>

      {/* File Error */}
      {fileError && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{fileError}</p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-stone-700">Selected Files ({selectedFiles.length})</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3h6v2H9V9zm0 4h6v2H9v-2z" />
                  </svg>
                  <span className="text-sm text-stone-700 truncate">{file.name}</span>
                  <span className="text-xs text-stone-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-red-500 hover:text-red-700 p-1 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || !!fileError || isUploading}
        className="w-full py-2 px-4 bg-stone-600 hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isUploading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span>
          {isUploading
            ? 'Uploading...'
            : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` : 'Files'}`
          }
        </span>
      </button>

      {/* Status */}
      {status && (
        <div className="text-sm text-stone-600">
          {status}
        </div>
      )}
    </div>
  );
}