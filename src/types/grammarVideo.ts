export interface GrammarVideoFrame {
  id: string;
  duration: number;           // seconds to display this frame
  background: string;         // Tailwind gradient bg classes
  sceneEmoji: string;         // large central scene/character emoji
  ambientEmojis?: string[];   // floating decorative emojis
  caption: string;            // explanation text shown below
  highlightWord?: string;     // word to highlight in the caption
  speechBubble?: string;      // speech bubble text (shown above scene)
  exampleSentence?: string;   // full sentence shown at bottom
  exampleHighlight?: string;  // word to highlight in example sentence
  subCaption?: string;        // smaller secondary text
}

export interface GrammarVideoData {
  topicId: string;
  title: string;
  frames: GrammarVideoFrame[];
}
