import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot }) => {
  return (
    <div className={`flex gap-3 ${isBot ? 'bg-gray-50' : ''} p-4 rounded-lg`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium mb-1">{isBot ? 'Neb AI' : 'You'}</p>
        {isBot ? (
          <div className="markdown text-gray-700">
            <ReactMarkdown 
              rehypePlugins={[rehypeSanitize]} 
              remarkPlugins={[remarkGfm]}
              className="prose prose-sm max-w-none"
            >
              {message}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
        )}
      </div>
    </div>
  );
};