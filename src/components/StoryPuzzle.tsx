'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryPuzzleData } from '@/types/puzzle';

interface Props {
  puzzles: StoryPuzzleData[];
  onComplete: (totalPoints: number) => void;
  onSkip: () => void;
}

// ─── Word Scramble ────────────────────────────────────────────────
function WordScramble({
  puzzle,
  onDone,
}: {
  puzzle: StoryPuzzleData;
  onDone: (pts: number) => void;
}) {
  const words = puzzle.words ?? [];
  const [inputs, setInputs] = useState<string[]>(Array(words.length).fill(''));
  const [revealed, setRevealed] = useState<boolean[]>(Array(words.length).fill(false));
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const handleCheck = () => {
    const correct = inputs.filter((inp, i) => inp.trim().toLowerCase() === words[i].answer).length;
    const pts = Math.round((correct / words.length) * puzzle.points);
    setScore(pts);
    setRevealed(Array(words.length).fill(true));
    setChecked(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {words.map((w, i) => {
          const isCorrect = inputs[i].trim().toLowerCase() === w.answer;
          return (
            <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 rounded-xl px-3 py-1.5 font-mono font-bold text-purple-700 text-lg tracking-widest min-w-[80px] text-center">
                  {w.scrambled.toUpperCase()}
                </div>
                <span className="text-gray-400">→</span>
                <input
                  type="text"
                  value={inputs[i]}
                  onChange={(e) => {
                    const next = [...inputs];
                    next[i] = e.target.value;
                    setInputs(next);
                  }}
                  disabled={checked}
                  placeholder="Your answer..."
                  className={`flex-1 border-2 rounded-xl px-3 py-1.5 font-medium focus:outline-none transition-colors ${
                    checked
                      ? isCorrect
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : 'border-red-300 bg-red-50 text-red-600'
                      : 'border-purple-200 focus:border-purple-400'
                  }`}
                />
                {checked && (
                  <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
                )}
              </div>
              {checked && !isCorrect && (
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  Answer: <strong>{w.answer}</strong> — {w.hint}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!checked ? (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleCheck}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-2xl text-lg shadow-md"
        >
          Check My Answers! 🔍
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-2xl font-bold text-purple-700 mb-1">
            {score === puzzle.points ? '🎉 Perfect!' : score > 0 ? '👍 Nice try!' : '🌟 Keep practicing!'}
          </p>
          <p className="text-gray-600 mb-3">You earned <strong className="text-yellow-600">+{score} points</strong>!</p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onDone(score)}
            className="bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold py-2.5 px-8 rounded-full shadow"
          >
            Next Puzzle →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Fill Blank ───────────────────────────────────────────────────
function FillBlank({
  puzzle,
  onDone,
}: {
  puzzle: StoryPuzzleData;
  onDone: (pts: number) => void;
}) {
  const blanks = puzzle.fillBlanks ?? [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);

  const item = blanks[current];
  const isAnswered = selected !== null;
  const isCorrect = selected === item?.answer;

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelected(opt);
    setResults((prev) => [...prev, opt === item.answer]);
  };

  const handleNext = () => {
    if (current + 1 >= blanks.length) {
      const correct = [...results, isCorrect].filter(Boolean).length;
      const pts = Math.round((correct / blanks.length) * puzzle.points);
      onDone(pts);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  if (!item) return null;

  const sentenceParts = item.sentence.split('___');

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-gray-400 mb-1">
        Sentence {current + 1} of {blanks.length}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 text-lg font-medium text-gray-700 leading-relaxed">
        {sentenceParts[0]}
        <span className={`inline-block min-w-[80px] text-center border-b-2 mx-1 px-2 font-bold transition-colors ${
          isAnswered
            ? isCorrect
              ? 'text-green-600 border-green-400'
              : 'text-red-500 border-red-400'
            : 'text-purple-400 border-purple-300'
        }`}>
          {selected ?? '___'}
        </span>
        {sentenceParts[1]}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {item.options.map((opt) => {
          let btnClass = 'border-2 border-gray-200 bg-white text-gray-700 hover:border-purple-300';
          if (isAnswered) {
            if (opt === item.answer) btnClass = 'border-2 border-green-400 bg-green-50 text-green-700 font-bold';
            else if (opt === selected) btnClass = 'border-2 border-red-300 bg-red-50 text-red-600';
            else btnClass = 'border-2 border-gray-100 bg-gray-50 text-gray-400';
          }
          return (
            <motion.button
              key={opt}
              whileHover={!isAnswered ? { scale: 1.05 } : {}}
              whileTap={!isAnswered ? { scale: 0.95 } : {}}
              onClick={() => handleSelect(opt)}
              className={`${btnClass} rounded-xl py-2.5 px-3 font-medium transition-all text-base`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`rounded-2xl p-3 text-sm font-medium ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}
        >
          {isCorrect ? '🎉 Correct! ' : `💡 The answer is "${item.answer}". `}
          {item.hint}
        </motion.div>
      )}

      {isAnswered && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-2xl shadow-md"
        >
          {current + 1 >= blanks.length ? 'See Results! 🏆' : 'Next Sentence →'}
        </motion.button>
      )}
    </div>
  );
}

// ─── Story Sequence ───────────────────────────────────────────────
function StorySequence({
  puzzle,
  onDone,
}: {
  puzzle: StoryPuzzleData;
  onDone: (pts: number) => void;
}) {
  const { events = [], correctOrder = [] } = puzzle;
  const [sequence, setSequence] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([...events]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const addToSequence = (event: string) => {
    if (checked) return;
    setSequence((prev) => [...prev, event]);
    setRemaining((prev) => prev.filter((e) => e !== event));
  };

  const removeFromSequence = (index: number) => {
    if (checked) return;
    const event = sequence[index];
    setSequence((prev) => prev.filter((_, i) => i !== index));
    setRemaining((prev) => [...prev, event]);
  };

  const handleCheck = () => {
    const correct = sequence.every((e, i) => e === correctOrder[i]);
    setIsCorrect(correct);
    setChecked(true);
  };

  const pts = isCorrect ? puzzle.points : Math.floor(puzzle.points / 2);

  return (
    <div className="space-y-4">
      {/* Build order area */}
      <div className="bg-white rounded-2xl p-3 border-2 border-dashed border-purple-200 min-h-[100px]">
        <p className="text-xs font-bold text-purple-400 mb-2">Your order (tap to remove):</p>
        {sequence.length === 0 && (
          <p className="text-gray-400 text-sm italic">Tap events below to add them here...</p>
        )}
        <div className="space-y-1.5">
          {sequence.map((event, i) => (
            <motion.button
              key={event}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => removeFromSequence(i)}
              className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-2 ${
                checked
                  ? event === correctOrder[i]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-600 border border-red-300'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <span className="font-bold text-xs w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              {event}
              {checked && (event === correctOrder[i] ? ' ✅' : ' ❌')}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Remaining events */}
      {remaining.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gray-400">Tap to add to your sequence:</p>
          {remaining.map((event) => (
            <motion.button
              key={event}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToSequence(event)}
              className="w-full text-left bg-white rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              📌 {event}
            </motion.button>
          ))}
        </div>
      )}

      {sequence.length === events.length && !checked && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleCheck}
          className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold py-3 rounded-2xl shadow-md"
        >
          Check My Order! 🔍
        </motion.button>
      )}

      {checked && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-2xl font-bold mb-1">
            {isCorrect ? '🎉 Perfect order!' : '🌟 Good try!'}
          </p>
          {!isCorrect && (
            <div className="bg-orange-50 rounded-xl p-3 mb-3 text-left">
              <p className="text-xs font-bold text-orange-600 mb-1">Correct order:</p>
              {correctOrder.map((e, i) => (
                <p key={i} className="text-sm text-orange-700">
                  {i + 1}. {e}
                </p>
              ))}
            </div>
          )}
          <p className="text-gray-600 mb-3">
            You earned <strong className="text-yellow-600">+{pts} points</strong>!
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onDone(pts)}
            className="bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold py-2.5 px-8 rounded-full shadow"
          >
            Finish Puzzles 🏆
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main StoryPuzzle ─────────────────────────────────────────────
export default function StoryPuzzle({ puzzles, onComplete, onSkip }: Props) {
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const handlePuzzleDone = useCallback(
    (pts: number) => {
      const newTotal = totalPoints + pts;
      setTotalPoints(newTotal);
      if (currentPuzzleIdx + 1 >= puzzles.length) {
        setAllDone(true);
      } else {
        setCurrentPuzzleIdx((i) => i + 1);
      }
    },
    [currentPuzzleIdx, puzzles.length, totalPoints]
  );

  const puzzle = puzzles[currentPuzzleIdx];

  if (allDone) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 text-center border-4 border-yellow-300"
      >
        <div className="text-7xl mb-3">🧩</div>
        <h3 className="font-fredoka text-3xl font-bold text-orange-700 mb-2">
          Puzzles Complete!
        </h3>
        <p className="text-gray-600 mb-4">
          Your brain is getting stronger! 💪
        </p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="bg-yellow-400 rounded-full px-6 py-2 inline-block mb-5"
        >
          <span className="font-bold text-yellow-900 text-lg">
            🧩 +{totalPoints} puzzle points!
          </span>
        </motion.div>
        <br />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(totalPoints)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-full shadow-lg text-lg"
        >
          Finish Story 🎊
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-5 border-2 border-indigo-200 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">🧩</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
              Puzzle {currentPuzzleIdx + 1} of {puzzles.length}
            </span>
          </div>
          <h3 className="font-fredoka text-2xl font-bold text-indigo-700">{puzzle.title}</h3>
          <p className="text-gray-600 text-sm mt-0.5">{puzzle.instruction}</p>
        </div>
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-600 text-sm font-medium px-3 py-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          Skip
        </button>
      </div>

      {/* Puzzle content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPuzzleIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {puzzle.type === 'word-scramble' && (
            <WordScramble puzzle={puzzle} onDone={handlePuzzleDone} />
          )}
          {puzzle.type === 'fill-blank' && (
            <FillBlank puzzle={puzzle} onDone={handlePuzzleDone} />
          )}
          {puzzle.type === 'story-sequence' && (
            <StorySequence puzzle={puzzle} onDone={handlePuzzleDone} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
