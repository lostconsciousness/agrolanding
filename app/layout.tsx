import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://core-agro-ai.prime-joy-8793.chatgpt.site'),
  title: 'CORE AGRO — AI-асистент агропідприємства',
  description: 'Продажі, техніка, команда, фінансування й гранти — в одному AI-асистенті.',
  openGraph: {
    title: 'CORE AGRO — AI для сильного господарства',
    description: 'Продажі. Техніка. Команда. Фінансування.',
    images: [{ url: '/og.png', width: 1730, height: 909, alt: 'CORE AGRO — AI для сильного господарства' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CORE AGRO — AI для сильного господарства',
    description: 'Продажі. Техніка. Команда. Фінансування.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
