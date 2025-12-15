import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Mic, Send, Sparkles, Plus, Bot, User } from 'lucide-react';
import { GeneratedContent } from '../types';
import { refineContent } from '../services/api';

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GeneratedContent | null;
  isLoading: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

// Add types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const GenerationModal: React.FC<GenerationModalProps> = ({ isOpen, onClose, data, isLoading }) => {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Chat & Refinement State
  const [prompt, setPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync data to local state
  useEffect(() => {
    if (data?.content) {
      setContent(data.content);
      // Reset chat history when new content is generated
      setChatHistory([
        {
          id: 'init',
          role: 'ai',
          text: `I've drafted a ${data.platform} post for you. What do you think?`
        }
      ]);
    }
  }, [data]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isRefining]);

  // Handle Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleRefine = async () => {
    if (!prompt.trim() || !data) return;
    
    const userPrompt = prompt;
    setPrompt('');
    
    // Add user message immediately
    setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userPrompt }]);
    
    setIsRefining(true);
    try {
      // Call updated API that returns content + natural explanation
      const result = await refineContent(content, userPrompt, data.platform);
      
      setContent(result.content);
      
      // Add Specific AI response from the result
      setChatHistory(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        text: result.explanation 
      }]);

    } catch (error) {
      console.error("Refinement failed", error);
      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        text: "I hit a snag trying to update that. Mind trying again?" 
      }]);
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#FDFDFD] rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex h-[85vh] animate-in fade-in zoom-in-95 duration-300 border border-white">
        
        {/* LEFT COLUMN: Content Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-100 bg-white">
          {/* Header */}
          <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-xl">✨</span> 
              Draft Editor
            </h3>
            <div className="flex items-center gap-2">
              {!isLoading && (
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea 
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-8 resize-none outline-none text-slate-700 text-lg leading-relaxed font-sans bg-transparent placeholder-slate-300"
              placeholder={isLoading ? "Generating draft..." : "Generated content will appear here..."}
              spellCheck={false}
            />
            
            {/* Loading Overlay for main generation */}
            {isLoading && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                  <div className="relative w-16 h-16 mb-4">
                     <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                     <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-500 font-medium animate-pulse">Drafting your content...</p>
               </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Chat / Feedback */}
        <div className="w-[400px] flex flex-col bg-slate-50">
           {/* Header */}
           <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">AI Partner</span>
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
           </div>

           {/* Chat History */}
           <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.role === 'ai' && (
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shrink-0">
                        <Bot size={16} className="text-indigo-600" />
                     </div>
                   )}
                   <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                     msg.role === 'user' 
                       ? 'bg-yellow-200 text-yellow-900 rounded-tr-sm' 
                       : 'bg-white text-slate-600 shadow-sm border border-slate-100 rounded-tl-sm'
                   }`}>
                      {msg.text}
                   </div>
                </div>
              ))}
              
              {isRefining && (
                <div className="flex justify-start">
                   <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 shrink-0">
                      <Bot size={16} className="text-indigo-600" />
                   </div>
                   <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white border-t border-slate-200">
              <div className={`bg-slate-100 rounded-2xl p-2 pl-3 flex items-center gap-2 transition-all ring-1 focus-within:ring-primary-200 focus-within:bg-white focus-within:shadow-md ${isRefining ? 'opacity-50 pointer-events-none' : ''}`}>
                 
                 <input 
                   type="text" 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       e.preventDefault();
                       handleRefine();
                     }
                   }}
                   disabled={isLoading || isRefining}
                   placeholder={isListening ? "Listening..." : "Make it shorter, add points..."}
                   className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-sm py-2"
                 />

                 <div className="flex items-center gap-1">
                    <button 
                      onClick={toggleListening}
                      className={`p-2 rounded-full transition-all ${
                        isListening 
                          ? 'bg-red-100 text-red-600 animate-pulse' 
                          : 'hover:bg-slate-200 text-slate-500'
                      }`}
                    >
                       <Mic size={18} />
                    </button>
                    <button 
                      onClick={handleRefine}
                      disabled={!prompt.trim() || isRefining}
                      className={`p-2 rounded-full transition-all ${
                        prompt.trim() 
                          ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                       <Send size={18} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

      </div>

      <style>{`
        /* Custom scrollbar for chat */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default GenerationModal;