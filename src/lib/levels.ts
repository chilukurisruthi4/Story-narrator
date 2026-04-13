import type { Level } from '@/types';

export const LEVELS: Level[] = [
  {
    level: 1,
    name: 'Story Starter',
    emoji: '🌱',
    minPoints: 0,
    maxPoints: 99,
    color: 'green',
  },
  {
    level: 2,
    name: 'Bookworm',
    emoji: '📚',
    minPoints: 100,
    maxPoints: 249,
    color: 'blue',
  },
  {
    level: 3,
    name: 'Story Explorer',
    emoji: '🗺️',
    minPoints: 250,
    maxPoints: 499,
    color: 'purple',
  },
  {
    level: 4,
    name: 'Word Wizard',
    emoji: '✨',
    minPoints: 500,
    maxPoints: 799,
    color: 'orange',
  },
  {
    level: 5,
    name: 'Master Storyteller',
    emoji: '👑',
    minPoints: 800,
    maxPoints: Infinity,
    color: 'yellow',
  },
];

export function getLevelFromPoints(points: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getProgressToNextLevel(points: number): number {
  const currentLevel = getLevelFromPoints(points);
  if (currentLevel.level === LEVELS.length) {
    return 100;
  }
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);
  if (!nextLevel) return 100;

  const range = nextLevel.minPoints - currentLevel.minPoints;
  const progress = points - currentLevel.minPoints;
  return Math.min(100, Math.round((progress / range) * 100));
}
