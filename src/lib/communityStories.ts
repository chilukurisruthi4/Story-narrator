import type { CommunityStory } from '@/types';
import { getLevelFromPoints } from './levels';

const STORAGE_KEY = 'storyland_community';
const AUTHOR_POINTS_KEY = 'storyland_author_points';

const COVER_GRADIENTS = [
  'from-pink-400 to-rose-300',
  'from-violet-400 to-purple-300',
  'from-blue-400 to-cyan-300',
  'from-green-400 to-emerald-300',
  'from-orange-400 to-amber-300',
  'from-red-400 to-pink-300',
  'from-teal-400 to-green-300',
  'from-indigo-400 to-blue-300',
];

const COVER_EMOJIS = ['🌟', '🦋', '🐉', '🧙', '🦄', '🚀', '🌈', '🏰', '🌊', '🦊'];

// Pre-seeded community stories for demo
const SEED_STORIES: CommunityStory[] = [
  {
    id: 'community-seed-1',
    title: 'The Little Robot Who Learned to Dance',
    text: `Once upon a time, there was a little robot named Bolt. Bolt lived in a big factory where all the other robots worked very hard making things all day long.

Bolt was different from the other robots. Instead of making things, Bolt loved music! Every time a machine made a rhythmic sound — clank, clank, clank — Bolt would wiggle and move along to the beat.

"Robots don't dance," said the big robots. "We work!"

But one day, the factory had a big problem. A giant machine got stuck and made a terrible noise. All the robots tried to fix it, but nothing worked.

Then Bolt had an idea! Bolt started dancing around the machine — tap, spin, jump! The vibrations from Bolt's dancing shook the machine loose, and it started working again!

After that, all the robots learned that being different is not bad at all. Sometimes it's exactly what the world needs! And every Friday, the whole factory would dance together before starting work.

The end! 🤖💃`,
    coverEmoji: '🤖',
    coverGradient: 'from-blue-400 to-cyan-300',
    authorName: 'TechKid_Maya',
    authorLevel: 3,
    authorLevelName: 'Story Explorer',
    authorLevelEmoji: '🗺️',
    publishedAt: '2026-04-10T10:00:00Z',
    readCount: 47,
    requiredLevel: 2,
    ageRange: '5-9',
  },
  {
    id: 'community-seed-2',
    title: 'The Cloud Who Was Afraid of Rain',
    text: `High up in the sky lived a fluffy white cloud named Nimbus. Nimbus had one big problem — he was terrified of making rain!

"What if the rain gets in someone's eyes?" worried Nimbus. "What if it spoils a picnic? What if everyone gets wet and angry?"

So Nimbus held all his rain inside, growing bigger and bigger and heavier and heavier. He turned grey and then dark grey. The other clouds watched him worriedly.

"Nimbus, you must let go," said his friend Cirra gently. "Rain is not something to be afraid of. It's a gift!"

"But what if nobody wants it?" asked Nimbus.

Just then, they floated over a dry, brown garden. The flowers below had droopy petals. A little girl was watering them with a tiny can, working so hard.

Nimbus looked at the thirsty flowers and the tired little girl. Something in him changed. He took a deep breath and... let go.

The rain fell softly. The flowers lifted their heads. The little girl laughed and spun around with her arms open wide, letting the rain fall on her face.

"Thank you, cloud!" she called up happily.

Nimbus smiled. His rain wasn't a problem at all. It was exactly what was needed. 🌧️🌸`,
    coverEmoji: '☁️',
    coverGradient: 'from-sky-400 to-blue-300',
    authorName: 'DreamWriter_Priya',
    authorLevel: 4,
    authorLevelName: 'Word Wizard',
    authorLevelEmoji: '✨',
    publishedAt: '2026-04-11T14:30:00Z',
    readCount: 63,
    requiredLevel: 2,
    ageRange: '4-8',
  },
  {
    id: 'community-seed-3',
    title: 'The Dragon Who Collected Hugs',
    text: `Everyone in the village was afraid of Ember the dragon. She was enormous, with red scales and huge wings. When she flew overhead, people ran inside and locked their doors.

But Ember wasn't scary at all. She was lonely.

Every morning, she would watch the village children play and laugh and hug each other. More than anything in the whole world, Ember wanted a hug.

One rainy day, a small boy named Leo got lost in the forest near Ember's cave. He was cold and scared, and he started to cry.

Ember found him there. She knew the boy would be frightened of her, but she couldn't leave him alone. Very slowly, she curved her great wing around him like a tent, blocking the cold rain.

Leo looked up at the dragon's kind eyes. He saw she was just trying to help.

"Thank you," he whispered. Then, very bravely, he wrapped his arms around her scaly leg.

Ember froze. Then she felt something warm spread from her leg all the way to her heart.

A hug. Her first ever hug.

Leo told everyone what Ember had done. One by one, the villagers came to meet her. And Ember's collection of hugs grew and grew, until she was the happiest dragon in the whole land. 🐉💛`,
    coverEmoji: '🐉',
    coverGradient: 'from-orange-400 to-red-300',
    authorName: 'StoryMaster_Arjun',
    authorLevel: 5,
    authorLevelName: 'Master Storyteller',
    authorLevelEmoji: '👑',
    publishedAt: '2026-04-12T09:15:00Z',
    readCount: 112,
    requiredLevel: 2,
    ageRange: '5-10',
  },
];

export function getCommunityStories(): CommunityStory[] {
  if (typeof window === 'undefined') return SEED_STORIES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const userStories: CommunityStory[] = stored ? JSON.parse(stored) : [];
    // Merge seed stories with user-published stories (user stories first)
    const seedIds = new Set(SEED_STORIES.map((s) => s.id));
    const filtered = userStories.filter((s) => !seedIds.has(s.id));
    return [...filtered, ...SEED_STORIES];
  } catch {
    return SEED_STORIES;
  }
}

export function publishStory(
  title: string,
  text: string,
  authorName: string,
  totalPoints: number
): CommunityStory {
  const authorLevel = getLevelFromPoints(totalPoints);
  const randomEmoji = COVER_EMOJIS[Math.floor(Math.random() * COVER_EMOJIS.length)];
  const randomGradient = COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)];

  const newStory: CommunityStory = {
    id: `community-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    text,
    coverEmoji: randomEmoji,
    coverGradient: randomGradient,
    authorName,
    authorLevel: authorLevel.level,
    authorLevelName: authorLevel.name,
    authorLevelEmoji: authorLevel.emoji,
    publishedAt: new Date().toISOString(),
    readCount: 0,
    requiredLevel: 2,
    ageRange: '5-10',
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existing: CommunityStory[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newStory, ...existing]));
    } catch {
      // Storage full
    }
  }

  return newStory;
}

export function recordStoryRead(storyId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const stories: CommunityStory[] = stored ? JSON.parse(stored) : [];
    const updated = stories.map((s) =>
      s.id === storyId ? { ...s, readCount: s.readCount + 1 } : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Track which stories this user has read (to avoid double-counting)
    const readKey = `storyland_read_${storyId}`;
    if (!localStorage.getItem(readKey)) {
      localStorage.setItem(readKey, '1');
      // Award the author bonus points (simulated — stored locally)
      const authorKey = `${AUTHOR_POINTS_KEY}_${storyId}`;
      const existing = parseInt(localStorage.getItem(authorKey) ?? '0', 10);
      localStorage.setItem(authorKey, String(existing + 10));
    }
  } catch {
    // ignore
  }
}

export function getAuthorBonusPoints(storyId: string): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(`${AUTHOR_POINTS_KEY}_${storyId}`) ?? '0', 10);
}
