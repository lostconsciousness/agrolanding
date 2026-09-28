import type { Metadata, Viewport } from 'next';
import { PwaProvider } from '@/components/pwa-install';
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
  metadataBase: new URL('https://core-agro.com'),
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'CORE AGRO', statusBarStyle: 'default' },
  title: 'CORE AGRO — AI-асистент агропідприємства',
  description: 'Продажі, техніка, команда, фінансування й гранти — в одному AI-асистенті.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' }],
    shortcut: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
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

export const viewport: Viewport = { themeColor: '#061009' };

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
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}
