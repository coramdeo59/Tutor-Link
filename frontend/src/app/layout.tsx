import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Tutor-Link | Connect with Quality Tutors',
  description: 'Tutor-Link is a platform that connects students with qualified tutors for personalized learning experiences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
