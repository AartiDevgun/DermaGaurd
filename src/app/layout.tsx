import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
