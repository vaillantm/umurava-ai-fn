import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Roboto, DM_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { ToastHost } from '@/components/toast-host';

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], display: 'swap', variable: '--font-roboto' });
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['300', '400', '500'], display: 'swap', variable: '--font-dm-mono' });
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], display: 'swap', variable: '--font-instrument' });

export const metadata: Metadata = {
  title: 'Umurava AI — Recruiter Portal',
  description: 'Umurava AI recruiter portal'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${roboto.variable} ${dmMono.variable} ${instrumentSerif.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          media="print"
          // @ts-ignore
          onLoad="this.media='all'"
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
        </noscript>
      </head>
      <body>
        <ToastHost />
        {children}
      </body>
    </html>
  );
}
