'use client';

import { useState } from 'react';
import Modal from './Modal';
import FileUpload from '../upload/FileUpload';
import WebsiteInput from '../upload/WebsiteInput';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  onWebsiteSubmit: (url: string) => void;
  uploadStatus: string;
}

export default function Sidebar({ onFileUpload, onWebsiteSubmit, uploadStatus }: SidebarProps) {
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);

  return (
    <>
      <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 p-6">
        <div className="space-y-6">
          {/* User Avatar */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">Welcome</h2>
            <p className="text-gray-400 text-sm">Upload documents or add websites to start chatting with your data</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => setIsFileModalOpen(true)}
              className="
                w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 
                hover:from-blue-700 hover:to-blue-800 rounded-xl 
                transition-all duration-200 font-medium text-white
                shadow-lg hover:shadow-xl transform hover:scale-105
                flex items-center justify-center gap-3
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </button>

            <button
              onClick={() => setIsWebsiteModalOpen(true)}
              className="
                w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 
                hover:from-purple-700 hover:to-purple-800 rounded-xl 
                transition-all duration-200 font-medium text-white
                shadow-lg hover:shadow-xl transform hover:scale-105
                flex items-center justify-center gap-3
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              Add Website
            </button>
          </div>

          {/* Status Display */}
          {uploadStatus && (
            <div className={`
              text-sm px-4 py-3 rounded-xl border backdrop-blur-sm
              ${uploadStatus.includes('success') 
                ? 'text-green-300 bg-green-500/10 border-green-500/30' 
                : uploadStatus.includes('Failed') || uploadStatus.includes('Invalid')
                ? 'text-red-300 bg-red-500/10 border-red-500/30'
                : 'text-blue-300 bg-blue-500/10 border-blue-500/30'
              }
            `}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {uploadStatus}
              </div>
            </div>
          )}

          {/* Stats or Info */}
          <div className="pt-6 border-t border-gray-700/50">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Knowledge Base</p>
              <p className="text-2xl font-bold text-white">Ready</p>
              <p className="text-xs text-gray-400">Start uploading to expand</p>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
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

      {/* Website Input Modal */}
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
    </>
  );
}