'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GrammarExercise as GrammarExerciseType } from '@/types/grammar';

interface Props {
  exercise: GrammarExerciseType;
  onComplete: (correct: boolean, points: number) => void;
}

function parseSentence(sentence: string): React.ReactNode[] {
  const parts = sentence.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-purple-700">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function GrammarExercise({ exercise, onComplete }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sortedWords, setSortedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setSortedWords([]);
    setShowPoints(false);

    if (exercise.type === 'sort-words' && exercise.options) {
      // Shuffle the options
      const shuffled = [...exercise.options].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
  }, [exercise.id, exercise.type, exercise.options]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    const correct = answer.trim() === exercise.correctAnswer.trim();
    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setShowPoints(true);
      setTimeout(() => setShowPoints(false), 2000);
    }
  };

  const handleSortWordClick = (word: string, fromSorted: boolean) => {
    if (isAnswered) return;
    if (fromSorted) {
      // Move back to available
      setSortedWords((prev) => prev.filter((_, i) => {
        const idx = prev.lastIndexOf(word);
        return i !== idx;
      }));
      setAvailableWords((prev) => [...prev, word]);
    } else {
      // Move to sorted
      setAvailableWords((prev) => {
        const idx = prev.indexOf(word);
        if (idx === -1) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setSortedWords((prev) => [...prev, word]);
    }
  };

  const handleSubmitSort = () => {
    if (isAnswered || sortedWords.length === 0) return;
    const answer = sortedWords.join(' ');
    handleAnswer(answer);
  };

  const handleNext = () => {
    onComplete(isCorrect, isCorrect ? exercise.points : 0);
  };

  const isCorrectOption = (opt: string) => opt === exercise.correctAnswer;
  const isSelectedOption = (opt: string) => opt === selectedAnswer;

  const optionButtonClass = (opt: string) => {
    if (!isAnswered) {
      return 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:scale-105 transition-all cursor-pointer';
    }
    if (isCorrectOption(opt)) {
      return 'bg-green-100 border-2 border-green-400 text-green-800 shadow-green-200 shadow-md';
    }
    if (isSelectedOption(opt) && !isCorrect) {
      return 'bg-red-100 border-2 border-red-400 text-red-800 animate-shake';
    }
    return 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed';
  };

  return (
    <div className="relative">
      {/* Points pop animation */}
      <AnimatePresence>
        {showPoints && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: -80, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 right-4 z-10 pointer-events-none"
          >
            <span className="text-2xl font-extrabold text-yellow-500 drop-shadow-md">
              +{exercise.points} pts ⭐
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruction */}
      <div className="mb-4">
        <p className="text-lg font-bold text-gray-700">{exercise.instruction}</p>
      </div>

      {/* Exercise type renderers */}
      {(exercise.type === 'identify' || exercise.type === 'fill-blank') && (
        <div className="space-y-4">
          {/* Sentence display */}
          <div className="bg-indigo-50 rounded-2xl p-4 text-xl font-semibold text-gray-700 border-2 border-indigo-100">
            {parseSentence(exercise.sentence)}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {exercise.options?.map((opt) => (
              <motion.button
                key={opt}
                whileTap={!isAnswered ? { scale: 0.95 } : {}}
                onClick={() => handleAnswer(opt)}
                className={`py-3 px-4 rounded-2xl text-lg font-bold min-h-[52px] ${optionButtonClass(opt)}`}
              >
                {isAnswered && isCorrectOption(opt) && <span className="mr-1">✅</span>}
                {isAnswered && isSelectedOption(opt) && !isCorrect && <span className="mr-1">❌</span>}
                {opt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {exercise.type === 'multiple-choice' && (
        <div className="space-y-4">
          {/* Sentence/question display */}
          <div className="bg-indigo-50 rounded-2xl p-4 text-lg font-semibold text-gray-700 border-2 border-indigo-100">
            {parseSentence(exercise.sentence)}
          </div>

          {/* Options A/B/C/D */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercise.options?.map((opt, idx) => {
              const labels = ['A', 'B', 'C', 'D'];
              return (
                <motion.button
                  key={opt}
                  whileTap={!isAnswered ? { scale: 0.97 } : {}}
                  onClick={() => handleAnswer(opt)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-2xl text-base font-bold min-h-[52px] text-left ${optionButtonClass(opt)}`}
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-sm">
                    {labels[idx]}
                  </span>
                  <span className="flex-1">
                    {isAnswered && isCorrectOption(opt) && <span className="mr-1">✅</span>}
                    {isAnswered && isSelectedOption(opt) && !isCorrect && <span className="mr-1">❌</span>}
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {exercise.type === 'sort-words' && (
        <div className="space-y-4">
          {/* Assembled sentence display */}
          <div className="bg-indigo-50 rounded-2xl p-4 min-h-[64px] border-2 border-dashed border-indigo-300 flex flex-wrap gap-2 items-center">
            {sortedWords.length === 0 ? (
              <span className="text-gray-400 font-medium text-base">Tap words below to build the sentence...</span>
            ) : (
              sortedWords.map((word, i) => (
                <motion.button
                  key={`sorted-${i}-${word}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => handleSortWordClick(word, true)}
                  disabled={isAnswered}
                  className="bg-purple-500 text-white font-bold px-3 py-1.5 rounded-xl text-base shadow-md hover:bg-purple-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {word}
                </motion.button>
              ))
            )}
          </div>

          {/* Available words */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border-2 border-gray-200 min-h-[56px]">
            {availableWords.map((word, i) => (
              <motion.button
                key={`avail-${i}-${word}`}
                whileTap={!isAnswered ? { scale: 0.9 } : {}}
                onClick={() => handleSortWordClick(word, false)}
                disabled={isAnswered}
                className="bg-white border-2 border-purple-300 text-purple-700 font-bold px-3 py-1.5 rounded-xl text-base hover:bg-purple-50 hover:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {word}
              </motion.button>
            ))}
            {availableWords.length === 0 && !isAnswered && (
              <span className="text-gray-400 text-sm font-medium">All words used!</span>
            )}
          </div>

          {/* Submit sort */}
          {!isAnswered && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitSort}
              disabled={sortedWords.length === 0}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-lg rounded-2xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Check My Sentence ✓
            </motion.button>
          )}

          {/* Show correct answer on wrong */}
          {isAnswered && !isCorrect && (
            <div className="bg-green-50 rounded-2xl p-3 border-2 border-green-200">
              <p className="text-sm font-bold text-green-700">Correct answer:</p>
              <p className="text-base font-extrabold text-green-800">{exercise.correctAnswer}</p>
            </div>
          )}
        </div>
      )}

      {exercise.type === 'fix-sentence' && (
        <div className="space-y-4">
          {/* Sentence with error */}
          <div className="bg-red-50 rounded-2xl p-4 text-xl font-semibold text-gray-700 border-2 border-red-100">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wide block mb-1">Fix this sentence:</span>
            {parseSentence(exercise.sentence)}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {exercise.options?.map((opt) => (
              <motion.button
                key={opt}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(opt)}
                className={`py-3 px-4 rounded-2xl text-base font-bold min-h-[52px] text-left ${optionButtonClass(opt)}`}
              >
                {isAnswered && isCorrectOption(opt) && <span className="mr-2">✅</span>}
                {isAnswered && isSelectedOption(opt) && !isCorrect && <span className="mr-2">❌</span>}
                {opt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback section */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`mt-4 rounded-2xl p-4 border-2 ${
              isCorrect
                ? 'bg-green-50 border-green-300 shadow-green-100 shadow-lg'
                : 'bg-orange-50 border-orange-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{isCorrect ? '🎉' : '💡'}</span>
              <div>
                <p className={`font-extrabold text-base mb-1 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                  {isCorrect ? 'Correct! Well done!' : 'Not quite — keep going!'}
                </p>
                <p className="text-sm font-medium text-gray-600 leading-relaxed">
                  {exercise.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Next Exercise →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
