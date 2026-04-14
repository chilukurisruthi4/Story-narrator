export type ExerciseType = 'identify' | 'fill-blank' | 'multiple-choice' | 'sort-words' | 'fix-sentence';

export interface GrammarExercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  sentence: string;          // the sentence to work with (highlights with ** for bold, ___ for blank)
  options?: string[];        // for multiple-choice, identify, fill-blank
  correctAnswer: string;     // exact answer string
  explanation: string;       // shown after answering — fun, educational
  points: number;
}

export interface GrammarTopic {
  id: string;
  title: string;
  emoji: string;
  gradient: string;          // Tailwind gradient classes
  tagline: string;
  description: string;       // 1-2 sentence explanation for kids
  examples: string[];        // 3 example sentences showing the concept
  exercises: GrammarExercise[];
  requiredLevel: number;     // 0 = always unlocked
  pointsReward: number;      // bonus points on completing all exercises
}
