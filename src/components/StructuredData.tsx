'use client';

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "http://indoquran.web.id/",
          "name": "Al-Quran Indonesia",
          "description": "Baca Al-Quran online lengkap dengan terjemahan Bahasa Indonesia, tafsir, audio murottal.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "http://indoquran.web.id/?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        })
      }}
    />
  );
}
