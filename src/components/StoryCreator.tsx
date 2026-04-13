'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@/context/ProgressContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTION_CHIPS = [
  { label: 'Help me start ✨', prompt: 'Help me start my story with an exciting opening!' },
  { label: "What happens next? 🔮", prompt: 'What could happen next in my story?' },
  { label: 'Add a character 🦸', prompt: 'Help me add an interesting new character to my story!' },
  { label: 'Give me an idea 💡', prompt: 'Give me a fun story idea for kids!' },
  { label: 'Make it exciting 🎢', prompt: 'How can I make my story more exciting and adventurous?' },
  { label: 'Add a surprise 🎁', prompt: 'Add a surprising twist to my story!' },
];

export default function StoryCreator() {
  const { progress, updateStory } = useProgress();
  const [title, setTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm Pip! 🌟 I'm here to help you write an amazing story! What kind of story do you want to tell today? 🚀 You could write about a brave hero, a magical creature, or even a funny adventure! What do you think? 😊",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (userContent: string) => {
    if (!userContent.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: userContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          storyContext: storyText || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Pip');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const text =
                parsed.delta?.text ||
                parsed.choices?.[0]?.delta?.content ||
                '';
              if (text) {
                fullText += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: fullText,
                  };
                  return updated;
                });
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content:
            "Oops! I had a little hiccup! 😅 Make sure the ANTHROPIC_API_KEY is set up correctly. But don't worry — you can still write your amazing story! What will happen next? 🌟",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (!title.trim() && !storyText.trim()) return;
    setShowFinished(true);
    // Increment created stories count
    try {
      const stored = localStorage.getItem('storyland_progress');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.createdStoriesCount = (parsed.createdStoriesCount || 0) + 1;
        localStorage.setItem('storyland_progress', JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  };

  const wordCount = storyText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {showFinished ? (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 border-4 border-purple-300 text-center"
          >
            <div className="text-7xl mb-3">📖</div>
            <h2 className="font-fredoka text-3xl font-bold text-purple-700 mb-2">
              {title || 'My Amazing Story'}
            </h2>
            <div className="bg-white/70 rounded-2xl p-4 text-left mb-4 max-h-64 overflow-y-auto">
              <p className="text-gray-700 text-base leading-loose font-nunito whitespace-pre-wrap">
                {storyText || '(Your story is waiting to be written!)'}
              </p>
            </div>
            <p className="text-purple-600 font-semibold mb-4">
              🌟 Amazing work! You wrote {wordCount} words!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFinished(false)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-2.5 rounded-full transition-colors"
              >
                ✏️ Keep Editing
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setTitle('');
                  setStoryText('');
                  setShowFinished(false);
                  setMessages([
                    {
                      role: 'assistant',
                      content:
                        "Wow, great story! 🎉 Ready to write another one? What kind of adventure shall we go on next? 🚀",
                    },
                  ]);
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-full transition-colors"
              >
                🆕 New Story
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Story writing area - left 60% */}
              <div className="lg:col-span-3 space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📝</span>
                    <h2 className="font-bold text-gray-700 text-lg">My Story</h2>
                    <span className="ml-auto text-xs text-gray-400 font-medium">
                      {wordCount} word{wordCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your story a title! ✨"
                    className="w-full font-fredoka text-xl font-bold text-purple-700 placeholder-purple-300 bg-purple-50 rounded-xl px-3 py-2 mb-3 border-2 border-purple-100 focus:border-purple-400 focus:outline-none transition-colors"
                    aria-label="Story title"
                  />

                  <textarea
                    ref={textAreaRef}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Once upon a time... 🌟&#10;&#10;Start writing your amazing story here! Don't worry about making it perfect — just have fun! Pip the helper is here to give you ideas whenever you need them. 😊"
                    className="w-full min-h-[280px] text-base leading-loose text-gray-700 font-nunito bg-amber-50 rounded-xl px-4 py-3 border-2 border-amber-100 focus:border-amber-400 focus:outline-none resize-none transition-colors placeholder-amber-300"
                    aria-label="Story text"
                  />

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleFinish}
                    disabled={!title.trim() && !storyText.trim()}
                    className={`mt-3 w-full py-3 rounded-xl font-bold text-base transition-all ${
                      title.trim() || storyText.trim()
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    🎉 Finish My Story!
                  </motion.button>
                </div>
              </div>

              {/* Pip AI Helper - right 40% */}
              <div className="lg:col-span-2 space-y-3">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-col h-full">
                  {/* Pip header */}
                  <div className="flex items-center gap-2 mb-3">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                      className="text-3xl"
                    >
                      🐙
                    </motion.span>
                    <div>
                      <h3 className="font-bold text-indigo-700 text-base">Pip the Helper</h3>
                      <p className="text-xs text-indigo-400">Your AI story buddy!</p>
                    </div>
                    {isLoading && (
                      <div className="ml-auto flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                            className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-64 lg:max-h-80 pr-1">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <span className="text-base mr-1 mt-0.5 flex-shrink-0">🐙</span>
                        )}
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                            msg.role === 'user'
                              ? 'bg-purple-500 text-white rounded-tr-sm'
                              : 'bg-white text-gray-700 shadow-sm border border-indigo-100 rounded-tl-sm'
                          }`}
                        >
                          {msg.content || (
                            <span className="text-gray-400 italic text-xs">Pip is thinking...</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Suggestion chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {SUGGESTION_CHIPS.map((chip) => (
                      <motion.button
                        key={chip.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendMessage(chip.prompt)}
                        disabled={isLoading}
                        className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {chip.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(inputText);
                        }
                      }}
                      placeholder="Ask Pip anything! 💬"
                      disabled={isLoading}
                      className="flex-1 text-sm bg-white border-2 border-indigo-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400 transition-colors disabled:bg-gray-50 placeholder-indigo-300"
                      aria-label="Chat with Pip"
                    />
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => sendMessage(inputText)}
                      disabled={isLoading || !inputText.trim()}
                      className="w-9 h-9 flex-shrink-0 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center text-lg transition-colors"
                      aria-label="Send message to Pip"
                    >
                      🚀
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
