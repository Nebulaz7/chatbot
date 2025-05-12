import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { MessageCircle, Sun, Moon } from 'lucide-react';

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
  role: 'user' | 'model';
  parts: {
    text: string;
  }[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a preference stored in localStorage
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store system instructions for the AI
  const systemInstructions = `You are Neb AI, a helpful and friendly AI assistant. You where created by Peters Joshua.
          
About the creator:
- The creator's name is Peters Joshua
- They are interested in coding, gaming, and music
- He's a frontend developer learning new Technologies and building new projects, he is a student of Computer Science at the Federal University of Agriculture Abeokuta (FUNAAB).
- His github link is https://github.com/nebulaz7
- His X (Twitter) handle is https://x.com/joshpet77
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
- Be respectful and professional at all times
- Remember don't always talk about the creator unless directly asked about the creator.
`;

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

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

      // Prepare the request body
      let requestBody;
      
      if (conversationHistory.length === 0) {
        // For the first message, we'll inject our system instructions into the user's message
        requestBody = {
          contents: [
            {
              role: 'user',
              parts: [{ 
                text: `${systemInstructions}\n\nUser's question: ${message}\n\nPlease respond to the user's question. Remember to follow the instructions above.` 
              }]
            }
          ]
        };
      } else {
        // For regular conversation, include a reminder about the bot's identity
        // but don't include the full instructions to avoid context size issues
        const historyWithContext = [
          // First add a reminder message that won't be displayed to the user
          {
            role: 'user', 
            parts: [{ 
              text: 'Remember: You are Neb AI, created by Peters Joshua. Format your responses with markdown when appropriate.' 
            }]
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I will continue as Neb AI, created by Peters Joshua, and will use markdown formatting appropriately.' }]
          },
          // Then add the actual conversation history
          ...updatedHistory
        ];
        
        requestBody = {
          contents: historyWithContext
        };
      }

      console.log('Sending request to Gemini API:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates && data.candidates[0]?.content?.parts?.[0]?.text 
        ? data.candidates[0].content.parts[0].text
        : "Sorry, I couldn't generate a response.";

      // Add model response to conversation history
      const modelResponse: GeminiMessage = {
        role: 'model',
        parts: [{ text }]
      };

      // Update conversation history with the model's response
      setConversationHistory([...updatedHistory, modelResponse]);
      
      // Update UI messages
      setMessages(prev => [...prev, { text, isBot: true }]);
    } catch (err: any) {
      setError(`Failed to get response: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-4 flex flex-col h-screen">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8 pt-4 md:pt-8 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageCircle className={`w-6 h-6 md:w-8 md:h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Neb AI Chat</h1>
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Have a conversation with Neb AI</p>
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className={`mt-2 px-3 py-1 text-xs md:text-sm rounded transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Chat Container */}
        <div className={`flex-1 rounded-lg shadow-lg flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            {messages.length === 0 && (
              <div className={`text-center mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>👋 Send a message to start chatting with Neb AI</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg.text} isBot={msg.isBot} darkMode={darkMode} />
            ))}
            {isLoading && (
              <div className={`flex items-center justify-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                <div className={`animate-spin rounded-full h-4 w-4 border-2 border-t-transparent ${darkMode ? 'border-blue-400' : 'border-blue-500'}`}></div>
                Thinking...
              </div>
            )}
            {error && (
              <div className={`text-red-500 text-center p-2 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`border-t p-3 md:p-4 ${darkMode ? 'border-gray-700' : ''}`}>
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;