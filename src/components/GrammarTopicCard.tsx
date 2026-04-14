'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GrammarTopic } from '@/types/grammar';

interface Props {
  topic: GrammarTopic;
  locked: boolean;
  completedCount: number;
}

export default function GrammarTopicCard({ topic, locked, completedCount }: Props) {
  const total = topic.exercises.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isComplete = completedCount >= total;

  const cardContent = (
    <motion.div
      whileHover={!locked ? { scale: 1.03, y: -4 } : {}}
      whileTap={!locked ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`relative rounded-3xl overflow-hidden border-2 shadow-md transition-shadow ${
        locked
          ? 'border-gray-200 opacity-60 cursor-not-allowed'
          : isComplete
          ? 'border-green-300 hover:shadow-xl cursor-pointer'
          : 'border-white/60 hover:shadow-xl cursor-pointer'
      }`}
    >
      {/* Gradient header with emoji */}
      <div className={`bg-gradient-to-br ${topic.gradient} p-5 flex flex-col items-center justify-center min-h-[110px] relative`}>
        <motion.span
          animate={!locked ? { rotate: [0, 8, -8, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="text-5xl mb-1 select-none"
        >
          {topic.emoji}
        </motion.span>
        {isComplete && (
          <div className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center shadow-sm">
            <span className="text-green-500 text-base">✓</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="bg-white p-4">
        <h3 className="font-fredoka text-xl font-bold text-gray-800 mb-0.5">{topic.title}</h3>
        <p className="text-sm text-gray-500 font-medium mb-3 leading-snug">{topic.tagline}</p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-gray-500">
              {completedCount}/{total} exercises
            </span>
            {isComplete && (
              <span className="text-xs font-extrabold text-green-600">Complete! 🌟</span>
            )}
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isComplete
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                  : `bg-gradient-to-r ${topic.gradient}`
              }`}
            />
          </div>
        </div>

        {/* CTA button */}
        <div
          className={`w-full py-2.5 rounded-2xl text-center font-extrabold text-sm transition-all ${
            locked
              ? 'bg-gray-100 text-gray-400'
              : isComplete
              ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-sm'
              : completedCount > 0
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
              : `bg-gradient-to-r ${topic.gradient} text-white shadow-sm`
          }`}
        >
          {locked ? (
            <span className="flex items-center justify-center gap-1">
              🔒 Locked
            </span>
          ) : isComplete ? (
            'Play Again ↺'
          ) : completedCount > 0 ? (
            'Continue →'
          ) : (
            'Start →'
          )}
        </div>
      </div>

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 bg-gray-200/30 flex flex-col items-center justify-center rounded-3xl">
          <div className="bg-white/90 rounded-2xl px-4 py-3 text-center shadow-md">
            <div className="text-3xl mb-1">🔒</div>
            <p className="text-xs font-bold text-gray-600">
              Reach Level {topic.requiredLevel} to unlock!
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );

  if (locked) {
    return cardContent;
  }

  return (
    <Link href={`/grammar/${topic.id}`} className="block">
      {cardContent}
    </Link>
  );
}
