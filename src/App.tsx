import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { MessageCircle } from 'lucide-react';

interface Message {
  text: string;
  isBot: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    try {
      setError(null);
      setIsLoading(true);
      setMessages(prev => [...prev, { text: message, isBot: false }]);

      // Replace with your API key
      const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { text, isBot: true }]);
    } catch (err) {
      setError('Failed to get response from Gemini AI. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 flex flex-col h-screen">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gemini AI Chat</h1>
          </div>
          <p className="text-gray-600">Have a conversation with Gemini AI</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p>👋 Send a message to start chatting with Gemini AI</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg.text} isBot={msg.isBot} />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                Thinking...
              </div>
            )}
            {error && (
              <div className="text-red-500 text-center p-2 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;