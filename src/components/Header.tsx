'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-2xl"
          >
            📖
          </motion.span>
          <span className="font-fredoka text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            StoryLand
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/library"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <span className="hidden sm:inline">📚</span>
            <span>Library</span>
          </Link>
          <Link
            href="/create"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold text-pink-700 hover:bg-pink-100 transition-colors"
          >
            <span className="hidden sm:inline">✏️</span>
            <span>Create</span>
          </Link>
          <Link
            href="/grammar"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
          >
            <span className="hidden sm:inline">📝</span>
            <span>Grammar</span>
          </Link>
        </nav>

        {/* Progress */}
        <div className="shrink-0">
          <ProgressBar compact />
        </div>
      </div>
    </header>
  );
}
