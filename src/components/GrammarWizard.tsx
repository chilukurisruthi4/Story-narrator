'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const STAR_POSITIONS = [
  { top: '8%', left: '5%' },
  { top: '15%', right: '8%' },
  { top: '50%', left: '3%' },
  { bottom: '10%', right: '6%' },
  { top: '30%', right: '15%' },
];

export default function GrammarWizard() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Add empty assistant message to stream into
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages([...updatedMessages, assistantMessage]);

    try {
      const response = await fetch('/api/grammar-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta?.text) {
                assistantContent += parsed.delta.text;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: 'assistant', content: assistantContent };
                  return next;
                });
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: '🧙 Oops! My magic wand had a little hiccup. Please try again!',
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Keep only last 4 messages in view (but store all)
  const visibleMessages = messages.slice(-4);

  return (
    <div className="mt-12">
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((v) => !v)}
        className="mx-auto flex items-center gap-3 bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-extrabold text-lg px-7 py-4 rounded-full shadow-xl hover:shadow-2xl transition-shadow"
      >
        <motion.span
          animate={{ rotate: isOpen ? [0, -10, 10, 0] : [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          className="text-2xl"
        >
          🧙
        </motion.span>
        Ask the Grammar Wizard!
        <span className="text-yellow-300">✨</span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mt-4 relative bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-500/50"
          >
            {/* Decorative stars */}
            {STAR_POSITIONS.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-300/40 text-sm pointer-events-none select-none"
                style={pos}
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
              >
                ✦
              </motion.div>
            ))}

            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-purple-600/50">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-4xl"
                >
                  🧙
                </motion.div>
                <div>
                  <h3 className="font-fredoka text-xl font-bold text-yellow-300">Gram the Grammar Wizard</h3>
                  <p className="text-purple-300 text-sm font-medium">Ask me anything about grammar! ✨</p>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="px-4 py-4 min-h-[180px] max-h-[320px] overflow-y-auto space-y-3">
              {visibleMessages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <p className="text-purple-200 font-medium text-base">
                    ✨ Hello there, young learner! I am Gram the Grammar Wizard!
                  </p>
                  <p className="text-purple-300 text-sm mt-1 font-medium">
                    Ask me any grammar question and I will help you! 🌟
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    {[
                      'What is a noun?',
                      'How do I use commas?',
                      'What is a verb?',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="bg-purple-700/60 text-purple-200 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-purple-600/80 transition-colors border border-purple-500/50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {visibleMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {msg.role === 'assistant' && (
                    <span className="text-lg flex-shrink-0 mt-0.5">🧙</span>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-yellow-400 text-gray-800 rounded-br-sm'
                        : 'bg-purple-700/80 text-purple-100 rounded-bl-sm border border-purple-500/40'
                    }`}
                  >
                    {msg.content || (
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <span className="animate-bounce">•</span>
                        <span className="animate-bounce [animation-delay:0.1s]">•</span>
                        <span className="animate-bounce [animation-delay:0.2s]">•</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-4 pb-4 pt-2 border-t border-purple-600/40">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about grammar..."
                  disabled={isLoading}
                  className="flex-1 bg-purple-800/60 border border-purple-500/50 text-white placeholder-purple-400 rounded-2xl px-4 py-3 text-base font-medium focus:outline-none focus:border-yellow-400/70 focus:bg-purple-800/80 transition-all disabled:opacity-60 min-h-[48px]"
                  maxLength={200}
                />
                <motion.button
                  whileHover={!isLoading && input.trim() ? { scale: 1.08 } : {}}
                  whileTap={!isLoading && input.trim() ? { scale: 0.92 } : {}}
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 font-extrabold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] min-w-[64px] flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="flex gap-0.5">
                      <span className="animate-bounce text-sm">✦</span>
                      <span className="animate-bounce [animation-delay:0.15s] text-sm">✦</span>
                    </span>
                  ) : (
                    <span className="text-lg">→</span>
                  )}
                </motion.button>
              </div>
              <p className="text-purple-400 text-xs mt-1.5 text-center font-medium">
                Powered by magical AI ✨ Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
