'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Story, QuizQuestion } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import { getLevelFromPoints } from '@/lib/levels';
import AudioPlayer from './AudioPlayer';
import VideoScene from './VideoScene';
import TextReader from './TextReader';
import QuizBot from './QuizBot';
import LevelUpModal from './LevelUpModal';
import clsx from 'clsx';

interface Props {
  story: Story;
  initialMode?: 'audio' | 'video' | 'read';
}

type Mode = 'audio' | 'video' | 'read';

const modeConfig = {
  audio: { label: 'Listen', emoji: '🎧', gradient: 'from-purple-500 to-pink-500' },
  video: { label: 'Watch', emoji: '🎬', gradient: 'from-blue-500 to-cyan-500' },
  read: { label: 'Read', emoji: '📖', gradient: 'from-amber-500 to-orange-500' },
};

export default function StoryViewer({ story, initialMode = 'read' }: Props) {
  const { progress, addPoints, completeStory, updateStory } = useProgress();

  const savedProgress = progress.storyProgress[story.id];
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(
    savedProgress?.currentSegmentIndex ?? 0
  );
  const [mode, setMode] = useState<Mode>(savedProgress?.lastMode ?? initialMode);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>(
    savedProgress?.quizzesCompleted ?? []
  );
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isComplete, setIsComplete] = useState(savedProgress?.completed ?? false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(getLevelFromPoints(progress.totalPoints));

  const currentSegment = story.segments[currentSegmentIndex];
  const totalSegments = story.segments.length;

  // Save progress whenever state changes
  useEffect(() => {
    updateStory(story.id, {
      currentSegmentIndex,
      quizzesCompleted: completedQuizIds,
      completed: isComplete,
      lastMode: mode,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSegmentIndex, completedQuizIds, isComplete, mode]);

  // Check for quiz after advancing to a new segment
  const checkForQuiz = useCallback(
    (segmentId: string) => {
      const quiz = story.quizzes.find(
        (q) => q.afterSegmentId === segmentId && !completedQuizIds.includes(q.id)
      );
      if (quiz) {
        setCurrentQuiz(quiz);
        setShowQuiz(true);
      }
    },
    [story.quizzes, completedQuizIds]
  );

  const handleSegmentComplete = useCallback(() => {
    const segId = story.segments[currentSegmentIndex].id;
    checkForQuiz(segId);
  }, [currentSegmentIndex, story.segments, checkForQuiz]);

  const advanceSegment = useCallback(() => {
    const nextIndex = currentSegmentIndex + 1;
    if (nextIndex >= totalSegments) {
      // Story complete!
      const oldLevel = getLevelFromPoints(progress.totalPoints);
      addPoints(story.pointsReward);
      completeStory(story.id);
      const newLvl = getLevelFromPoints(progress.totalPoints + story.pointsReward);
      if (newLvl.level > oldLevel.level) {
        setNewLevel(newLvl);
        setShowLevelUp(true);
      }
      setEarnedPoints((prev) => prev + story.pointsReward);
      setIsComplete(true);
    } else {
      setCurrentSegmentIndex(nextIndex);
      setVideoPlaying(false);
    }
  }, [currentSegmentIndex, totalSegments, story, progress.totalPoints, addPoints, completeStory]);

  const handlePrevious = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex((prev) => prev - 1);
      setVideoPlaying(false);
      setShowQuiz(false);
    }
  };

  const handleQuizAnswer = (correct: boolean, points: number) => {
    if (currentQuiz) {
      setCompletedQuizIds((prev) => [...prev, currentQuiz.id]);
    }
    if (correct && points > 0) {
      const oldLevel = getLevelFromPoints(progress.totalPoints);
      addPoints(points);
      const newLvl = getLevelFromPoints(progress.totalPoints + points);
      if (newLvl.level > oldLevel.level) {
        setNewLevel(newLvl);
        setShowLevelUp(true);
      }
      setEarnedPoints((prev) => prev + points);
    }
    setShowQuiz(false);
    setCurrentQuiz(null);
    advanceSegment();
  };

  const handleQuizRemind = (segmentId: string) => {
    const idx = story.segments.findIndex((s) => s.id === segmentId);
    if (idx !== -1) {
      setCurrentSegmentIndex(idx);
    }
    setShowQuiz(false);
    setCurrentQuiz(null);
  };

  const handleQuizSkip = () => {
    if (currentQuiz) {
      setCompletedQuizIds((prev) => [...prev, currentQuiz.id]);
    }
    setShowQuiz(false);
    setCurrentQuiz(null);
    advanceSegment();
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setVideoPlaying(false);
  };

  if (isComplete) {
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 text-center border-4 border-yellow-300 shadow-lg"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: 3, repeatDelay: 1 }}
            className="text-7xl mb-3"
          >
            🎊
          </motion.div>
          <h2 className="font-fredoka text-3xl font-bold text-orange-700 mb-2">
            You finished the story!
          </h2>
          <p className="text-gray-600 text-lg mb-4">{story.title}</p>

          <div className="bg-white/60 rounded-2xl p-3 mb-4">
            <p className="text-sm font-semibold text-gray-600 mb-1">💡 The Moral:</p>
            <p className="text-gray-700 font-medium italic">"{story.moral}"</p>
          </div>

          {earnedPoints > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="bg-yellow-400 rounded-full px-6 py-2 inline-block mb-4"
            >
              <span className="font-bold text-yellow-900 text-lg">
                ⭐ +{earnedPoints} points earned!
              </span>
            </motion.div>
          )}

          <div className="flex gap-2 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsComplete(false);
                setCurrentSegmentIndex(0);
                setCompletedQuizIds([]);
                setEarnedPoints(0);
                setVideoPlaying(false);
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              🔄 Read Again
            </motion.button>
            <a
              href="/library"
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors"
            >
              📚 More Stories
            </a>
          </div>
        </motion.div>

        {showLevelUp && (
          <LevelUpModal level={newLevel} onClose={() => setShowLevelUp(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex gap-1 bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-white/50">
        {(Object.keys(modeConfig) as Mode[]).map((m) => {
          const cfg = modeConfig[m];
          return (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              aria-pressed={mode === m}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-sm font-bold transition-all',
                mode === m
                  ? `bg-gradient-to-r ${cfg.gradient} text-white shadow-md`
                  : 'text-gray-500 hover:bg-white/60'
              )}
            >
              <span>{cfg.emoji}</span>
              <span className="hidden xs:inline">{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Segment progress dots */}
      <div className="flex items-center justify-between bg-white/40 rounded-xl px-4 py-2">
        <span className="text-xs font-bold text-gray-500">
          Scene {currentSegmentIndex + 1} of {totalSegments}
        </span>
        <div className="flex gap-1.5">
          {story.segments.map((_, i) => (
            <div
              key={i}
              className={clsx(
                'rounded-full transition-all duration-300',
                i === currentSegmentIndex
                  ? 'w-5 h-2.5 bg-purple-500'
                  : i < currentSegmentIndex
                  ? 'w-2.5 h-2.5 bg-green-400'
                  : 'w-2.5 h-2.5 bg-gray-200'
              )}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-yellow-600">⭐ {earnedPoints}pt</span>
      </div>

      {/* Story content by mode */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSegmentIndex}-${mode}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'audio' && (
            <AudioPlayer
              segment={currentSegment}
              onComplete={handleSegmentComplete}
              autoPlay={false}
            />
          )}

          {mode === 'video' && (
            <div className="space-y-3">
              <VideoScene
                segment={currentSegment}
                playing={videoPlaying}
                onSceneEnd={handleSegmentComplete}
              />
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
                <p className="text-gray-700 text-base leading-relaxed font-nunito">
                  {currentSegment.text}
                </p>
                <div className="mt-3 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setVideoPlaying(!videoPlaying)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm"
                  >
                    {videoPlaying ? '⏸️ Pause Scene' : '▶️ Play Scene'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSegmentComplete}
                    className="flex-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold py-2.5 rounded-xl text-sm"
                  >
                    Next Scene →
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {mode === 'read' && (
            <TextReader segment={currentSegment} onComplete={handleSegmentComplete} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePrevious}
          disabled={currentSegmentIndex === 0}
          className={clsx(
            'px-4 py-2.5 rounded-xl font-bold text-sm transition-all',
            currentSegmentIndex === 0
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300 shadow-sm'
          )}
          aria-label="Go to previous scene"
        >
          ← Previous
        </motion.button>

        <div className="flex-1" />

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSegmentComplete}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-shadow"
          aria-label="Go to next scene"
        >
          Next Scene →
        </motion.button>
      </div>

      {/* Quiz overlay */}
      <AnimatePresence>
        {showQuiz && currentQuiz && (
          <QuizBot
            quiz={currentQuiz}
            onAnswer={handleQuizAnswer}
            onRemind={handleQuizRemind}
            onSkip={handleQuizSkip}
          />
        )}
      </AnimatePresence>

      {/* Level up modal */}
      {showLevelUp && (
        <LevelUpModal level={newLevel} onClose={() => setShowLevelUp(false)} />
      )}
    </div>
  );
}
