import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyText, segmentTitle }: { storyText: string; segmentTitle: string } = body;

    if (!storyText || !segmentTitle) {
      return NextResponse.json(
        { error: 'storyText and segmentTitle are required' },
        { status: 400 }
      );
    }

    const prompt = `You are creating a quiz question for children aged 5-12 about a story segment they just read.

Story segment title: "${segmentTitle}"
Story text: "${storyText}"

Create 1 fun, age-appropriate multiple choice question about this story segment. The question should test memory and comprehension.

Respond with ONLY valid JSON in exactly this format:
{
  "question": "the question text here?",
  "options": ["option A", "option B", "option C"],
  "correctIndex": 0,
  "points": 20
}

Rules:
- correctIndex must be 0, 1, or 2 (which option is correct)
- Make the question fun and engaging for kids
- Keep options short and clear
- The wrong options should be plausible but clearly different from the correct answer`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const quizData = JSON.parse(jsonMatch[0]);

    // Validate
    if (
      typeof quizData.question !== 'string' ||
      !Array.isArray(quizData.options) ||
      quizData.options.length !== 3 ||
      typeof quizData.correctIndex !== 'number'
    ) {
      throw new Error('Invalid quiz data format');
    }

    return NextResponse.json({
      question: quizData.question,
      options: quizData.options,
      correctIndex: quizData.correctIndex,
      points: 20,
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz question' },
      { status: 500 }
    );
  }
}
