interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex items-start gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${role === 'user' 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-purple-500 to-purple-600'
        }
      `}>
        {role === 'user' ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </div>

      {/* Message */}
      <div className={`
        max-w-3xl px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm
        ${role === 'user'
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
          : 'bg-gray-700/50 text-gray-100 border border-gray-600/50'
        }
      `}>
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  );
}