import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from './providers';
import { Inter, Noto_Naskh_Arabic, Amiri } from 'next/font/google';
import { TopFooter } from '../components/TopFooter';
import StructuredData from '../components/StructuredData';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

const arabic = Noto_Naskh_Arabic({ 
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
  preload: true,
});

const amiri = Amiri({ 
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('http://indoquran.web.id'),
  title: 'Al-Quran Indonesia | Baca Al-Quran Online dengan Terjemahan & Tafsir',
  description: 'Baca Al-Quran online lengkap dengan terjemahan Bahasa Indonesia, tafsir, audio murottal. Tersedia 114 surah dengan navigasi mudah dan fitur pencarian ayat.',
  keywords: 'al quran, quran online, baca quran, al-quran indonesia, terjemahan quran, tafsir quran, quran digital, murottal quran, surah al-fatihah, ayat kursi, yasin',
  openGraph: {
    title: 'Al-Quran Indonesia | Baca Al-Quran Online dengan Terjemahan & Tafsir',
    description: 'Baca Al-Quran online lengkap dengan terjemahan Bahasa Indonesia, tafsir, audio murottal. Mudah digunakan dan gratis.',
    siteName: 'Al-Quran Indonesia',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/icons/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Al-Quran Indonesia',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al-Quran Indonesia | Baca Al-Quran Online',
    description: 'Baca Al-Quran online lengkap dengan terjemahan dan tafsir Bahasa Indonesia',
    images: ['/icons/og-image.svg'],
  },
  alternates: {
    canonical: 'http://indoquran.web.id',
    languages: {
      'id-ID': 'http://indoquran.web.id',
      'en-US': 'http://indoquran.web.id/en',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} ${arabic.variable} ${amiri.variable}`}>
        <Providers>
          <main className="w-full mx-auto px-4 py-8 pb-20 bg-gradient-to-b from-amber-50 to-white min-h-screen">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-amber-900 mb-2">Al-Quran Indonesia</h1>
              <p className="text-amber-700">Baca Al-Quran dengan Terjemahan dan Tafsir Bahasa Indonesia</p>
            </header>
            {children}
          </main>
          <TopFooter />
          <StructuredData />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
