import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  darkMode?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot, darkMode = false }) => {
  return (
    <div className={`flex gap-3 p-3 md:p-4 rounded-lg ${
      isBot 
        ? darkMode ? 'bg-gray-700/50' : 'bg-gray-50' 
        : ''
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isBot 
          ? darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600' 
          : darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
      }`}>
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {isBot ? 'Neb AI' : 'You'}
        </p>
        {isBot ? (
          <div className={`markdown ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <ReactMarkdown 
              rehypePlugins={[rehypeSanitize]} 
              remarkPlugins={[remarkGfm]}
              className={`prose prose-sm max-w-none ${
                darkMode ? 'prose-invert prose-headings:text-gray-100 prose-a:text-blue-400' : ''
              }`}
            >
              {message}
            </ReactMarkdown>
          </div>
        ) : (
          <p className={`whitespace-pre-wrap break-words ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};