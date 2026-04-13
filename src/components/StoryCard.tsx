'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
import type { Story } from '@/types';

const difficultyConfig = {
  beginner: { label: 'Beginner', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  explorer: { label: 'Explorer', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  advanced: { label: 'Advanced', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
};

interface Props {
  story: Story;
  locked?: boolean;
  requiredLevelNum?: number;
}

export default function StoryCard({ story, locked = false, requiredLevelNum }: Props) {
  const diff = difficultyConfig[story.difficulty];

  const cardContent = (
    <motion.div
      whileHover={locked ? {} : { scale: 1.03, y: -4 }}
      whileTap={locked ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={clsx(
        'relative rounded-2xl overflow-hidden shadow-md border-2 border-white/60 bg-white',
        'transition-shadow duration-300',
        locked ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer'
      )}
    >
      {/* Cover area */}
      <div className={clsx('relative h-36 bg-gradient-to-br', story.coverGradient, 'flex items-center justify-center')}>
        <span className="text-6xl select-none">{story.coverEmoji}</span>

        {/* Category badge */}
        <div className="absolute top-2 left-2 bg-white/30 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-xs font-semibold text-white">{story.category}</span>
        </div>

        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
            <span className="text-4xl">🔒</span>
            {requiredLevelNum !== undefined && (
              <span className="text-white text-sm font-bold mt-1">
                Level {requiredLevelNum} needed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-3">
        <h3 className="font-bold text-gray-800 text-base leading-tight mb-1 line-clamp-2">
          {story.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1 italic">{story.tagline}</p>

        <div className="flex items-center justify-between flex-wrap gap-1">
          <span
            className={clsx(
              'text-xs font-semibold px-2 py-0.5 rounded-full border',
              diff.bg,
              diff.text,
              diff.border
            )}
          >
            {diff.label}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span>👶 {story.ageRange}y</span>
            <span>⏱️ {story.readingTime}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1">
          <span className="text-yellow-500 text-xs">⭐</span>
          <span className="text-xs font-semibold text-gray-500">+{story.pointsReward} pts</span>
        </div>
      </div>
    </motion.div>
  );

  if (locked) {
    return cardContent;
  }

  return (
    <Link href={`/story/${story.id}`} className="block">
      {cardContent}
    </Link>
  );
}
