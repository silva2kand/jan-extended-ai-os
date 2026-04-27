import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, User, Bot, Loader2, Mic, MicOff, Copy, Volume2, Edit, Play, RotateCcw, ChevronRight, Image as ImageIcon, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:3000/list-local-models');
        const data = await res.json();
        if (data.active_model) {
          const active = data.models.find((m: any) => m.id === data.active_model);
          if (active) setActiveModel(active.name);
        }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      // @ts-ignore
      window.recognition?.stop();
    } else {
      setIsListening(true);
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        // @ts-ignore
        window.recognition = new SpeechRecognition();
        // @ts-ignore
        window.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        // @ts-ignore
        window.recognition.start();
      } else {
        alert('Speech recognition not supported');
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || isLoading) return;

    let messageContent: any = input;
    
    // Format for OpenAI Vision if image exists
    if (image) {
      messageContent = [
        { type: "text", text: input || "What is in this image?" },
        { type: "image_url", image_url: { url: image } }
      ];
    }

    const userMessage = { role: 'user' as const, content: messageContent };
    
    // For display purposes, just show text or "Image uploaded"
    const displayMessage = { 
      role: 'user' as const, 
      content: image ? (input || "[Image Uploaded]") : input 
    };
    
    setMessages(prev => [...prev, displayMessage]);
    setInput('');
    setImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      const data = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        const aiMessage = data.choices[0].message;
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Is Jan running?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-white">AI Assistant</span>
                {activeModel && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 ml-1 truncate max-w-[100px]">
                    {activeModel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-slate-800 rounded">
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-slate-400" /> : <Minimize2 className="w-4 h-4 text-slate-400" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-800/50">
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <Bot className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-400 text-sm">How can I help you today?</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className="space-y-2">
                      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl flex gap-2 ${
                          msg.role === 'user' 
                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                            : 'bg-slate-700 text-slate-200 rounded-tl-none'
                        }`}>
                          {msg.role === 'assistant' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                          <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                            <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
                            
                            {/* Message Actions */}
                            {msg.role === 'assistant' && (
                              <div className="flex items-center gap-3 pt-2 border-t border-slate-600 mt-1">
                                <button onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  // Could add a 'Copied!' toast here
                                }} className="p-1 hover:text-cyan-400 transition-colors" title="Copy">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => {
                                  const utterance = new SpeechSynthesisUtterance(msg.content);
                                  window.speechSynthesis.speak(utterance);
                                }} className="p-1 hover:text-cyan-400 transition-colors" title="Speak">
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1 hover:text-cyan-400 transition-colors" title="Edit">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1 hover:text-cyan-400 transition-colors" title="Continue">
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => {
                                  // Regenerate: Remove last message and send again
                                  if (msg.role === 'assistant') {
                                    const lastUserMsg = messages.slice(0, i).reverse().find(m => m.role === 'user');
                                    if (lastUserMsg) {
                                      setInput(lastUserMsg.content);
                                      setMessages(prev => prev.slice(0, i));
                                      handleSend();
                                    }
                                  }
                                }} className="p-1 hover:text-cyan-400 transition-colors" title="Regenerate">
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          {msg.role === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                        </div>
                      </div>

                      {/* Suggestions for last assistant message */}
                      {msg.role === 'assistant' && i === messages.length - 1 && (
                        <div className="flex flex-wrap gap-2 mt-2 pl-6">
                          {['Tell me more', 'Give an example', 'Summarize this', 'Check facts', 'Next steps'].map((sug) => (
                            <button
                              key={sug}
                              onClick={() => {
                                setInput(sug);
                                // We use a timeout to let state update or just pass the value
                                setTimeout(() => {
                                  const btn = document.querySelector('button[title="Send"]') as HTMLButtonElement;
                                  btn?.click();
                                }, 100);
                              }}
                              className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-1 rounded-full text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-1"
                            >
                              <ChevronRight className="w-2 h-2" />
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 p-3 rounded-2xl rounded-tl-none flex gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                        <span className="text-xs text-slate-400">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 bg-slate-900 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      
                      <div className="relative">
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-2 rounded-lg transition-colors ${image ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-700 text-slate-400'}`}
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        {image && (
                          <div className="absolute -top-12 -left-2 bg-slate-800 p-1 rounded border border-slate-700 shadow-xl">
                            <img src={image} className="w-10 h-10 object-cover rounded" alt="Preview" />
                            <button 
                              onClick={() => setImage(null)}
                              className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={toggleVoice}
                        className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-700 text-slate-400'}`}
                      >
                        {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                      </button>
                    </div>
                    <button
                      onClick={handleSend}
                      className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWindow;
