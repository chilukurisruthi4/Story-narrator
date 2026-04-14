import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Gram the Grammar Wizard 🧙, a friendly magical teacher who explains English grammar to children aged 5-12. Use simple words, fun examples, and short sentences. Always use encouraging language. Keep responses under 100 words. Use emojis occasionally. When explaining grammar, always give a simple example.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context }: { question: string; context?: string } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPromptWithContext = context
      ? `${SYSTEM_PROMPT}\n\nContext: ${context}`
      : SYSTEM_PROMPT;

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: systemPromptWithContext,
      messages: [
        {
          role: 'user',
          content: question.trim(),
        },
      ],
    });

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
    console.error('Grammar help API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
