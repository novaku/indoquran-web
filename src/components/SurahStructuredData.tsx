'use client';

import { Surah } from '../types/quran';

export default function SurahStructuredData({ surah }: { surah: Surah }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `Surah ${surah.namaLatin} (${surah.nama}) - ${surah.arti}`,
          "description": `Baca Surah ${surah.namaLatin} (${surah.nama}) - ${surah.arti} lengkap dengan terjemahan Bahasa Indonesia dan tafsir.`,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `http://indoquran.web.id/surah/${surah.nomor}`
          },
          "author": {
            "@type": "Organization",
            "name": "Al-Quran Indonesia"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Al-Quran Indonesia",
            "logo": {
              "@type": "ImageObject",
              "url": "http://indoquran.web.id/icons/icon-192x192.png"
            }
          },
          "image": "http://indoquran.web.id/icons/og-image.svg"
        })
      }}
    />
  );
}
