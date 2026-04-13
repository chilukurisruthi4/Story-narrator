'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import { useProgress } from '@/context/ProgressContext';
import { STORIES } from '@/lib/stories';
import { isStoryUnlocked } from '@/lib/progress';
import type { Story } from '@/types';

type Difficulty = 'all' | 'beginner' | 'explorer' | 'advanced';

const DIFFICULTY_BUTTONS: { key: Difficulty; label: string; emoji: string }[] = [
  { key: 'all', label: 'All Stories', emoji: '📚' },
  { key: 'beginner', label: 'Beginner', emoji: '🌱' },
  { key: 'explorer', label: 'Explorer', emoji: '🗺️' },
  { key: 'advanced', label: 'Advanced', emoji: '🏆' },
];

export default function LibraryPage() {
  const { progress } = useProgress();
  const [filter, setFilter] = useState<Difficulty>('all');

  const filteredStories: Story[] =
    filter === 'all' ? STORIES : STORIES.filter((s) => s.difficulty === filter);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📚</span>
            <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-gray-800">
              Story Library
            </h1>
          </div>
          <p className="text-gray-600 font-medium">
            {progress.completedStories.length} of {STORIES.length} stories completed •{' '}
            <span className="text-yellow-600 font-semibold">⭐ {progress.totalPoints} points</span>
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {DIFFICULTY_BUTTONS.map(({ key, label, emoji }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600'
              }`}
            >
              {emoji} {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Story grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredStories.map((story, i) => {
            const unlocked = isStoryUnlocked(story, progress);
            const completed = progress.completedStories.includes(story.id);
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <StoryCard
                  story={story}
                  locked={!unlocked}
                  requiredLevelNum={story.requiredLevel}
                />
                {completed && unlocked && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    ✓ Done!
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {filteredStories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium">
              No stories found for this level!
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try a different filter or keep reading to unlock more!
            </p>
          </div>
        )}

        {/* Level unlock hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-4 border border-yellow-200"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">🔓</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">Unlock more stories!</p>
              <p className="text-amber-600 text-xs">
                Earn points by reading stories and answering quiz questions to level up and unlock
                all stories!
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
