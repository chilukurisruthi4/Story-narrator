import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Pip, a friendly creative writing helper for children aged 5-12. Help them write fun, imaginative stories. Keep responses short (2-4 sentences max), encouraging, and use simple language. Ask one guiding question at a time to help them develop their story. Use emojis to make your responses fun and engaging! Be enthusiastic and supportive. Never write long paragraphs. Focus on helping the child think about their story, not writing it for them.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, storyContext }: { messages: Message[]; storyContext?: string } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const systemPromptWithContext = storyContext
      ? `${SYSTEM_PROMPT}\n\nHere is what the child has written so far:\n"${storyContext}"\n\nUse this context when giving suggestions.`
      : SYSTEM_PROMPT;

    // Filter to only user and assistant messages for the API
    const validMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .filter((m) => m.content && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    if (validMessages.length === 0) {
      return NextResponse.json({ error: 'No valid messages' }, { status: 400 });
    }

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: systemPromptWithContext,
      messages: validMessages,
    });

    // Return a streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ delta: { text: event.delta.text } });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
