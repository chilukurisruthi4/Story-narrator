'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import GrammarTopicCard from '@/components/GrammarTopicCard';
import GrammarWizard from '@/components/GrammarWizard';
import { useProgress } from '@/context/ProgressContext';
import { GRAMMAR_TOPICS, isTopicUnlocked } from '@/lib/grammarLessons';
import { getTopicCompletedCount } from '@/lib/grammarProgress';

export default function GrammarPage() {
  const { progress } = useProgress();

  const totalExercises = GRAMMAR_TOPICS.reduce((s, t) => s + t.exercises.length, 0);
  const totalCompleted = GRAMMAR_TOPICS.reduce(
    (s, t) => s + getTopicCompletedCount(t.id),
    0
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="text-6xl mb-3"
          >
            📝
          </motion.div>
          <h1 className="font-fredoka text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            Grammar Zone
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            Learn to write and speak like a champion! 🏆
          </p>

          {/* Progress summary */}
          <div className="mt-4 inline-flex items-center gap-3 bg-white rounded-full px-5 py-2 shadow-sm border border-purple-100">
            <span className="text-yellow-500 font-bold">⭐ {progress.totalPoints} pts</span>
            <span className="text-gray-300">|</span>
            <span className="text-green-600 font-bold">
              ✅ {totalCompleted}/{totalExercises} exercises
            </span>
          </div>
        </motion.div>

        {/* Topics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {GRAMMAR_TOPICS.map((topic, i) => {
            const locked = !isTopicUnlocked(topic, progress.totalPoints);
            const completed = getTopicCompletedCount(topic.id);
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <GrammarTopicCard
                  topic={topic}
                  locked={locked}
                  completedCount={completed}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Grammar Wizard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🧙</span>
            <div>
              <h2 className="font-fredoka text-2xl font-bold text-gray-800">Ask the Grammar Wizard</h2>
              <p className="text-gray-500 text-sm">Got a grammar question? Ask Gram anything!</p>
            </div>
          </div>
          <GrammarWizard />
        </motion.div>
      </main>
    </div>
  );
}
