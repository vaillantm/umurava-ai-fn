import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ToastHost } from '@/components/toast-host';

export const metadata: Metadata = {
  title: 'Umurava AI — Recruiter Portal',
  description: 'Umurava AI recruiter portal'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastHost />
        {children}
      </body>
    </html>
  );
}
