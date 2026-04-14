'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@/context/ProgressContext';
import { getLevelFromPoints } from '@/lib/levels';
import { recordStoryRead } from '@/lib/communityStories';
import type { CommunityStory } from '@/types';

interface Props {
  story: CommunityStory;
  locked: boolean;
}

export default function CommunityStoryCard({ story, locked }: Props) {
  const { progress, addPoints } = useProgress();
  const [showReader, setShowReader] = useState(false);
  const [hasRead, setHasRead] = useState(false);

  const userLevel = getLevelFromPoints(progress.totalPoints);

  const handleOpen = () => {
    if (locked) return;
    setShowReader(true);
    if (!hasRead) {
      recordStoryRead(story.id);
      addPoints(5); // reader earns 5 points for reading community stories
      setHasRead(true);
    }
  };

  return (
    <>
      <motion.div
        whileHover={locked ? {} : { scale: 1.03, y: -4 }}
        whileTap={locked ? {} : { scale: 0.98 }}
        onClick={handleOpen}
        className={`rounded-2xl overflow-hidden shadow-md border-2 transition-shadow ${
          locked
            ? 'border-gray-200 opacity-70 cursor-not-allowed'
            : 'border-transparent hover:shadow-xl cursor-pointer'
        }`}
      >
        {/* Cover */}
        <div className={`bg-gradient-to-br ${story.coverGradient} h-28 flex items-center justify-center relative`}>
          <span className="text-6xl">{story.coverEmoji}</span>
          {locked && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
              <span className="text-3xl">🔒</span>
              <span className="text-white text-xs font-bold bg-black/40 px-2 py-0.5 rounded-full">
                Level 2 required
              </span>
            </div>
          )}
          {/* Read count badge */}
          {!locked && (
            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full shadow">
              👀 {story.readCount + (hasRead ? 1 : 0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-white p-3">
          <h3 className="font-fredoka font-bold text-gray-800 text-base leading-tight mb-2 line-clamp-2">
            {story.title}
          </h3>

          {/* Author badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-base">{story.authorLevelEmoji}</span>
            <div>
              <p className="text-xs font-bold text-gray-700 leading-none">{story.authorName}</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">{story.authorLevelName}</p>
            </div>
            <span className="ml-auto text-xs text-gray-400">{story.ageRange} yrs</span>
          </div>
        </div>
      </motion.div>

      {/* Story Reader Modal */}
      <AnimatePresence>
        {showReader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReader(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className={`bg-gradient-to-br ${story.coverGradient} p-5 flex items-start gap-3`}>
                <span className="text-5xl">{story.coverEmoji}</span>
                <div className="flex-1">
                  <h2 className="font-fredoka text-2xl font-bold text-white leading-tight">
                    {story.title}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span>{story.authorLevelEmoji}</span>
                    <span className="text-white/90 text-sm font-medium">
                      by {story.authorName}
                    </span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                      {story.authorLevelName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReader(false)}
                  className="text-white/80 hover:text-white text-2xl font-bold leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Earned points notice */}
              {hasRead && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-green-50 border-b border-green-100 px-4 py-2"
                >
                  <p className="text-green-700 text-sm font-semibold">
                    ⭐ You earned +5 points for reading this story!
                  </p>
                </motion.div>
              )}

              {/* Story text */}
              <div className="flex-1 overflow-y-auto p-5">
                <p className="text-gray-700 text-base leading-loose font-nunito whitespace-pre-wrap">
                  {story.text}
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  👀 {story.readCount + (hasRead ? 1 : 0)} reads •{' '}
                  {new Date(story.publishedAt).toLocaleDateString()}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReader(false)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-4 py-1.5 rounded-full"
                >
                  Done Reading ✓
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
