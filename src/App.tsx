import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { MessageCircle } from 'lucide-react';

// Add TypeScript declaration for Vite's import.meta.env
declare global {
  interface ImportMeta {
    env: {
      VITE_GEMINI_API_KEY?: string;
      [key: string]: any;
    }
  }
}

// Define types for conversation history
interface Message {
  text: string;
  isBot: boolean;
}

// Interface for Gemini API conversation format
interface GeminiMessage {
  role: 'user' | 'model' | 'system';
  parts: {
    text: string;
  }[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>(() => {
    // Initialize with system configuration message
    return [
      {
        role: 'system',
        parts: [{ 
          text: `You are Neb AI, a helpful and friendly AI assistant. You where created by Peters Joshua.
          
About the creator:
- The creator's name is Peters Joshua
- They are interested in coding, gaming, and music
- He's a frontend developer learning new Technologies and building new projects, he is a student of Computer Science at the Federal University of Agriculture Abeokuta (FUNAAB).
- His github link is https://github.com/nebulaz7
- His twitter handle is @nebulaz7
- His portfolio website is https://nebulaz7.github.io/
- Always add about the creator and the contacts when you are asked about the creator and about who created you.

Your Persona:
- You are knowledgeable but humble
- You use a friendly, conversational tone
- You should format your responses using Markdown (bold, lists, etc.) where appropriate
- When explaining complex topics, use simple language and examples
- Be helpful, accurate, and thoughtful in your responses

Remember to:
- Format code snippets with proper syntax highlighting using markdown
- Use bullet points or numbered lists for steps or multiple items
- Use bold text to highlight important points
- Be respectful and professional at all times`
        }]
      }
    ];
  });
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

      // Add user message to conversation history
      const userMessage: GeminiMessage = {
        role: 'user',
        parts: [{ text: message }]
      };
      
      // Create a copy of the current history with the new user message
      const updatedHistory = [...conversationHistory, userMessage];

      // Get API key from Vite environment variables
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
      
      if (!API_KEY) {
        throw new Error('API key is not set. Please add VITE_GEMINI_API_KEY to your .env file');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: updatedHistory
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Add model response to conversation history
      const modelResponse: GeminiMessage = {
        role: 'model',
        parts: [{ text }]
      };

      // Update conversation history with the model's response
      setConversationHistory([...updatedHistory, modelResponse]);
      
      // Update UI messages
      setMessages(prev => [...prev, { text, isBot: true }]);
    } catch (err) {
      setError('Failed to get response from Neb AI. Please try again.');
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
            <h1 className="text-3xl font-bold text-gray-900">Neb AI Chat</h1>
          </div>
          <p className="text-gray-600">Have a conversation with Neb AI</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p>👋 Send a message to start chatting with Neb AI</p>
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