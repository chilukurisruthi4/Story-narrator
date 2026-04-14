export interface StorySegment {
  id: string;
  title: string;
  text: string;
  scene: {
    background: string;
    foregroundEmojis: string;
    characterLeft: string;
    characterRight: string;
    ambientEmojis: string[];
  };
}

export interface QuizQuestion {
  id: string;
  afterSegmentId: string;
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
  feedbackCorrect: string;
  feedbackWrong: string;
  reminderText: string;
  reminderSegmentId: string;
}

export interface Story {
  id: string;
  title: string;
  coverEmoji: string;
  coverGradient: string;
  tagline: string;
  ageRange: string;
  readingTime: string;
  difficulty: 'beginner' | 'explorer' | 'advanced';
  category: string;
  segments: StorySegment[];
  quizzes: QuizQuestion[];
  moral: string;
  pointsReward: number;
  requiredLevel: number;
}

export interface UserProgress {
  totalPoints: number;
  completedStories: string[];
  storyProgress: Record<string, StoryProgressData>;
  createdStoriesCount: number;
}

export interface StoryProgressData {
  currentSegmentIndex: number;
  quizzesCompleted: string[];
  completed: boolean;
  lastMode: 'audio' | 'video' | 'read';
}

export interface Level {
  level: number;
  name: string;
  emoji: string;
  minPoints: number;
  maxPoints: number;
  color: string;
}

export interface CommunityStory {
  id: string;
  title: string;
  text: string;
  coverEmoji: string;
  coverGradient: string;
  authorName: string;
  authorLevel: number;
  authorLevelName: string;
  authorLevelEmoji: string;
  publishedAt: string;
  readCount: number;
  requiredLevel: number;
  ageRange: string;
}
