'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { StorySegment } from '@/types';
import clsx from 'clsx';

interface Props {
  segment: StorySegment;
  playing?: boolean;
  onSceneEnd?: () => void;
  mini?: boolean; // smaller version for audio/read modes
}

const SCENE_DURATION = 10; // seconds

export default function VideoScene({ segment, playing = false, onSceneEnd, mini = false }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setElapsed(0);
  }, [segment.id]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 0.1;
          if (next >= SCENE_DURATION) {
            clearInterval(intervalRef.current!);
            onSceneEnd?.();
            return SCENE_DURATION;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, onSceneEnd]);

  const progress = (elapsed / SCENE_DURATION) * 100;

  return (
    <div
      className={clsx(
        'relative rounded-2xl overflow-hidden shadow-inner',
        mini ? 'h-40' : 'h-72 sm:h-80'
      )}
    >
      {/* Background */}
      <div className={clsx('absolute inset-0 bg-gradient-to-b', segment.scene.background)} />

      {/* Ambient floating emojis */}
      {segment.scene.ambientEmojis.map((emoji, i) => (
        <motion.div
          key={`${segment.id}-ambient-${i}`}
          className="absolute select-none pointer-events-none"
          style={{
            left: `${10 + i * 22}%`,
            top: `${8 + (i % 2) * 15}%`,
            fontSize: mini ? '1.2rem' : '1.5rem',
          }}
          animate={{
            y: [0, -12, 0],
            x: [0, 4, -4, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2.5 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Foreground scene */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-2">
        <motion.div
          key={segment.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={clsx('select-none', mini ? 'text-4xl' : 'text-5xl sm:text-6xl')}
        >
          {segment.scene.foregroundEmojis}
        </motion.div>
      </div>

      {/* Characters */}
      <motion.div
        key={`${segment.id}-left`}
        className="absolute bottom-4 left-4 select-none"
        style={{ fontSize: mini ? '1.8rem' : '2.5rem' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {segment.scene.characterLeft}
      </motion.div>

      <motion.div
        key={`${segment.id}-right`}
        className="absolute bottom-4 right-4 select-none"
        style={{ fontSize: mini ? '1.8rem' : '2.5rem' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        {segment.scene.characterRight}
      </motion.div>

      {/* Caption */}
      {!mini && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-4 py-2">
          <p className="text-white text-sm sm:text-base font-medium leading-snug line-clamp-2 font-nunito">
            {segment.text.slice(0, 100)}{segment.text.length > 100 ? '...' : ''}
          </p>
        </div>
      )}

      {/* Progress bar */}
      {playing && !mini && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-white/70"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Title overlay */}
      {!mini && (
        <div className="absolute top-2 left-0 right-0 flex justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-xs font-semibold">{segment.title}</span>
          </div>
        </div>
      )}
    </div>
  );
}
