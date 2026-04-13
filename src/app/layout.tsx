import type { Metadata } from 'next';
import './globals.css';
import { ProgressProvider } from '@/context/ProgressContext';

export const metadata: Metadata = {
  title: 'StoryLand - Magical Stories for Kids',
  description:
    'A magical world of stories where kids can listen, watch, read, and even create their own tales! Develop listening, memory, and literature skills with fun quizzes and rewards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-nunito bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
