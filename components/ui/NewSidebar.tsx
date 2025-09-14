'use client';

import { useTheme } from './ThemeProvider';

export default function NewSidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed left-0 top-0 w-16 h-full bg-stone-50 dark:bg-[#2c3442] border-r border-stone-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-4">
      {/* Logo/Home */}
      <button className="w-10 h-10 bg-black dark:bg-[#f5f5dc] rounded-lg flex items-center justify-center group hover:bg-gray-800 dark:hover:bg-[#e8e8d0] transition-colors">
        <svg className="w-6 h-6 text-white dark:text-[#2c3442]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      </button>

      {/* Navigation Icons */}
      <div className="flex flex-col space-y-3">
        {/* Home */}
        <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#3a4654] transition-colors group">
          <svg className="w-5 h-5 text-stone-600 dark:text-[#a8a196] group-hover:text-stone-900 dark:group-hover:text-[#f5f5dc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l8-8-8-8" />
          </svg>
        </button>

        {/* Chat */}
        <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#3a4654] transition-colors group">
          <svg className="w-5 h-5 text-stone-600 dark:text-[#a8a196] group-hover:text-stone-900 dark:group-hover:text-[#f5f5dc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {/* Documents */}
        <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#3a4654] transition-colors group">
          <svg className="w-5 h-5 text-stone-600 dark:text-[#a8a196] group-hover:text-stone-900 dark:group-hover:text-[#f5f5dc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        {/* Settings */}
        <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#3a4654] transition-colors group">
          <svg className="w-5 h-5 text-stone-600 dark:text-[#a8a196] group-hover:text-stone-900 dark:group-hover:text-[#f5f5dc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Knowledge Base */}
        <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#3a4654] transition-colors group">
          <svg className="w-5 h-5 text-stone-600 dark:text-[#a8a196] group-hover:text-stone-900 dark:group-hover:text-[#f5f5dc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
          </svg>
        </button>

        {/* API */}
        <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#3a4654] transition-colors group">
          <svg className="w-5 h-5 text-stone-600 dark:text-[#a8a196] group-hover:text-stone-900 dark:group-hover:text-[#f5f5dc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col space-y-3">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#3a4654] transition-colors group"
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5 text-stone-600 dark:text-[#a8a196] group-hover:text-stone-900 dark:group-hover:text-[#f5f5dc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-stone-600 dark:text-[#a8a196] group-hover:text-stone-900 dark:group-hover:text-[#f5f5dc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

        {/* Profile */}
        <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-[#3a4654] flex items-center justify-center">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">A</span>
          </div>
        </div>
      </div>
    </div>
  );
}