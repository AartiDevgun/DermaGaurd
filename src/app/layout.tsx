import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
const editorial = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'DermaGuard',
  description: 'DermaGuard image review workspace.',
  applicationName: 'DermaGuard'
};

export const viewport: Viewport = {
  themeColor: '#03030a',
  colorScheme: 'dark'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${editorial.variable}`}>
      <body>{children}</body>
    </html>
  );
}
