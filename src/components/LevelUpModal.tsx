'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Level } from '@/types';

interface Props {
  level: Level;
  onClose: () => void;
}

const CONFETTI_EMOJIS = ['🎉', '⭐', '🌟', '✨', '🎊', '🎈', '🎀', '💫'];

interface ConfettiPiece {
  id: number;
  emoji: string;
  left: number;
  delay: number;
}

export default function LevelUpModal({ level, onClose }: Props) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const pieces: ConfettiPiece[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
    }));
    setConfetti(pieces);

    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Confetti */}
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={{
              left: `${piece.left}%`,
              top: '-20px',
              animationDelay: `${piece.delay}s`,
              fontSize: '1.5rem',
            }}
          >
            {piece.emoji}
          </span>
        ))}

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative z-10 bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border-4 border-yellow-300"
        >
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-200/50 to-orange-200/50 blur-xl -z-10 scale-110" />

          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            className="text-7xl mb-4"
          >
            {level.emoji}
          </motion.div>

          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-4 py-1 rounded-full inline-block mb-3">
            LEVEL UP! 🎉
          </div>

          <h2 className="font-fredoka text-3xl font-bold text-gray-800 mb-2">
            You reached Level {level.level}!
          </h2>

          <p className="text-xl font-bold text-purple-600 mb-4">{level.name}</p>

          <p className="text-gray-600 text-sm mb-6">
            Amazing job! Keep reading and exploring stories to unlock even more adventures!
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            {['🌟', '✨', '⭐', '💫', '🎊'].map((emoji, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -8, 0], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="text-2xl"
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            Keep Exploring! 🚀
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
