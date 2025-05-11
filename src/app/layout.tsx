import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from './providers';
import { Inter, Noto_Naskh_Arabic, Amiri } from 'next/font/google';
import StructuredData from '../components/StructuredData';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookThemeProvider from '@/components/BookThemeProvider';
import ConnectivityStatus from '@/components/ConnectivityStatus';
import OfflineDataSync from '@/components/OfflineDataSync';
import React from 'react';

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
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

// Removed inline Footer component as we now use the imported one

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97706" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IndoQuran" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#1f2937');
                }
              } catch (e) {}
            })()
          `
        }} />
      </head>
      <body className={`${inter.className} ${arabic.variable} ${amiri.variable}`}>
        <Providers>
          <BookThemeProvider>
            <Header />
            <main className="w-full mx-auto px-4 py-8 pb-24 bg-gradient-to-b from-amber-50 to-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 min-h-screen">
              <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-amber-900 mb-2">Al-Quran Indonesia</h1>
                <p className="text-amber-700">Baca Al-Quran dengan Terjemahan dan Tafsir Bahasa Indonesia</p>
              </header>
              {children}
            </main>
            <Footer />
            <StructuredData />
            <ServiceWorkerRegistration />
            <PWAInstallPrompt />
            <ConnectivityStatus />
            <OfflineDataSync />
          </BookThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
