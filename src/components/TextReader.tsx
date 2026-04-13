'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StorySegment } from '@/types';
import VideoScene from './VideoScene';

interface Props {
  segment: StorySegment;
  onComplete: () => void;
}

export default function TextReader({ segment, onComplete }: Props) {
  const [visibleParagraphs, setVisibleParagraphs] = useState<number>(0);
  const [hasRead, setHasRead] = useState(false);

  const paragraphs = segment.text
    .split(/(?<=[.!?])\s+/)
    .filter((p) => p.trim().length > 0);

  useEffect(() => {
    setVisibleParagraphs(0);
    setHasRead(false);

    // Reveal paragraphs one by one
    let count = 0;
    const reveal = () => {
      count++;
      setVisibleParagraphs(count);
      if (count < paragraphs.length) {
        setTimeout(reveal, 600);
      } else {
        setTimeout(() => setHasRead(true), 800);
      }
    };
    const t = setTimeout(reveal, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment.id]);

  return (
    <div className="space-y-4">
      {/* Mini scene */}
      <VideoScene segment={segment} mini />

      {/* Reading card */}
      <div className="bg-amber-50 rounded-2xl p-5 shadow-sm border border-amber-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📖</span>
          <h3 className="font-bold text-amber-800 text-base">{segment.title}</h3>
        </div>

        <div className="space-y-3 min-h-[120px]">
          {paragraphs.map((para, i) => (
            <AnimatePresence key={`${segment.id}-p-${i}`}>
              {i < visibleParagraphs && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="story-text text-xl leading-loose text-gray-700 font-nunito"
                >
                  {para}
                </motion.p>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Done button */}
        <AnimatePresence>
          {hasRead && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="mt-4 w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow text-base"
            >
              🌟 I've read this! Next Scene →
            </motion.button>
          )}
        </AnimatePresence>

        {!hasRead && (
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-500">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-sm font-medium"
            >
              📚 Reading...
            </motion.div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 bg-amber-400 rounded-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
