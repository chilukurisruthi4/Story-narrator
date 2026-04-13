'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProgress, StoryProgressData, Level } from '@/types';
import {
  getProgress,
  addPoints as addPointsToStorage,
  markStoryComplete as markStoryCompleteInStorage,
  updateStoryProgress as updateStoryProgressInStorage,
} from '@/lib/progress';
import { getLevelFromPoints, getProgressToNextLevel } from '@/lib/levels';

interface ProgressContextType {
  progress: UserProgress;
  addPoints: (pts: number) => void;
  completeStory: (id: string) => void;
  updateStory: (id: string, data: Partial<StoryProgressData>) => void;
  level: Level;
  levelProgress: number;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>({
    totalPoints: 0,
    completedStories: [],
    storyProgress: {},
    createdStoriesCount: 0,
  });

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const addPoints = useCallback((pts: number) => {
    const updated = addPointsToStorage(pts);
    setProgress(updated);
  }, []);

  const completeStory = useCallback((id: string) => {
    const updated = markStoryCompleteInStorage(id);
    setProgress(updated);
  }, []);

  const updateStory = useCallback((id: string, data: Partial<StoryProgressData>) => {
    const updated = updateStoryProgressInStorage(id, data);
    setProgress(updated);
  }, []);

  const level = getLevelFromPoints(progress.totalPoints);
  const levelProgress = getProgressToNextLevel(progress.totalPoints);

  return (
    <ProgressContext.Provider
      value={{ progress, addPoints, completeStory, updateStory, level, levelProgress }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextType {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return ctx;
}
