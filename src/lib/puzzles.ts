import type { Story } from '@/types';
import type { StoryPuzzleData, ScrambleWord, FillBlankPuzzle } from '@/types/puzzle';

// Scramble a word's letters (always different from original)
function scrambleWord(word: string): string {
  if (word.length <= 2) return word.split('').reverse().join('');
  const arr = word.toLowerCase().split('');
  let scrambled = arr.slice();
  let attempts = 0;
  do {
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    attempts++;
  } while (scrambled.join('') === arr.join('') && attempts < 10);
  return scrambled.join('');
}

// Extract good words to scramble (length 4-8, only letters)
function extractScrambleWords(text: string, count = 5): ScrambleWord[] {
  const words = text
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && w.length <= 8)
    .map((w) => w.toLowerCase());

  // Deduplicate
  const unique = Array.from(new Set(words));

  // Shuffle and pick
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  return unique.slice(0, count).map((word) => ({
    scrambled: scrambleWord(word),
    answer: word,
    hint: `This word has ${word.length} letters`,
  }));
}

// Build fill-blank puzzles from story segments
function buildFillBlanks(story: Story, count = 3): FillBlankPuzzle[] {
  const puzzles: FillBlankPuzzle[] = [];

  const wrongWordPool = [
    'quickly', 'giant', 'magic', 'forest', 'happy', 'golden', 'brave',
    'castle', 'purple', 'jumping', 'wizard', 'dragon', 'sparkly', 'tiny',
  ];

  for (const segment of story.segments) {
    if (puzzles.length >= count) break;

    // Split into sentences
    const sentences = segment.text
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter((s) => s.split(/\s+/).length >= 5 && s.split(/\s+/).length <= 15);

    for (const sentence of sentences) {
      if (puzzles.length >= count) break;

      const words = sentence.split(/\s+/).filter((w) => {
        const clean = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
        return clean.length >= 4 && clean.length <= 8;
      });

      if (words.length === 0) continue;

      // Pick a word from the middle of the sentence (more interesting)
      const targetIdx = Math.floor(words.length / 2);
      const targetRaw = words[targetIdx];
      const target = targetRaw.replace(/[^a-zA-Z]/g, '').toLowerCase();

      const blankSentence = sentence.replace(
        new RegExp(`\\b${targetRaw.replace(/[^a-zA-Z]/g, '')}\\b`, 'i'),
        '___'
      );

      if (!blankSentence.includes('___')) continue;

      // Build wrong options that are different from the answer
      const wrongs = wrongWordPool
        .filter((w) => w.toLowerCase() !== target)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      const options = [target, ...wrongs].sort(() => Math.random() - 0.5);

      puzzles.push({
        sentence: blankSentence,
        answer: target,
        options,
        hint: `The missing word has ${target.length} letters`,
      });
    }
  }

  return puzzles.slice(0, count);
}

// Build story sequence puzzle from segment titles
function buildSequence(story: Story): { events: string[]; correctOrder: string[] } {
  const events = story.segments.map((s) => s.title);
  const shuffled = [...events].sort(() => Math.random() - 0.5);
  // Make sure it's actually shuffled
  if (shuffled.every((e, i) => e === events[i])) {
    // Force a swap
    const tmp = shuffled[0];
    shuffled[0] = shuffled[shuffled.length - 1];
    shuffled[shuffled.length - 1] = tmp;
  }
  return { events: shuffled, correctOrder: events };
}

export function generatePuzzlesForStory(story: Story): StoryPuzzleData[] {
  const allText = story.segments.map((s) => s.text).join(' ');

  const scrambleWords = extractScrambleWords(allText);
  const fillBlanks = buildFillBlanks(story);
  const { events, correctOrder } = buildSequence(story);

  const puzzles: StoryPuzzleData[] = [];

  if (scrambleWords.length >= 3) {
    puzzles.push({
      type: 'word-scramble',
      title: 'Word Scramble!',
      instruction: 'These words from the story got all mixed up! Can you unscramble them?',
      words: scrambleWords,
      points: 20,
    });
  }

  if (fillBlanks.length >= 2) {
    puzzles.push({
      type: 'fill-blank',
      title: 'Fill in the Blank!',
      instruction: 'A word is missing from each sentence. Pick the right word!',
      fillBlanks,
      points: 20,
    });
  }

  if (story.segments.length >= 3) {
    puzzles.push({
      type: 'story-sequence',
      title: 'Story Order!',
      instruction: "Can you put the story events in the right order? Tap them from first to last!",
      events,
      correctOrder,
      points: 15,
    });
  }

  return puzzles;
}
