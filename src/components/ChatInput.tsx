import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  darkMode?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  darkMode = false
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        rows={1}
        className={`w-full p-3 pr-12 rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors ${
          darkMode
            ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500/50'
            : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:ring-blue-500/30'
        }`}
        style={{ minHeight: '50px', maxHeight: '150px' }}
      />
      <button
        onClick={handleSubmit}
        disabled={!message.trim() || disabled}
        className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors ${
          !message.trim() || disabled
            ? darkMode 
              ? 'text-gray-500 bg-gray-700' 
              : 'text-gray-400 bg-gray-100'
            : darkMode
              ? 'text-white bg-blue-600 hover:bg-blue-700'
              : 'text-white bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
};