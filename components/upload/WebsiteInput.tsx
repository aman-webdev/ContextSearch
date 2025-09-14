'use client';

import { useState } from 'react';

interface WebsiteInputProps {
  onSubmit: (url: string) => void;
  status: string;
}

export default function WebsiteInput({ onSubmit, status }: WebsiteInputProps) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!url.trim()) return;
    
    const isUrlValid = validateUrl(url);
    setIsValid(isUrlValid);
    
    if (isUrlValid) {
      onSubmit(url);
      setUrl('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          Website URL
        </label>
        
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setIsValid(true); // Reset validation on input
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            className={`
              w-full px-4 py-3 bg-white border rounded-lg text-stone-900 
              focus:outline-none focus:ring-2 transition-all
              ${isValid 
                ? 'border-stone-300 focus:border-blue-500 focus:ring-blue-500/20' 
                : 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              }
            `}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg 
              className="w-5 h-5 text-stone-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
              />
            </svg>
          </div>
        </div>
        
        {!isValid && (
          <p className="text-sm text-red-600">
            Please enter a valid URL (e.g., https://example.com)
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!url.trim()}
        className="
          w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white 
          disabled:cursor-not-allowed rounded-lg transition-colors font-medium
          focus:outline-none focus:ring-2 focus:ring-blue-500/20
        "
      >
        <div className="flex items-center justify-center gap-2">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          Add Website
        </div>
      </button>

      {status && (
        <div className={`
          text-sm text-center px-4 py-2 rounded-lg
          ${status.includes('success') 
            ? 'text-green-700 bg-green-100 border border-green-200' 
            : status.includes('Failed') || status.includes('Invalid')
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