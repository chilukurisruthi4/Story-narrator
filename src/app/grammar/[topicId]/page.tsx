'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import GrammarExercise from '@/components/GrammarExercise';
import { getTopicById } from '@/lib/grammarLessons';
import { getTopicProgress, markExerciseComplete } from '@/lib/grammarProgress';
import { useProgress } from '@/context/ProgressContext';

type PageState = 'intro' | 'exercises' | 'complete';

const CONFETTI_EMOJIS = ['🌟', '🎉', '⭐', '🎊', '✨', '🏆', '🎵', '💫'];

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = typeof params.topicId === 'string' ? params.topicId : '';
  const topic = getTopicById(topicId);

  const { addPoints } = useProgress();
  const [pageState, setPageState] = useState<PageState>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [confetti, setConfetti] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

  useEffect(() => {
    if (topic) {
      const completed = getTopicProgress(topic.id);
      setCompletedCount(completed.length);
    }
  }, [topic]);

  if (!topic) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-fredoka text-3xl font-bold text-gray-700 mb-4">Topic not found!</h1>
          <Link
            href="/grammar"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-3 rounded-full shadow-lg"
          >
            ← Back to Grammar Zone
          </Link>
        </main>
      </div>
    );
  }

  const handleExerciseComplete = (correct: boolean, points: number) => {
    const exercise = topic.exercises[exerciseIndex];

    if (correct) {
      markExerciseComplete(topic.id, exercise.id);
      setSessionPoints((prev) => prev + points);
      addPoints(points);
      setCompletedCount(getTopicProgress(topic.id).length);
    }

    const isLast = exerciseIndex >= topic.exercises.length - 1;
    if (isLast) {
      // Award bonus points if all exercises were completed
      const allCompleted = getTopicProgress(topic.id).length >= topic.exercises.length;
      if (allCompleted) {
        addPoints(topic.pointsReward);
        setSessionPoints((prev) => prev + topic.pointsReward);
      }
      triggerConfetti();
      setPageState('complete');
    } else {
      setExerciseIndex((prev) => prev + 1);
    }
  };

  const triggerConfetti = () => {
    const pieces = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
      x: Math.random() * 90 + 5,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 3500);
  };

  const handleRestart = () => {
    setExerciseIndex(0);
    setSessionPoints(0);
    setPageState('intro');
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{ left: `${piece.x}%`, top: '-20px', animationDelay: `${piece.id * 0.15}s` }}
        >
          {piece.emoji}
        </div>
      ))}

      <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/grammar"
            className="text-purple-600 hover:text-purple-800 font-bold text-sm flex items-center gap-1 transition-colors"
          >
            ← Grammar Zone
          </Link>
        </div>

        {/* Topic header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${topic.gradient} rounded-3xl p-5 mb-6 text-white shadow-lg`}
        >
          <div className="flex items-center gap-4">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="text-5xl"
            >
              {topic.emoji}
            </motion.span>
            <div>
              <h1 className="font-fredoka text-3xl font-bold">{topic.title}</h1>
              <p className="text-white/90 font-semibold text-base">{topic.tagline}</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* INTRO STATE */}
          {pageState === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-5"
            >
              {/* Description */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
                <h2 className="font-fredoka text-xl font-bold text-purple-700 mb-2">What is a {topic.title}?</h2>
                <p className="text-gray-700 text-lg font-medium leading-relaxed">{topic.description}</p>
              </div>

              {/* Examples */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-5 border-2 border-purple-100 shadow-sm">
                <h2 className="font-fredoka text-xl font-bold text-purple-700 mb-3">✨ Examples</h2>
                <ul className="space-y-2.5">
                  {topic.examples.map((ex, i) => {
                    const parts = ex.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400 font-extrabold mt-0.5">•</span>
                        <span className="text-gray-700 text-lg font-medium">
                          {parts.map((part, j) =>
                            part.startsWith('**') && part.endsWith('**') ? (
                              <strong key={j} className="font-extrabold text-purple-700 underline decoration-dotted">
                                {part.slice(2, -2)}
                              </strong>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Progress info */}
              {completedCount > 0 && (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-200 flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <p className="text-green-700 font-bold text-base">
                    You have completed {completedCount} of {topic.exercises.length} exercises!
                    {completedCount < topic.exercises.length ? ' Keep going!' : ' Amazing job!'}
                  </p>
                </div>
              )}

              {/* Start button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPageState('exercises')}
                className={`w-full py-5 bg-gradient-to-r ${topic.gradient} text-white font-extrabold text-xl rounded-3xl shadow-lg hover:shadow-xl transition-shadow`}
              >
                {completedCount > 0 && completedCount < topic.exercises.length
                  ? 'Continue Exercises →'
                  : completedCount >= topic.exercises.length
                  ? 'Play Again ↺'
                  : 'Start Exercises! →'}
              </motion.button>
            </motion.div>
          )}

          {/* EXERCISES STATE */}
          {pageState === 'exercises' && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              {/* Exercise progress tracker */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-600 text-base">
                    Exercise {exerciseIndex + 1} of {topic.exercises.length}
                  </span>
                  <span className="font-bold text-yellow-600 text-sm">
                    ⭐ {sessionPoints} pts this session
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <motion.div
                    initial={{ width: `${(exerciseIndex / topic.exercises.length) * 100}%` }}
                    animate={{ width: `${((exerciseIndex + 1) / topic.exercises.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${topic.gradient}`}
                  />
                </div>
              </div>

              {/* Exercise card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`exercise-${exerciseIndex}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="bg-white rounded-3xl p-5 shadow-md border border-purple-100"
                >
                  <GrammarExercise
                    exercise={topic.exercises[exerciseIndex]}
                    onComplete={handleExerciseComplete}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* COMPLETE STATE */}
          {pageState === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: 3 }}
                className="text-8xl"
              >
                🏆
              </motion.div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-6 border-2 border-yellow-200 shadow-lg">
                <h2 className="font-fredoka text-3xl font-bold text-yellow-700 mb-2">
                  Brilliant Work!
                </h2>
                <p className="text-gray-700 text-lg font-semibold mb-4">
                  You completed all {topic.exercises.length} exercises on {topic.title}!
                </p>
                <div className="bg-white/80 rounded-2xl p-4 inline-block">
                  <p className="text-2xl font-extrabold text-yellow-600">
                    ⭐ +{sessionPoints} points earned!
                  </p>
                  {sessionPoints > topic.pointsReward && (
                    <p className="text-sm text-green-600 font-bold mt-1">
                      Includes +{topic.pointsReward} bonus for completing the topic! 🎊
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRestart}
                  className="flex-1 py-4 bg-white border-2 border-purple-300 text-purple-700 font-extrabold text-base rounded-2xl hover:bg-purple-50 transition-colors"
                >
                  ↺ Try Again
                </motion.button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                  <Link
                    href="/grammar"
                    className="block py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-base rounded-2xl text-center shadow-lg"
                  >
                    Try Another Topic →
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
