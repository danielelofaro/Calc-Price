import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import SWRegister from '@/components/SWRegister';

export const metadata: Metadata = {
  title: 'CalcoloPrezzi Pro',
  description: 'Calcola un prezzo partendo da un prezzo di listino a cui applicare sconti e/o ricarichi.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#219ebc" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <SWRegister />
      </body>
    </html>
  );
}
