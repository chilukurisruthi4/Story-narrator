export interface ScrambleWord {
  scrambled: string;
  answer: string;
  hint: string;
}

export interface FillBlankPuzzle {
  sentence: string;  // sentence with ___ for the blank
  answer: string;
  options: string[]; // includes answer + 2 wrong options
  hint: string;
}

export interface SequenceEvent {
  text: string;
  correctIndex: number; // 0-based correct position
}

export type PuzzleType = 'word-scramble' | 'fill-blank' | 'story-sequence';

export interface StoryPuzzleData {
  type: PuzzleType;
  title: string;
  instruction: string;
  // word-scramble
  words?: ScrambleWord[];
  // fill-blank
  fillBlanks?: FillBlankPuzzle[];
  // story-sequence
  events?: string[];       // shuffled events shown to user
  correctOrder?: string[]; // correct order of events
  points: number;
}
