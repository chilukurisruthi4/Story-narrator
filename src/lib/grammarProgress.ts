const STORAGE_PREFIX = 'storyland_grammar_';

export function getTopicProgress(topicId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${topicId}`);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markExerciseComplete(topicId: string, exerciseId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getTopicProgress(topicId);
    if (!current.includes(exerciseId)) {
      const updated = [...current, exerciseId];
      localStorage.setItem(`${STORAGE_PREFIX}${topicId}`, JSON.stringify(updated));
    }
  } catch {
    // Storage might be full or unavailable
  }
}

export function getTopicCompletedCount(topicId: string): number {
  return getTopicProgress(topicId).length;
}

export function resetTopicProgress(topicId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${topicId}`);
  } catch {
    // Storage might be full or unavailable
  }
}
