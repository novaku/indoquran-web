'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'tentang' | 'fitur' | 'pengembangan'>('tentang');

  return (
    <div className="max-w-4xl mx-auto">
      <Helmet>
        <title>Tentang Al-Quran | Al-Quran Indonesia</title>
        <meta name="description" content="Informasi tentang Al-Quran, sejarah, dan petunjuk penggunaan aplikasi Al-Quran Indonesia." />
        <meta name="keywords" content="tentang al-quran, sejarah quran, aplikasi quran, baca quran online, al-quran indonesia" />
        <link rel="canonical" href="http://indoquran.web.id/tentang" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "Tentang Al-Quran | Al-Quran Indonesia",
              "description": "Informasi tentang Al-Quran, sejarah, dan petunjuk penggunaan aplikasi Al-Quran Indonesia.",
              "author": {
                "@type": "Organization",
                "name": "Al-Quran Indonesia"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Al-Quran Indonesia",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://indoquran.web.app/icons/icon-192x192.png"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "http://indoquran.web.id/tentang"
              },
              "image": "http://indoquran.web.id/icons/og-image.svg"
            }
          `}
        </script>
      </Helmet>
      <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Kembali ke Beranda
      </Link>
      
      <div className="bg-white rounded-xl overflow-hidden border border-amber-200 shadow-lg mb-8">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-6">Tentang Al-Quran Indonesia</h1>
          
          <div className="border-b border-amber-200 mb-6">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('tentang')}
                className={`px-4 py-2 font-medium rounded-t-lg ${
                  activeTab === 'tentang' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                Tentang Aplikasi
              </button>
              <button
                onClick={() => setActiveTab('fitur')}
                className={`px-4 py-2 font-medium rounded-t-lg ${
                  activeTab === 'fitur' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                Fitur Utama
              </button>
              <button
                onClick={() => setActiveTab('pengembangan')}
                className={`px-4 py-2 font-medium rounded-t-lg ${
                  activeTab === 'pengembangan' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                Pengembangan
              </button>
            </nav>
          </div>
          
          <div className="prose prose-amber max-w-none">
            {activeTab === 'tentang' && (
              <div className="animate-fadeIn">
                <h2>Latar Belakang</h2>
                <p>
                  <strong>Al-Quran Indonesia</strong> adalah aplikasi web yang dikembangkan untuk memudahkan 
                  Muslim Indonesia dalam membaca, memahami, dan mempelajari Al-Quran. Aplikasi ini hadir 
                  untuk mengatasi beberapa kendala dalam membaca Al-Quran digital, seperti kesulitan 
                  dalam mencari ayat tertentu, memahami terjemahan, dan mengakses tafsir dalam Bahasa Indonesia.
                </p>
                
                <p>
                  Misi utama kami adalah menyediakan pengalaman membaca Al-Quran yang mudah diakses, 
                  intuitif, dan diperkaya dengan fitur-fitur yang membantu pemahaman lebih mendalam 
                  terhadap kitab suci umat Islam ini.
                </p>
                
                <h2>Tujuan</h2>
                <p>
                  Al-Quran Indonesia bertujuan untuk:
                </p>
                <ul>
                  <li>Memudahkan akses terhadap Al-Quran dalam format digital</li>
                  <li>Menyediakan terjemahan akurat dalam Bahasa Indonesia</li>
                  <li>Menyediakan tafsir untuk memperdalam pemahaman</li>
                  <li>Menghadirkan fitur pencarian terjemahan untuk memudahkan pencarian kata atau tema tertentu</li>
                  <li>Menyediakan audio murattal dari qari ternama untuk membantu dalam mempelajari bacaan</li>
                </ul>
                
                <h2>Permasalahan yang Diselesaikan</h2>
                <p>
                  Aplikasi ini menyelesaikan beberapa permasalahan umum yang dihadapi pengguna dalam membaca Al-Quran digital:
                </p>
                <ol>
                  <li><strong>Aksesibilitas</strong> - Dapat diakses dari perangkat apa saja dengan koneksi internet</li>
                  <li><strong>Pencarian</strong> - Pencarian terjemahan yang cepat dan akurat untuk menemukan ayat tentang tema tertentu</li>
                  <li><strong>Pemahaman</strong> - Tafsir dalam Bahasa Indonesia untuk memahami konteks dan makna mendalam dari ayat</li>
                  <li><strong>Navigasi</strong> - Navigasi antar surah dan ayat yang mudah dan intuitif</li>
                  <li><strong>Audio</strong> - Dukungan audio murattal dari berbagai qari ternama</li>
                </ol>
              </div>
            )}
            
            {activeTab === 'fitur' && (
              <div className="animate-fadeIn">
                <h2>Fitur Utama</h2>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">1. Daftar Surah yang Lengkap</h3>
                  <p className="text-amber-800">
                    Memuat 114 surah Al-Quran lengkap dengan informasi nama, arti, jumlah ayat, dan tempat turun. 
                    Tampilan dioptimalkan untuk kemudahan navigasi dan pencarian surah tertentu.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">2. Pencarian Terjemahan</h3>
                  <p className="text-amber-800">
                    Fitur pencarian terjemahan memungkinkan pengguna untuk mencari kata, frasa, atau tema tertentu 
                    dalam terjemahan Al-Quran. Hasil pencarian ditampilkan dengan highlight pada kata kunci 
                    sehingga memudahkan identifikasi.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">3. Tampilan Ayat yang Optimal</h3>
                  <p className="text-amber-800">
                    Setiap ayat ditampilkan dengan format yang mudah dibaca, meliputi teks Arab, teks Latin (transliterasi), 
                    dan terjemahan Bahasa Indonesia. Tersedia juga pengaturan ukuran teks Arab untuk kenyamanan membaca.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">4. Tafsir</h3>
                  <p className="text-amber-800">
                    Tafsir untuk setiap ayat tersedia untuk memperdalam pemahaman. Pengguna dapat dengan mudah 
                    menampilkan atau menyembunyikan tafsir sesuai kebutuhan.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">5. Audio Murattal</h3>
                  <p className="text-amber-800">
                    Audio murattal dari 5 qari ternama tersedia untuk setiap surah dan ayat. Pengguna dapat memilih 
                    qari favorit mereka untuk didengarkan.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">6. Pagination untuk Surah Panjang</h3>
                  <p className="text-amber-800">
                    Surah dengan jumlah ayat banyak ditampilkan dengan pagination untuk memudahkan navigasi dan 
                    meningkatkan kinerja aplikasi. Tersedia juga fitur "jump to ayat" untuk langsung menuju ayat tertentu.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">7. Berbagi Ayat</h3>
                  <p className="text-amber-800">
                    Fitur berbagi ayat memudahkan pengguna untuk membagikan ayat tertentu melalui WhatsApp 
                    beserta terjemahan dan tautan yang dapat dibuka.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'pengembangan' && (
              <div className="animate-fadeIn">
                <h2>Pengembangan Aplikasi</h2>
                
                <p>
                  Al-Quran Indonesia dikembangkan menggunakan teknologi web modern untuk memastikan performa, 
                  keamanan, dan pengalaman pengguna yang optimal. Beberapa teknologi yang digunakan antara lain:
                </p>
                
                <ul>
                  <li><strong>Next.js</strong> - Framework React untuk rendering sisi server dan pembuatan aplikasi web yang cepat</li>
                  <li><strong>TypeScript</strong> - Untuk keamanan tipe dan kode yang lebih mudah dipelihara</li>
                  <li><strong>TailwindCSS</strong> - Framework CSS untuk styling yang konsisten dan responsif</li>
                  <li><strong>React Query</strong> - Manajemen state dan data fetching</li>
                </ul>
                
                <h3 className="mt-6">Roadmap Pengembangan</h3>
                <p>
                  Ke depannya, kami berencana untuk menambahkan beberapa fitur baru untuk meningkatkan 
                  pengalaman pengguna Al-Quran Indonesia:
                </p>
                
                <ol>
                  <li>Fitur bookmark dan favorit ayat</li>
                  <li>Mode gelap (dark mode)</li>
                  <li>Lebih banyak pilihan qari untuk audio murattal</li>
                  <li>Fitur catatan pribadi untuk ayat-ayat tertentu</li>
                  <li>Jadwal waktu sholat terintegrasi</li>
                  <li>Kaligrafi dan visualisasi ayat Al-Quran</li>
                </ol>
                
                <h3 className="mt-6">Kontribusi</h3>
                <p>
                  Al-Quran Indonesia adalah proyek open source yang menerima kontribusi dari pengembang yang tertarik. 
                  Kontribusi dapat berupa pelaporan bug, saran fitur, atau pengembangan kode.
                </p>
                
                <h3 className="mt-6">Kontak dan Dukungan</h3>
                <p>
                  Jika Anda memiliki pertanyaan, saran, atau menemukan masalah dalam aplikasi, 
                  silakan hubungi kami melalui:
                </p>
                <ul>
                  <li>Email: contact@indoquran.id</li>
                  <li>Github: github.com/indoquran-web</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}