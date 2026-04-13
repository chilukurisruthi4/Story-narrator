'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import ProgressBar from '@/components/ProgressBar';
import { useProgress } from '@/context/ProgressContext';
import { STORIES } from '@/lib/stories';
import { isStoryUnlocked } from '@/lib/progress';

const FLOATING_EMOJIS = [
  { emoji: '⭐', style: { top: '8%', left: '5%' }, delay: 0 },
  { emoji: '🌙', style: { top: '15%', right: '8%' }, delay: 0.5 },
  { emoji: '🌈', style: { top: '60%', left: '3%' }, delay: 1 },
  { emoji: '✨', style: { top: '40%', right: '5%' }, delay: 0.8 },
  { emoji: '🌟', style: { bottom: '20%', left: '8%' }, delay: 1.2 },
  { emoji: '💫', style: { bottom: '30%', right: '10%' }, delay: 0.3 },
];

export default function HomePage() {
  const { progress } = useProgress();
  const featuredStories = STORIES.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 relative">
        {/* Floating background decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {FLOATING_EMOJIS.map((item, i) => (
            <motion.div
              key={i}
              className="absolute select-none text-3xl opacity-30"
              style={item.style}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: item.delay,
                ease: 'easeInOut',
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="text-7xl sm:text-8xl mb-4 inline-block"
          >
            📚
          </motion.div>

          <h1 className="font-fredoka text-4xl sm:text-6xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Welcome to StoryLand!
            </span>{' '}
            <span className="text-4xl sm:text-5xl">🌟</span>
          </h1>

          <p className="text-gray-600 text-lg sm:text-xl font-semibold mb-6">
            Where every story is an adventure!
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/library"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg px-7 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow inline-flex items-center gap-2"
              >
                📚 Explore Stories
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/create"
                className="bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-lg px-7 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow inline-flex items-center gap-2"
              >
                ✏️ Create a Story
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Progress section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <ProgressBar />
        </motion.div>

        {/* Featured stories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-gray-700">
              🌟 Featured Stories
            </h2>
            <Link
              href="/library"
              className="text-purple-600 hover:text-purple-800 text-sm font-bold transition-colors"
            >
              See all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <StoryCard
                  story={story}
                  locked={!isStoryUnlocked(story, progress)}
                  requiredLevelNum={story.requiredLevel}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Create Story CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <Link href="/create">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 rounded-3xl p-6 border-2 border-pink-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="text-6xl flex-shrink-0"
                >
                  ✏️
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-fredoka text-2xl font-bold text-purple-700 mb-1">
                    Create Your Own Story!
                  </h2>
                  <p className="text-gray-600 text-sm font-medium">
                    Use Pip the AI helper to write your very own magical story!
                    Share your ideas and bring them to life! 🌟
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-md">
                    Start Writing ✨
                  </div>
                </div>
              </div>

              {/* Fun details */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['🤖 AI-powered help', '📝 Your own words', '🎨 Express yourself', '⭐ Show your friends'].map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/60 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { emoji: '📚', label: 'Stories', value: STORIES.length },
            { emoji: '✅', label: 'Completed', value: progress.completedStories.length },
            { emoji: '✏️', label: 'Created', value: progress.createdStoriesCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/50 shadow-sm"
            >
              <div className="text-3xl mb-1">{stat.emoji}</div>
              <div className="font-fredoka text-2xl font-bold text-gray-700">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
