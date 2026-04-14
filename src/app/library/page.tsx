'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import CommunityStoryCard from '@/components/CommunityStoryCard';
import { useProgress } from '@/context/ProgressContext';
import { STORIES } from '@/lib/stories';
import { getCommunityStories } from '@/lib/communityStories';
import { getLevelFromPoints } from '@/lib/levels';
import { isStoryUnlocked } from '@/lib/progress';
import type { Story } from '@/types';

type Difficulty = 'all' | 'beginner' | 'explorer' | 'advanced';
type Tab = 'curated' | 'community';

const DIFFICULTY_BUTTONS: { key: Difficulty; label: string; emoji: string }[] = [
  { key: 'all', label: 'All Stories', emoji: '📚' },
  { key: 'beginner', label: 'Beginner', emoji: '🌱' },
  { key: 'explorer', label: 'Explorer', emoji: '🗺️' },
  { key: 'advanced', label: 'Advanced', emoji: '🏆' },
];

export default function LibraryPage() {
  const { progress } = useProgress();
  const [filter, setFilter] = useState<Difficulty>('all');
  const [activeTab, setActiveTab] = useState<Tab>('curated');

  const userLevel = getLevelFromPoints(progress.totalPoints);
  const communityStories = getCommunityStories();
  const canReadCommunity = userLevel.level >= 2;

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
            <span className="text-yellow-600 font-semibold">⭐ {progress.totalPoints} points</span>{' '}
            • <span className="font-semibold" style={{ color: userLevel.color.replace('text-', '').includes('-') ? undefined : userLevel.color }}>
              {userLevel.emoji} {userLevel.name}
            </span>
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 mb-5"
        >
          <button
            onClick={() => setActiveTab('curated')}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === 'curated'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300'
            }`}
          >
            ✨ Curated Stories
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all relative ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-md'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-300'
            }`}
          >
            🌍 Community Stories
            <span className="ml-1.5 bg-orange-100 text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {communityStories.length}
            </span>
          </button>
        </motion.div>

        {activeTab === 'curated' ? (
          <>
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
                <p className="text-gray-500 text-lg font-medium">No stories found!</p>
                <p className="text-gray-400 text-sm mt-1">Try a different filter.</p>
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
                    Earn points by reading stories and answering quiz questions to level up!
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          /* Community Stories Tab */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Level requirement banner */}
            {!canReadCommunity ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-2xl p-5 mb-6 text-center"
              >
                <div className="text-5xl mb-2">🔒</div>
                <h3 className="font-fredoka text-xl font-bold text-orange-700 mb-1">
                  Reach Level 2 to Read Community Stories!
                </h3>
                <p className="text-orange-600 text-sm">
                  You need <strong>100 points</strong> to unlock community stories.{' '}
                  You currently have <strong>{progress.totalPoints} points</strong>.
                  Keep reading and answering quizzes!
                </p>
                <div className="mt-3 bg-orange-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-yellow-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (progress.totalPoints / 100) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-orange-500 mt-1">
                  {Math.max(0, 100 - progress.totalPoints)} more points needed
                </p>
              </motion.div>
            ) : (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <span className="text-3xl">🌟</span>
                <div>
                  <p className="font-bold text-green-700 text-sm">Community Unlocked!</p>
                  <p className="text-green-600 text-xs">
                    Read stories by other kids and earn <strong>+5 points</strong> each time!
                    Publish your own to earn <strong>+10 points per reader!</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Community story grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityStories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CommunityStoryCard
                    story={story}
                    locked={!canReadCommunity}
                  />
                </motion.div>
              ))}
            </div>

            {/* Write your own CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 border border-purple-200 text-center"
            >
              <div className="text-4xl mb-2">✏️</div>
              <h3 className="font-fredoka text-xl font-bold text-purple-700 mb-1">
                Write Your Own Story!
              </h3>
              <p className="text-purple-600 text-sm mb-3">
                Create a story with Pip the AI helper and publish it for the whole community to read!
                Earn <strong>+50 points</strong> for publishing.
              </p>
              <a
                href="/create"
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-2.5 rounded-full hover:shadow-lg transition-shadow"
              >
                Start Writing 🚀
              </a>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
