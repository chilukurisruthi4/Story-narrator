'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GrammarVideoData, GrammarVideoFrame } from '@/types/grammarVideo';

interface Props {
  video: GrammarVideoData;
  onComplete: () => void;
}

function HighlightText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <span>{text}</span>;
  const parts = highlight.split('•').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return <span>{text}</span>;

  // Replace each highlight part with a styled span
  let result: (string | JSX.Element)[] = [text];
  parts.forEach((part, pi) => {
    result = result.flatMap((segment, si) => {
      if (typeof segment !== 'string') return [segment];
      const idx = segment.toLowerCase().indexOf(part.toLowerCase());
      if (idx === -1) return [segment];
      return [
        segment.slice(0, idx),
        <motion.span
          key={`h-${pi}-${si}`}
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
          className="inline-block bg-yellow-300 text-yellow-900 font-extrabold px-1 rounded mx-0.5"
        >
          {segment.slice(idx, idx + part.length)}
        </motion.span>,
        segment.slice(idx + part.length),
      ];
    });
  });

  return <span>{result}</span>;
}

function ExampleSentence({ sentence, highlight }: { sentence: string; highlight?: string }) {
  if (!highlight || !sentence.toLowerCase().includes(highlight.toLowerCase())) {
    return <span className="font-medium italic">&ldquo;{sentence}&rdquo;</span>;
  }
  const idx = sentence.toLowerCase().indexOf(highlight.toLowerCase());
  return (
    <span className="font-medium italic">
      &ldquo;{sentence.slice(0, idx)}
      <motion.span
        animate={{ color: ['#7c3aed', '#db2777', '#7c3aed'] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="font-extrabold not-italic underline decoration-wavy decoration-yellow-400 underline-offset-2"
      >
        {sentence.slice(idx, idx + highlight.length)}
      </motion.span>
      {sentence.slice(idx + highlight.length)}&rdquo;
    </span>
  );
}

function VideoFrame({ frame, isActive }: { frame: GrammarVideoFrame; isActive: boolean }) {
  return (
    <motion.div
      key={frame.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${frame.background} rounded-2xl overflow-hidden relative min-h-[280px] flex flex-col`}
    >
      {/* Ambient floating emojis */}
      {frame.ambientEmojis?.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            top: `${10 + i * 22}%`,
            left: i % 2 === 0 ? `${5 + i * 4}%` : undefined,
            right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined,
          }}
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Speech bubble */}
      {frame.speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-white/60 max-w-[80%] z-10"
        >
          <p className="text-gray-800 font-bold text-sm text-center whitespace-nowrap">
            {frame.speechBubble}
          </p>
          {/* Bubble tail */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-white/60 rotate-45" />
        </motion.div>
      )}

      {/* Main scene emoji */}
      <div className="flex-1 flex items-center justify-center pt-12 pb-2">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-8xl select-none drop-shadow-lg"
        >
          {frame.sceneEmoji}
        </motion.div>
      </div>

      {/* Caption bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-black/40 backdrop-blur-sm px-4 py-3 text-center"
      >
        <p className="text-white font-bold text-base leading-snug">
          <HighlightText text={frame.caption} highlight={frame.highlightWord} />
        </p>
        {frame.exampleSentence && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/80 text-sm mt-1"
          >
            e.g. <ExampleSentence sentence={frame.exampleSentence} highlight={frame.exampleHighlight} />
          </motion.p>
        )}
        {frame.subCaption && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-yellow-200 text-xs mt-1 font-medium"
          >
            {frame.subCaption}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

function speakFrame(frame: GrammarVideoFrame) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const text = [frame.speechBubble, frame.caption, frame.exampleSentence]
    .filter(Boolean)
    .join('. ');
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.88;
  utter.pitch = 1.15;
  utter.volume = 1;
  // Pick a friendly voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira') || v.name.includes('Google US'))
  ) || voices.find((v) => v.lang.startsWith('en'));
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
}

export default function GrammarVideo({ video, onComplete }: Props) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const frames = video.frames;

  const advanceFrame = useCallback(() => {
    setCurrentFrame((prev) => {
      if (prev + 1 >= frames.length) {
        setPlaying(false);
        setFinished(true);
        return prev;
      }
      return prev + 1;
    });
  }, [frames.length]);

  useEffect(() => {
    if (!playing || finished) {
      if (!playing) window.speechSynthesis?.cancel();
      return;
    }
    const frame = frames[currentFrame];
    if (frame) speakFrame(frame);
    const duration = frame?.duration ?? 5;
    timerRef.current = setTimeout(advanceFrame, duration * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, currentFrame, finished, advanceFrame, frames]);

  // Cancel speech on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  const togglePlay = () => {
    if (finished) {
      setCurrentFrame(0);
      setFinished(false);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  const goToFrame = (i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    window.speechSynthesis?.cancel();
    setCurrentFrame(i);
    setFinished(false);
    setPlaying(true);
  };

  const frame = frames[currentFrame];
  const progressPct = ((currentFrame + (finished ? 1 : 0)) / frames.length) * 100;

  return (
    <div className="space-y-3">
      {/* Title bar */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎬</span>
        <div>
          <h3 className="font-fredoka font-bold text-gray-800 text-lg leading-tight">{video.title}</h3>
          <p className="text-xs text-gray-500">Watch the lesson, then do the exercises!</p>
        </div>
        <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {currentFrame + 1}/{frames.length}
        </span>
      </div>

      {/* Video frame */}
      <AnimatePresence mode="wait">
        <VideoFrame key={frame.id} frame={frame} isActive={playing} />
      </AnimatePresence>

      {/* Progress bar */}
      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Frame dots */}
        <div className="flex gap-1 flex-1">
          {frames.map((_, i) => (
            <button
              key={i}
              onClick={() => goToFrame(i)}
              className={`rounded-full transition-all ${
                i === currentFrame ? 'w-4 h-2.5 bg-purple-500' : i < currentFrame ? 'w-2.5 h-2.5 bg-purple-300' : 'w-2.5 h-2.5 bg-gray-200'
              }`}
              aria-label={`Go to frame ${i + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md flex-shrink-0"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {finished ? '🔁' : playing ? '⏸' : '▶️'}
        </motion.button>
      </div>

      {/* Start exercises CTA — show when finished */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 border-2 border-green-300 text-center"
          >
            <p className="font-fredoka text-xl font-bold text-green-700 mb-1">
              Great watching! 🌟
            </p>
            <p className="text-green-600 text-sm mb-3">
              Now let&apos;s practice what you learned!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-8 py-3 rounded-full shadow-lg text-lg"
            >
              Let&apos;s Practice! 🚀
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip video link */}
      {!finished && (
        <div className="text-center">
          <button
            onClick={onComplete}
            className="text-gray-400 hover:text-gray-600 text-xs underline transition-colors"
          >
            Skip video, go straight to exercises →
          </button>
        </div>
      )}
    </div>
  );
}
