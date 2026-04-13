'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import StoryCreator from '@/components/StoryCreator';
import { useProgress } from '@/context/ProgressContext';

export default function CreatePage() {
  const { progress } = useProgress();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="text-5xl"
            >
              ✏️
            </motion.span>
            <div>
              <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-gray-800">
                Create Your Story!
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">
                {progress.createdStoriesCount > 0
                  ? `You've created ${progress.createdStoriesCount} amazing ${progress.createdStoriesCount === 1 ? 'story' : 'stories'} already! 🌟`
                  : 'Write your first story with help from Pip the AI helper! 🌟'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tips banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-3 mb-5 border border-indigo-200"
        >
          <div className="flex items-start gap-2">
            <span className="text-xl flex-shrink-0">💡</span>
            <div>
              <p className="font-semibold text-indigo-700 text-sm mb-1">Tips for a great story:</p>
              <div className="flex flex-wrap gap-3">
                {[
                  '🦸 Give your hero a name',
                  '🏰 Describe where it happens',
                  '😱 Add a problem to solve',
                  '🎉 End happily!',
                ].map((tip) => (
                  <span key={tip} className="text-xs text-indigo-600 font-medium">
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Creator component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StoryCreator />
        </motion.div>
      </main>
    </div>
  );
}
