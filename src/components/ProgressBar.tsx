'use client';

import { useProgress } from '@/context/ProgressContext';
import clsx from 'clsx';

const colorMap: Record<string, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
};

const bgColorMap: Record<string, string> = {
  green: 'bg-green-100',
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
  orange: 'bg-orange-100',
  yellow: 'bg-yellow-100',
};

const textColorMap: Record<string, string> = {
  green: 'text-green-700',
  blue: 'text-blue-700',
  purple: 'text-purple-700',
  orange: 'text-orange-700',
  yellow: 'text-yellow-700',
};

interface Props {
  compact?: boolean;
}

export default function ProgressBar({ compact = false }: Props) {
  const { progress, level, levelProgress } = useProgress();

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-white/50">
        <span className="text-lg">{level.emoji}</span>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={clsx('text-xs font-bold', textColorMap[level.color] || 'text-purple-700')}>
              Lv.{level.level}
            </span>
            <span className="text-xs font-semibold text-gray-600 truncate hidden sm:block">
              {level.name}
            </span>
          </div>
          <div className="w-20 sm:w-28 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                colorMap[level.color] || 'bg-purple-500'
              )}
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 ml-1">
          <span className="text-yellow-500">⭐</span>
          <span className="text-sm font-bold text-gray-700">{progress.totalPoints}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-2xl p-4 border border-white/50 shadow-md',
        bgColorMap[level.color] || 'bg-purple-100'
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl">{level.emoji}</div>
        <div>
          <p className={clsx('text-lg font-bold', textColorMap[level.color] || 'text-purple-700')}>
            Level {level.level}: {level.name}
          </p>
          <p className="text-sm text-gray-600 font-medium">
            ⭐ {progress.totalPoints} points total
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold text-gray-500">
          <span>Progress to next level</span>
          <span>{levelProgress}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/60 overflow-hidden border border-white/50">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700 ease-out',
              colorMap[level.color] || 'bg-purple-500'
            )}
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 font-medium">
        <span>📚 {progress.completedStories.length} stories finished</span>
        <span>✏️ {progress.createdStoriesCount} stories created</span>
      </div>
    </div>
  );
}
