'use client';

import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import StoryViewer from '@/components/StoryViewer';
import { getStoryById } from '@/lib/stories';

interface Props {
  params: { id: string };
}

export default function StoryPage({ params }: Props) {
  const story = getStoryById(params.id);

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-4 text-sm"
        >
          <Link
            href="/library"
            className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
          >
            ← Library
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium truncate">{story.title}</span>
        </motion.div>

        {/* Story header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${story.coverGradient} rounded-2xl px-4 py-2 mb-3`}>
            <span className="text-4xl">{story.coverEmoji}</span>
            <div>
              <h1 className="font-fredoka text-2xl font-bold text-white leading-tight">
                {story.title}
              </h1>
              <p className="text-white/80 text-xs font-medium">{story.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500">
            <span className="bg-white/60 rounded-full px-2.5 py-1">👶 Ages {story.ageRange}</span>
            <span className="bg-white/60 rounded-full px-2.5 py-1">⏱️ {story.readingTime}</span>
            <span className="bg-white/60 rounded-full px-2.5 py-1">⭐ +{story.pointsReward} pts</span>
            <span className="bg-white/60 rounded-full px-2.5 py-1">
              📖 {story.segments.length} scenes
            </span>
          </div>
        </motion.div>

        {/* Story viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StoryViewer story={story} initialMode="read" />
        </motion.div>
      </main>
    </div>
  );
}
