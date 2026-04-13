'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StorySegment } from '@/types';
import VideoScene from './VideoScene';

interface Props {
  segment: StorySegment;
  onComplete: () => void;
  autoPlay?: boolean;
}

export default function AudioPlayer({ segment, onComplete, autoPlay = false }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);

  useEffect(() => {
    wordsRef.current = segment.text.split(/\s+/);
  }, [segment.text]);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      const english = available.filter((v) =>
        v.lang.startsWith('en')
      );
      setVoices(english.length > 0 ? english : available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Stop and reset when segment changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setHighlightedWordIndex(-1);
    if (autoPlay) {
      // slight delay to let component settle
      const t = setTimeout(() => startSpeaking(), 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment.id, autoPlay]);

  const startSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const charIndex = e.charIndex;
        const textUpTo = segment.text.slice(0, charIndex);
        const wordIdx = textUpTo.split(/\s+/).length - 1;
        setHighlightedWordIndex(wordIdx);
      }
    };

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setHighlightedWordIndex(-1);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setHighlightedWordIndex(-1);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [segment.text, voices, selectedVoiceIndex]);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setHighlightedWordIndex(-1);
    } else {
      startSpeaking();
    }
  };

  const words = wordsRef.current;

  return (
    <div className="space-y-4">
      {/* Scene illustration */}
      <VideoScene segment={segment} playing={false} />

      {/* Audio controls */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
        <div className="flex items-center gap-4 mb-4">
          {/* Play/Pause button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause story' : 'Play story'}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg flex items-center justify-center text-2xl flex-shrink-0 hover:shadow-xl transition-shadow"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </motion.button>

          {/* Sound waves */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex items-center gap-1 h-10 text-purple-500"
              >
                {[12, 20, 28, 20, 14, 22, 18].map((h, i) => (
                  <div
                    key={i}
                    className="sound-bar bg-purple-400 rounded-full"
                    style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <p className="font-bold text-gray-700 text-sm">
              {isPlaying ? '🎧 Listening...' : '🎧 Tap to Listen'}
            </p>
            <p className="text-xs text-gray-400">{segment.title}</p>
          </div>
        </div>

        {/* Voice selector */}
        {voices.length > 1 && (
          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              🎤 Narrator Voice:
            </label>
            <select
              value={selectedVoiceIndex}
              onChange={(e) => {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
                setSelectedVoiceIndex(Number(e.target.value));
              }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Select narrator voice"
            >
              {voices.map((v, i) => (
                <option key={i} value={i}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Highlighted text */}
        <div
          className="bg-purple-50 rounded-xl p-3 text-sm leading-relaxed text-gray-600 max-h-32 overflow-y-auto"
          aria-live="polite"
          aria-label="Story text"
        >
          {words.map((word, i) => (
            <span
              key={i}
              className={
                i === highlightedWordIndex
                  ? 'bg-yellow-300 text-gray-800 rounded px-0.5 mx-0.5 font-semibold'
                  : 'mx-0.5'
              }
            >
              {word}
            </span>
          ))}
        </div>

        {/* Done button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            onComplete();
          }}
          className="mt-3 w-full bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold py-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow text-sm"
        >
          ✅ I'm done listening! Next →
        </motion.button>
      </div>
    </div>
  );
}
