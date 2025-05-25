import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from './providers';
import { Inter, Noto_Naskh_Arabic, Amiri } from 'next/font/google';
import StructuredData from '../components/StructuredData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookThemeProvider from '@/components/BookThemeProvider';
import LocationSettingsProvider from '@/components/LocationSettingsProvider';
import ClientHydrationHandler from '@/components/ClientHydrationHandler';
import React from 'react';

// Optimize Inter font loading - only load Latin subset
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

// Optimize Arabic font loading with smaller subset choices
const arabic = Noto_Naskh_Arabic({ 
  subsets: ['arabic'],
  weight: ['400', '700'], // Reduced font weights to improve loading
  variable: '--font-arabic',
  display: 'swap',
  preload: true,
});

// Keep Amiri as secondary Arabic font
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
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientHydrationHandler>
      <head className={`${inter.className} ${arabic.variable} ${amiri.variable}`}>
        <StructuredData />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f8f4e5" />
      </head>
      <body className="flex flex-col min-h-screen bg-[#f8f4e5]" suppressHydrationWarning>
        <Providers>
          <BookThemeProvider>
            <LocationSettingsProvider>
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </LocationSettingsProvider>
          </BookThemeProvider>
        </Providers>
      </body>
    </ClientHydrationHandler>
  );
}
