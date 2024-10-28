import React from 'react';
import { Bot, User } from 'lucide-react';

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
        <p className="text-sm font-medium mb-1">{isBot ? 'Gemini AI' : 'You'}</p>
        <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};