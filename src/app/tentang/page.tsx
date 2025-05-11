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
          <h1 className="text-3xl font-bold text-amber-900 mb-6 flex items-center">
            <img src="/icons/tentang-icon.svg" alt="Tentang" className="w-8 h-8 mr-3" />
            Tentang Al-Quran Indonesia
          </h1>
          
          <div className="border-b border-amber-200 mb-6">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('tentang')}
                className={`px-4 py-2 font-medium rounded-t-lg flex items-center ${
                  activeTab === 'tentang' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Tentang Aplikasi
              </button>
              <button
                onClick={() => setActiveTab('fitur')}
                className={`px-4 py-2 font-medium rounded-t-lg flex items-center ${
                  activeTab === 'fitur' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Fitur Utama
              </button>
              <button
                onClick={() => setActiveTab('pengembangan')}
                className={`px-4 py-2 font-medium rounded-t-lg flex items-center ${
                  activeTab === 'pengembangan' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
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
                    Tampilan dioptimalkan untuk kemudahan navigasi dan pencarian surah tertentu dengan desain yang responsif 
                    dan nyaman diakses dari berbagai perangkat.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">2. Jadwal Waktu Sholat</h3>
                  <p className="text-amber-800">
                    Fitur jadwal waktu sholat terintegrasi yang dapat secara otomatis mendeteksi lokasi pengguna atau 
                    menggunakan lokasi default (Jakarta Pusat). Menampilkan waktu sholat harian dengan notifikasi pengingat 
                    dan memungkinkan pengguna untuk melihat waktu sholat berikutnya dengan mudah.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">3. Pencarian Terjemahan</h3>
                  <p className="text-amber-800">
                    Fitur pencarian terjemahan yang canggih memungkinkan pengguna untuk mencari kata, frasa, atau tema tertentu 
                    dalam terjemahan Al-Quran. Hasil pencarian ditampilkan dengan highlight pada kata kunci 
                    untuk identifikasi cepat dan tepat.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">4. Tampilan Ayat yang Optimal</h3>
                  <p className="text-amber-800">
                    Setiap ayat ditampilkan dengan format yang mudah dibaca, meliputi teks Arab dengan font Uthmani yang jelas, 
                    teks Latin (transliterasi), dan terjemahan Bahasa Indonesia yang akurat. Tersedia juga pengaturan ukuran teks 
                    Arab untuk kenyamanan membaca sesuai kebutuhan pengguna.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">5. Tafsir Komprehensif</h3>
                  <p className="text-amber-800">
                    Tafsir lengkap untuk setiap ayat tersedia untuk memperdalam pemahaman kontekstual dan makna. 
                    Pengguna dapat dengan mudah menampilkan atau menyembunyikan tafsir sesuai kebutuhan, 
                    dengan antarmuka yang intuitif dan responsif.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">6. Audio Murattal Berkualitas</h3>
                  <p className="text-amber-800">
                    Audio murattal berkualitas tinggi dari 5+ qari ternama tersedia untuk setiap surah dan ayat. 
                    Pengguna dapat memilih qari favorit mereka dan mendengarkan bacaan dengan kontrol pemutaran 
                    yang nyaman dan intuitif.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">7. Fitur Personalisasi</h3>
                  <p className="text-amber-800">
                    Pengguna dapat membuat bookmark, menandai ayat favorit, dan membuat catatan pribadi untuk ayat tertentu. 
                    Aplikasi juga mengingat posisi terakhir membaca dan menyediakan mode tampilan gelap (dark mode) 
                    untuk kenyamanan membaca di berbagai kondisi pencahayaan.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">8. Berbagi dan Interaktivitas</h3>
                  <p className="text-amber-800">
                    Fitur berbagi ayat memudahkan pengguna untuk membagikan ayat tertentu melalui berbagai platform media sosial 
                    beserta terjemahan dan tautan yang dapat dibuka. Aplikasi juga mendukung navigasi yang mudah dengan 
                    pagination untuk surah panjang dan fitur "jump to ayat".
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'pengembangan' && (
              <div className="animate-fadeIn">
                <h2>Pengembangan Aplikasi</h2>
                
                <p>
                  Al-Quran Indonesia dikembangkan menggunakan teknologi web modern untuk memastikan performa, 
                  keamanan, dan pengalaman pengguna yang optimal. Aplikasi ini didesain dengan pendekatan mobile-first
                  dan mengutamakan kecepatan akses serta keterbacaan konten. Beberapa teknologi yang digunakan antara lain:
                </p>
                
                <ul>
                  <li><strong>Next.js 15</strong> - Framework React terbaru untuk rendering sisi server, streaming, dan pembuatan aplikasi web yang cepat dan responsif</li>
                  <li><strong>TypeScript</strong> - Untuk keamanan tipe, integritas kode, dan pemeliharaan yang lebih baik</li>
                  <li><strong>TailwindCSS</strong> - Framework CSS modern untuk styling yang konsisten, responsif, dan efisien</li>
                  <li><strong>React Query</strong> - Manajemen state dan data fetching dengan caching yang optimal</li>
                  <li><strong>PWA Support</strong> - Mendukung Progressive Web App untuk pengalaman seperti aplikasi native dan akses offline</li>
                </ul>
                
                <h3 className="mt-6">Roadmap Pengembangan</h3>
                <p>
                  Kami secara aktif mengembangkan Al-Quran Indonesia dengan menambahkan fitur-fitur baru dan menyempurnakan
                  fitur yang sudah ada. Berikut adalah fitur yang telah diimplementasikan dan yang sedang dalam pengembangan:
                </p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-amber-800">Fitur yang Sudah Diimplementasikan:</h4>
                  <ol className="list-decimal pl-5 mt-2">
                    <li><span className="line-through text-amber-600">Fitur bookmark dan favorit ayat</span> ✓</li>
                    <li><span className="line-through text-amber-600">Mode gelap (dark mode)</span> ✓</li>
                    <li><span className="line-through text-amber-600">Lebih banyak pilihan qari untuk audio murattal</span> ✓</li>
                    <li><span className="line-through text-amber-600">Fitur catatan pribadi untuk ayat-ayat tertentu</span> ✓</li>
                    <li><span className="line-through text-amber-600">Jadwal waktu sholat terintegrasi dengan deteksi lokasi</span> ✓</li>
                    <li><span className="line-through text-amber-600">Notifikasi pengingat waktu sholat</span> ✓</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium text-amber-800">Fitur yang Sedang Dikembangkan:</h4>
                  <ol className="list-decimal pl-5 mt-2">
                    <li>Kaligrafi dan visualisasi ayat Al-Quran yang interaktif</li>
                    <li>Pencarian lanjutan dengan filter berdasarkan tema, juz, dan kategori</li>
                    <li>Lebih banyak integrasi dengan media sosial untuk berbagi ayat</li>
                    <li>Mode pembelajaran Al-Quran dengan pelacakan kemajuan</li>
                    <li>Peningkatan fitur offline dengan sinkronisasi data yang lebih baik</li>
                  </ol>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r">
                  <p className="text-green-800 font-medium">Update Terbaru - Mei 2025</p>
                  <p className="text-green-700 mt-1">
                    Kami telah berhasil mengimplementasikan fitur jadwal waktu sholat dengan deteksi lokasi otomatis
                    dan kemampuan untuk mengatur notifikasi. Fitur ini dapat diakses dari halaman utama dan menyediakan
                    waktu sholat yang akurat berdasarkan lokasi pengguna.
                  </p>
                </div>
                
                <h3 className="mt-6">Kontribusi</h3>
                <p>
                  Al-Quran Indonesia adalah proyek open source yang menerima kontribusi dari komunitas pengembang. 
                  Kontribusi dapat berupa pelaporan bug, saran fitur, dokumentasi, atau pengembangan kode.
                  Kami juga mengundang pengujian UX dan feedback dari pengguna untuk terus meningkatkan pengalaman pengguna.
                </p>
                
                <h3 className="mt-6">Kontak dan Dukungan</h3>
                <p>
                  Jika Anda memiliki pertanyaan, saran, atau menemukan masalah dalam aplikasi, 
                  silakan hubungi kami melalui:
                </p>
                <ul>
                  <li>Email: <a href="mailto:contact@indoquran.id" className="text-amber-700 hover:underline">contact@indoquran.id</a></li>
                  <li>Github: <a href="https://github.com/indoquran-web" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">github.com/indoquran-web</a></li>
                  <li>Formulir Kontak: <Link href="/kontak" className="text-amber-700 hover:underline">Halaman Kontak</Link></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}