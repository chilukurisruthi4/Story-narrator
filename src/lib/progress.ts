import type { UserProgress, StoryProgressData, Story } from '@/types';
import { getLevelFromPoints } from './levels';

const STORAGE_KEY = 'storyland_progress';

const DEFAULT_PROGRESS: UserProgress = {
  totalPoints: 0,
  completedStories: [],
  storyProgress: {},
  createdStoriesCount: 0,
};

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PROGRESS };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(stored) as UserProgress;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage might be full or unavailable
  }
}

export function addPoints(points: number): UserProgress {
  const progress = getProgress();
  const updated = {
    ...progress,
    totalPoints: progress.totalPoints + points,
  };
  saveProgress(updated);
  return updated;
}

export function markStoryComplete(storyId: string): UserProgress {
  const progress = getProgress();
  const updated = {
    ...progress,
    completedStories: progress.completedStories.includes(storyId)
      ? progress.completedStories
      : [...progress.completedStories, storyId],
    storyProgress: {
      ...progress.storyProgress,
      [storyId]: {
        ...progress.storyProgress[storyId],
        completed: true,
        currentSegmentIndex:
          progress.storyProgress[storyId]?.currentSegmentIndex ?? 0,
        quizzesCompleted:
          progress.storyProgress[storyId]?.quizzesCompleted ?? [],
        lastMode: progress.storyProgress[storyId]?.lastMode ?? 'read',
      },
    },
  };
  saveProgress(updated);
  return updated;
}

export function updateStoryProgress(
  storyId: string,
  data: Partial<StoryProgressData>
): UserProgress {
  const progress = getProgress();
  const existing = progress.storyProgress[storyId] ?? {
    currentSegmentIndex: 0,
    quizzesCompleted: [],
    completed: false,
    lastMode: 'read' as const,
  };
  const updated = {
    ...progress,
    storyProgress: {
      ...progress.storyProgress,
      [storyId]: {
        ...existing,
        ...data,
      },
    },
  };
  saveProgress(updated);
  return updated;
}

export function isStoryUnlocked(story: Story, progress: UserProgress): boolean {
  if (story.requiredLevel === 0) return true;
  const userLevel = getLevelFromPoints(progress.totalPoints);
  return userLevel.level >= story.requiredLevel;
}
