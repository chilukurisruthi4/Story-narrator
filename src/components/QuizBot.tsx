'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '@/types';

interface Props {
  quiz: QuizQuestion;
  onAnswer: (correct: boolean, points: number) => void;
  onRemind: (segmentId: string) => void;
  onSkip: () => void;
}

type Phase = 'question' | 'correct' | 'wrong' | 'reminder';

export default function QuizBot({ quiz, onAnswer, onRemind, onSkip }: Props) {
  const [phase, setPhase] = useState<Phase>('question');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleOption = (index: number) => {
    if (phase !== 'question') return;
    setSelectedIndex(index);
    const correct = index === quiz.correctIndex;
    if (correct) {
      setPhase('correct');
      setTimeout(() => onAnswer(true, quiz.points), 1800);
    } else {
      setPhase('wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Bot Card */}
      <motion.div
        initial={{ y: 200, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 200, opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl overflow-hidden quiz-bot-shadow border-4 border-yellow-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-5 py-4 text-center relative">
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl mb-1"
            role="img"
            aria-label="Quiz bot owl"
          >
            🦉
          </motion.div>
          <div className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-lg"
            >
              ⭐
            </motion.span>
            <h2 className="font-fredoka text-2xl font-bold text-white">
              Quiz Time!
            </h2>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              className="text-lg"
            >
              ⭐
            </motion.span>
          </div>
          <p className="text-yellow-100 text-xs mt-0.5">
            Wise the Owl is testing your memory! 🦉
          </p>

          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 text-white/70 hover:text-white text-xs font-medium px-2 py-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Skip quiz question"
          >
            Skip ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {phase === 'question' && (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Speech bubble */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-3 mb-4 relative">
                  <div className="absolute -top-2 left-6 w-4 h-4 bg-yellow-50 border-t-2 border-l-2 border-yellow-200 rotate-45" />
                  <p className="font-semibold text-gray-700 text-base leading-snug">
                    🤔 {quiz.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {quiz.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOption(i)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-purple-50 border-2 border-purple-200 text-gray-700 font-semibold text-sm hover:bg-purple-100 hover:border-purple-400 transition-all"
                      aria-label={`Option ${i + 1}: ${opt}`}
                    >
                      <span className="inline-block w-6 h-6 rounded-full bg-purple-200 text-purple-700 font-bold text-xs flex-shrink-0 text-center leading-6 mr-2">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </motion.button>
                  ))}
                </div>

                <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                  +{quiz.points} points for the right answer! 🌟
                </p>
              </motion.div>
            )}

            {phase === 'correct' && (
              <motion.div
                key="correct"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="text-7xl mb-3"
                >
                  🎉
                </motion.div>
                <h3 className="font-fredoka text-2xl font-bold text-green-600 mb-2">
                  Correct!
                </h3>
                <p className="text-gray-600 text-sm font-medium mb-3">
                  {quiz.feedbackCorrect}
                </p>
                <div className="bg-green-100 rounded-full px-6 py-2 inline-block">
                  <span className="text-green-700 font-bold text-lg">+{quiz.points} points! ⭐</span>
                </div>
              </motion.div>
            )}

            {phase === 'wrong' && (
              <motion.div
                key="wrong"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-3"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl mb-2"
                >
                  🤔
                </motion.div>
                <h3 className="font-fredoka text-xl font-bold text-orange-600 mb-1">
                  Not quite!
                </h3>
                <p className="text-gray-600 text-sm font-medium mb-4">
                  {quiz.feedbackWrong}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setPhase('reminder')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                  >
                    🔍 Help me remember!
                  </button>
                  <button
                    onClick={() => onAnswer(false, 0)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
                  >
                    Continue anyway →
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'reminder' && (
              <motion.div
                key="reminder"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-2"
              >
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 mb-4">
                  <p className="text-sm font-bold text-blue-700 mb-1">📚 Here&apos;s a hint:</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{quiz.reminderText}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onRemind(quiz.reminderSegmentId)}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                  >
                    ⬅️ Go back to that part
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIndex(null);
                      setPhase('question');
                    }}
                    className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                  >
                    🔄 Try again!
                  </button>
                  <button
                    onClick={() => onAnswer(false, 0)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
                  >
                    Skip for now →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
