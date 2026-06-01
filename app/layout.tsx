import type { Metadata } from 'next';
import { Inter, Libre_Baskerville } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const serif = Libre_Baskerville({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Nexus Business Manager',
  description: 'Sistema completo para gestão de clientes, projetos e finanças empresariais.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${serif.variable}`}>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
