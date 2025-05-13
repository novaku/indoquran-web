'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import LazyLoadImage from '@/components/LazyLoadImage';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'tentang' | 'fitur' | 'pengembangan' | 'perubahan'>('tentang');

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
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
            <LazyLoadImage src="/icons/tentang-icon.svg" alt="Tentang" width={32} height={32} className="w-8 h-8 mr-3" />
            Tentang Al-Quran Indonesia
          </h1>
          
          <div className="border-b border-amber-200 mb-6">
            <nav className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('tentang')}
                className={`px-3 py-2 font-medium rounded-t-lg flex items-center ${
                  activeTab === 'tentang' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Tentang Kami
              </button>
              <button
                onClick={() => setActiveTab('fitur')}
                className={`px-3 py-2 font-medium rounded-t-lg flex items-center ${
                  activeTab === 'fitur' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Fitur
              </button>
              <button
                onClick={() => setActiveTab('pengembangan')}
                className={`px-3 py-2 font-medium rounded-t-lg flex items-center ${
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
              <button
                onClick={() => setActiveTab('perubahan')}
                className={`px-3 py-2 font-medium rounded-t-lg flex items-center ${
                  activeTab === 'perubahan' 
                    ? 'text-amber-900 border-b-2 border-amber-600' 
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Pembaruan
              </button>
            </nav>
          </div>
          
          <div className="prose prose-amber max-w-none">
            {activeTab === 'tentang' && (
              <div className="animate-fadeIn">
                <h2>Latar Belakang</h2>
                <p>
                  <strong>Al-Quran Indonesia</strong> adalah aplikasi web modern yang dikembangkan untuk memudahkan 
                  Muslim Indonesia dalam membaca, memahami, dan mempelajari Al-Quran kapan saja dan di mana saja. Aplikasi ini hadir 
                  untuk mengatasi berbagai kendala dalam membaca Al-Quran digital, seperti kesulitan 
                  dalam pencarian ayat tertentu, akses terjemahan yang akurat, visualisasi yang kurang optimal,
                  dan kesulitan mengakses tafsir lengkap dalam Bahasa Indonesia.
                </p>
                
                <p>
                  Misi utama IndoQuran adalah menyediakan pengalaman membaca Al-Quran yang inklusif, 
                  intuitif, dan diperkaya dengan berbagai fitur yang membantu pemahaman lebih mendalam 
                  terhadap kitab suci umat Islam. Kami berkomitmen untuk terus mengembangkan aplikasi ini
                  dengan teknologi terkini dan fitur-fitur yang bermanfaat bagi pengguna.
                </p>
                
                <h2>Tujuan</h2>
                <p>
                  IndoQuran bertujuan untuk:
                </p>
                <ul>
                  <li>Menghadirkan Al-Quran digital yang mudah diakses oleh semua kalangan masyarakat</li>
                  <li>Menyediakan terjemahan akurat dan kontekstual dalam Bahasa Indonesia</li>
                  <li>Mengintegrasikan tafsir komprehensif untuk memperdalam pemahaman ayat</li>
                  <li>Menghadirkan fitur pencarian terjemahan yang cepat dan akurat untuk menemukan ayat berdasarkan kata kunci atau tema</li>
                  <li>Menyediakan audio murottal berkualitas tinggi dari qari internasional terpercaya</li>
                  <li>Memberikan pengalaman yang menyenangkan dan mudah digunakan, bahkan untuk pengguna awam</li>
                  <li>Membangun komunitas belajar Al-Quran yang inklusif dan suportif</li>
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
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">1. Daftar Surah yang Lengkap</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/surah-list.png" 
                      alt="Daftar Surah Al-Quran" 
                      width={800} 
                      height={371} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Tampilan daftar 114 surah Al-Quran dengan informasi lengkap</p>
                  <p className="text-amber-800 mb-4">
                    Memuat 114 surah Al-Quran lengkap dengan informasi nama, arti, jumlah ayat, dan tempat turun. 
                    Tampilan dioptimalkan untuk kemudahan navigasi dan pencarian surah tertentu dengan desain yang responsif 
                    dan nyaman diakses dari berbagai perangkat.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Akses cepat ke 114 surah lengkap dengan informasi detail</li>
                      <li>Pencarian surah berdasarkan nama dalam bahasa Indonesia atau Arab</li>
                      <li>Pengelompokan surah berdasarkan tempat turun (Makkiyah/Madaniyah)</li>
                      <li>Informasi jumlah ayat dan status surah yang sudah dibaca/didengarkan</li>
                      <li>Tampilan responsif yang menyesuaikan dengan ukuran layar perangkat</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">2. Jadwal Waktu Sholat</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/prayer-times.png" 
                      alt="Jadwal Waktu Sholat" 
                      width={800} 
                      height={187} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Jadwal waktu sholat dengan deteksi lokasi dan penghitungan countdown</p>
                  <p className="text-amber-800 mb-4">
                    Fitur jadwal waktu sholat terintegrasi yang dapat secara otomatis mendeteksi lokasi pengguna atau 
                    menggunakan lokasi default (Jakarta Pusat). Menampilkan waktu sholat harian dengan notifikasi pengingat 
                    dan memungkinkan pengguna untuk melihat waktu sholat berikutnya dengan mudah.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Deteksi lokasi otomatis untuk jadwal yang akurat sesuai posisi pengguna</li>
                      <li>Pilihan manual untuk lokasi dengan pencarian kota</li>
                      <li>Perhitungan countdown otomatis menuju waktu sholat berikutnya</li>
                      <li>Notifikasi pengingat yang dapat disesuaikan (5-30 menit sebelumnya)</li>
                      <li>Mode compact yang dapat diperluas untuk menghemat ruang pada layar</li>
                      <li>Penyimpanan preferensi lokasi untuk penggunaan berikutnya</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">3. Pencarian Terjemahan</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/search-translation.png" 
                      alt="Pencarian Terjemahan Al-Quran" 
                      width={800} 
                      height={460} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Hasil pencarian terjemahan dengan highlight pada kata kunci</p>
                  <p className="text-amber-800 mb-4">
                    Fitur pencarian terjemahan yang canggih memungkinkan pengguna untuk mencari kata, frasa, atau tema tertentu 
                    dalam terjemahan Al-Quran. Hasil pencarian ditampilkan dengan highlight pada kata kunci 
                    untuk identifikasi cepat dan tepat.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Pencarian cepat berdasarkan kata kunci dalam terjemahan Bahasa Indonesia</li>
                      <li>Highlight otomatis pada kata kunci dalam hasil pencarian</li>
                      <li>Filter hasil berdasarkan surah atau juz tertentu</li>
                      <li>Penyimpanan riwayat pencarian terakhir</li>
                      <li>Opsi pencarian eksak atau sebagian kata</li>
                      <li>Navigasi cepat ke ayat hasil pencarian</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">4. Tampilan Ayat yang Optimal</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/ayat-display.png" 
                      alt="Tampilan Ayat Al-Quran" 
                      width={800} 
                      height={258} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Tampilan ayat dengan teks Arab, Latin dan terjemahan yang optimal</p>
                  <p className="text-amber-800 mb-4">
                    Setiap ayat ditampilkan dengan format yang mudah dibaca, meliputi teks Arab dengan font Uthmani yang jelas, 
                    teks Latin (transliterasi), dan terjemahan Bahasa Indonesia yang akurat. Tersedia juga pengaturan ukuran teks 
                    Arab untuk kenyamanan membaca sesuai kebutuhan pengguna.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Teks Arab dengan font Uthmani berkualitas tinggi</li>
                      <li>Transliterasi Latin standar Kementerian Agama RI</li>
                      <li>Terjemahan resmi dari Kementerian Agama RI</li>
                      <li>Pengaturan ukuran teks Arab (kecil, sedang, besar)</li>
                      <li>Opsi tampilan/sembunyikan transliterasi Latin</li>
                      <li>Pengaturan jenis font yang dapat disesuaikan</li>
                      <li>Mode tampilan spasi yang optimal untuk membaca</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">5. Tafsir Komprehensif</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/tafsir-view.png" 
                      alt="Tampilan Tafsir Ayat" 
                      width={800} 
                      height={189} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Tampilan tafsir lengkap dengan penjelasan kontekstual dan asbabun nuzul</p>
                  <p className="text-amber-800 mb-4">
                    Tafsir lengkap untuk setiap ayat tersedia untuk memperdalam pemahaman kontekstual dan makna. 
                    Pengguna dapat dengan mudah menampilkan atau menyembunyikan tafsir sesuai kebutuhan, 
                    dengan antarmuka yang intuitif dan responsif.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Tafsir lengkap Kementerian Agama RI dalam Bahasa Indonesia</li>
                      <li>Informasi Asbabun Nuzul (sebab turunnya ayat) jika tersedia</li>
                      <li>Tampilan tafsir yang dapat ditampilkan/disembunyikan dengan mudah</li>
                      <li>Rujukan hadits dan keterangan terkait</li>
                      <li>Navigasi antar ayat dalam satu konteks pembahasan</li>
                      <li>Format teks yang mudah dibaca dengan section yang terorganisir</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">6. Audio Murattal Berkualitas</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/audio-player.png" 
                      alt="Audio Murattal Player" 
                      width={800} 
                      height={104} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Player audio murattal dengan pilihan qari dan kontrol pemutaran</p>
                  <p className="text-amber-800 mb-4">
                    Audio murattal berkualitas tinggi dari 5+ qari ternama tersedia untuk setiap surah dan ayat. 
                    Pengguna dapat memilih qari favorit mereka dan mendengarkan bacaan dengan kontrol pemutaran 
                    yang nyaman dan intuitif.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Audio murattal dari 8+ qari internasional ternama</li>
                      <li>Opsi pemutaran per ayat atau seluruh surah</li>
                      <li>Kontrol playback lengkap (play, pause, next, previous)</li>
                      <li>Pengaturan kecepatan pemutaran (0.75x, 1x, 1.25x, 1.5x)</li>
                      <li>Auto-scroll yang menyesuaikan dengan bacaan ayat</li>
                      <li>Mode pengulangan ayat atau rangkaian ayat</li>
                      <li>Penyimpanan pilihan qari favorit pengguna</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">7. Fitur Personalisasi</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/personalization.png" 
                      alt="Fitur Personalisasi" 
                      width={800} 
                      height={495} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Fitur bookmark, catatan pribadi dan posisi terakhir membaca</p>
                  <p className="text-amber-800 mb-4">
                    Pengguna dapat membuat bookmark, menandai ayat favorit, dan membuat catatan pribadi untuk ayat tertentu. 
                    Aplikasi juga mengingat posisi terakhir membaca untuk memberikan pengalaman yang berkesinambungan.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Bookmark ayat favorit dengan kategori yang dapat disesuaikan</li>
                      <li>Catatan pribadi untuk setiap ayat dengan editor teks lengkap</li>
                      <li>Pelacakan otomatis posisi terakhir membaca</li>
                      <li>Sinkronisasi data antar perangkat (untuk pengguna yang login)</li>
                      <li>Pengaturan preferensi tampilan yang dapat disesuaikan</li>
                      <li>Histori ayat yang telah dibaca atau didengarkan</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">8. Berbagi dan Interaktivitas</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/sharing-feature.png" 
                      alt="Fitur Berbagi Ayat" 
                      width={650} 
                      height={394} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Opsi berbagi ayat melalui berbagai platform media sosial</p>
                  <p className="text-amber-800 mb-4">
                    Fitur berbagi ayat memudahkan pengguna untuk membagikan ayat tertentu melalui berbagai platform media sosial 
                    beserta terjemahan dan tautan yang dapat dibuka. Aplikasi juga mendukung navigasi yang mudah dengan 
                    pagination untuk surah panjang dan fitur "jump to ayat".
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Berbagi ayat ke platform sosial media populer (WhatsApp, Facebook, Twitter, dll)</li>
                      <li>Opsi berbagi sebagai teks, gambar, atau link</li>
                      <li>Navigasi antar ayat dengan pagination atau scroll</li>
                      <li>Fitur "jump to ayat" untuk akses cepat ke ayat tertentu</li>
                      <li>Pengaturan tampilan kartu ayat yang dapat disesuaikan saat dibagikan</li>
                      <li>Preview kartu berbagi sebelum dikirim</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">9. Tafsir Tematik (Maudhu'i)</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/tafsir-maudhui.png" 
                      alt="Tafsir Tematik (Maudhu'i)" 
                      width={800} 
                      height={425} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Tampilan tafsir tematik dengan indeks ayat berdasarkan tema</p>
                  <p className="text-amber-800 mb-4">
                    Fitur Tafsir Tematik menyediakan kumpulan ayat-ayat Al-Quran yang berkaitan dengan tema-tema tertentu. 
                    Pengguna dapat dengan mudah menemukan dan memahami ayat-ayat yang berkaitan dengan tema spesifik seperti 
                    kesabaran, syukur, taubat, dan banyak lainnya. Fitur ini membantu pengguna untuk mempelajari Al-Quran 
                    berdasarkan topik yang diminati secara sistematis dan komprehensif.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>50+ tema tafsir yang diorganisir secara alfabetis</li>
                      <li>Pencarian cepat berdasarkan kata kunci tema</li>
                      <li>Deskripsi komprehensif untuk setiap tema</li>
                      <li>Indeks ayat yang terkait dengan setiap tema</li>
                      <li>Tautan langsung ke ayat lengkap dengan terjemahan dan tafsir</li>
                      <li>Tampilan popup ayat tanpa perlu pindah halaman</li>
                      <li>Sistem bookmark tema favorit untuk akses cepat</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-10 border-t border-amber-200 pt-6">
                  <h3 className="text-lg font-bold text-amber-900 mb-4">Informasi Footer</h3>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="mb-4 flex justify-center">
                      <LazyLoadImage 
                        src="/images/features/footer-prayer-times.png" 
                        alt="Jadwal Sholat di Footer" 
                        width={618} 
                        height={206} 
                        className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                      />
                      </div>
                      <p className="text-sm text-center mt-2 text-amber-700 italic">Jadwal sholat terintegrasi di footer pada semua halaman</p>
                    <h4 className="font-medium text-amber-800 mb-2">Jadwal Sholat dengan Deteksi Lokasi Otomatis</h4>
                    <p className="text-amber-800 mb-3">
                      Fitur jadwal sholat juga tersedia di bagian footer pada setiap halaman aplikasi untuk kemudahan akses. 
                      Fitur ini dilengkapi dengan:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-amber-800">
                      <li>Deteksi lokasi otomatis menggunakan Geolocation API untuk jadwal sholat yang akurat sesuai posisi pengguna</li>
                      <li>Opsi untuk mengatur lokasi secara manual jika pengguna tidak ingin berbagi lokasi</li>
                      <li>Penghitungan waktu sholat yang tepat dengan metode perhitungan standar internasional</li>
                      <li>Tampilan visual yang jelas untuk waktu sholat berikutnya dan perhitungan countdown otomatis</li>
                      <li>Mode compact yang dapat diperluas untuk menghemat ruang pada layar perangkat</li>
                    </ul>
                  </div>
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
                    <li><span className="line-through text-amber-600">Lebih banyak pilihan qari untuk audio murattal</span> ✓</li>
                    <li><span className="line-through text-amber-600">Fitur catatan pribadi untuk ayat-ayat tertentu</span> ✓</li>
                    <li><span className="line-through text-amber-600">Jadwal waktu sholat terintegrasi dengan deteksi lokasi</span> ✓</li>
                    <li><span className="line-through text-amber-600">Notifikasi pengingat waktu sholat</span> ✓</li>
                    <li><span className="line-through text-amber-600">Tafsir Tematik (Maudhu'i) dengan indeks ayat per tema</span> ✓</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium text-amber-800">Fitur yang Sedang Dikembangkan:</h4>
                  <ol className="list-decimal pl-5 mt-2">
                    <li>Kaligrafi dan visualisasi ayat Al-Quran yang interaktif</li>
                    <li>Pencarian lanjutan dengan filter berdasarkan tema, juz, dan kategori</li>
                    <li>Lebih banyak integrasi dengan media sosial untuk berbagi ayat</li>
                    <li>Mode pembelajaran Al-Quran dengan pelacakan kemajuan</li>
                  </ol>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r">
                  <p className="text-green-800 font-medium">Update Terbaru - Mei 2025</p>
                  <p className="text-green-700 mt-1">
                    Kami dengan gembira mengumumkan peluncuran fitur jadwal waktu sholat terintegrasi dengan deteksi lokasi otomatis
                    dan sistem pengingat yang dapat disesuaikan. Fitur ini dapat diakses langsung dari halaman utama aplikasi dan menyediakan
                    jadwal sholat yang akurat berdasarkan lokasi pengguna saat ini. 
                  </p>
                  <p className="text-green-700 mt-2">
                    Selain itu, kami juga meluncurkan fitur baru Tafsir Tematik (Maudhu'i) yang memungkinkan pengguna menemukan
                    dan mempelajari ayat-ayat Al-Quran berdasarkan tema-tema tertentu. Fitur ini mengumpulkan ayat-ayat yang berkaitan
                    dengan tema spesifik dari berbagai surah, sehingga memudahkan pengguna untuk mempelajari Al-Quran secara tematik dan komprehensif.
                    Kami juga telah menyempurnakan UX/UI aplikasi untuk memberikan pengalaman yang lebih menyenangkan.
                  </p>
                </div>
                
                <h3 className="mt-6">Kontribusi</h3>
                <p>
                  IndoQuran adalah proyek open source yang secara aktif menerima kontribusi dari komunitas pengembang. 
                  Kami menghargai berbagai bentuk kontribusi, termasuk pelaporan bug, saran fitur, perbaikan dokumentasi, terjemahan, 
                  dan pengembangan kode baru. Kami juga mengundang pengujian UX dan feedback dari pengguna 
                  untuk terus meningkatkan pengalaman membaca Al-Quran digital.
                </p>
                
                <h3 className="mt-6">Kontak dan Dukungan</h3>
                <p>
                  Jika Anda memiliki pertanyaan, saran, atau menemukan masalah dalam aplikasi, 
                  silakan hubungi kami melalui:
                </p>
                <ul>
                  <li>Email: <a href="mailto:contact@indoquran.id" className="text-amber-700 hover:underline">contact@indoquran.id</a></li>
                  <li>GitHub: <a href="https://github.com/indoquran-web" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">github.com/indoquran-web</a></li>
                  <li>Formulir Kontak: <Link href="/kontak" className="text-amber-700 hover:underline">Halaman Kontak</Link></li>
                </ul>
              </div>
            )}
            
            {activeTab === 'perubahan' && (
              <div className="animate-fadeIn">
                <h2>Riwayat Perubahan (Changelog)</h2>
                <p className="mb-6">
                  Kami berkomitmen untuk terus mengembangkan dan menyempurnakan IndoQuran. 
                  Berikut adalah riwayat perubahan dan pembaruan yang telah kami lakukan pada aplikasi:
                </p>
                
                <div className="space-y-8">
                  <div className="border-l-4 border-amber-500 pl-4 pb-1">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.5.0 (13 Mei 2025)</h3>
                    <p className="text-sm text-gray-500 mb-3">Pembaruan Utama - Fitur Jadwal Sholat & Tafsir Tematik</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Menambahkan widget jadwal waktu sholat di halaman utama</li>
                      <li>Implementasi deteksi lokasi otomatis untuk jadwal sholat yang akurat</li>
                      <li>Peluncuran fitur Tafsir Tematik (Maudhu'i) untuk pencarian ayat berdasarkan tema</li>
                      <li>Penambahan 50+ tema tafsir dengan indeks ayat yang komprehensif</li>
                      <li>Penambahan sistem notifikasi pengingat waktu sholat</li>
                      <li>Peningkatan performa pencarian ayat dengan teknologi Redis</li>
                      <li>Perbaikan bug pada bookmarking ayat dan fitur catatan</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-amber-300 pl-4 pb-1">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.4.2 (27 Maret 2025)</h3>
                    <p className="text-sm text-gray-500 mb-3">Perbaikan dan Optimasi</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Memperbaiki masalah pada penampilan tafsir ayat</li>
                      <li>Mengoptimalkan kecepatan loading audio murottal</li>
                      <li>Memperbaiki tampilan responsif pada perangkat kecil</li>
                      <li>Mengubah format penyimpanan bookmark untuk performa lebih baik</li>
                      <li>Perbaikan minor pada UI dan pengalaman pengguna</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-amber-300 pl-4 pb-1">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.4.0 (8 Februari 2025)</h3>
                    <p className="text-sm text-gray-500 mb-3">Penambahan Fitur Catatan dan Tema</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Implementasi fitur catatan pribadi untuk setiap ayat</li>
                      <li>Peningkatan antarmuka dengan tema yang dioptimalkan</li>
                      <li>Peningkatan sistem bookmark dan favorit ayat</li>
                      <li>Penambahan 3 qari baru untuk audio murottal</li>
                      <li>Peningkatan dukungan untuk aksesibilitas</li>
                      <li>Integrasi backend dengan API yang lebih cepat dan handal</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-4 pb-1">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.3.1 (15 Desember 2024)</h3>
                    <p className="text-sm text-gray-500 mb-3">Perbaikan Stabilitas</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Memperbaiki bug sinkronisasi pada fitur posisi membaca terakhir</li>
                      <li>Optimasi performa dan loading time di perangkat mobile</li>
                      <li>Perbaikan tampilan pada browser Safari dan Firefox</li>
                      <li>Peningkatan keamanan autentikasi pengguna</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-4 pb-1">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.3.0 (28 Oktober 2024)</h3>
                    <p className="text-sm text-gray-500 mb-3">Peluncuran Next.js 15</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Migrasi ke Next.js 15 untuk performa lebih baik</li>
                      <li>Implementasi fitur bookmark dan favorit ayat</li>
                      <li>Penambahan tampilan posisi membaca terakhir</li>
                      <li>Peningkatan desain UI/UX untuk semua halaman</li>
                      <li>Optimasi server-side rendering dan static generation</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-4 pb-1">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.0.0 (15 Juli 2024)</h3>
                    <p className="text-sm text-gray-500 mb-3">Peluncuran Ulang</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Desain ulang lengkap dengan antarmuka yang lebih modern</li>
                      <li>Implementasi arsitektur baru dengan Next.js dan TypeScript</li>
                      <li>Penambahan audio murottal untuk semua surah</li>
                      <li>Fitur pencarian terjemahan yang ditingkatkan</li>
                      <li>Dukungan PWA untuk penggunaan offline</li>
                      <li>Sistem autentikasi pengguna untuk fitur personalisasi</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-4 pb-1">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 1.0.0 (10 Januari 2024)</h3>
                    <p className="text-sm text-gray-500 mb-3">Peluncuran Awal</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Rilis pertama aplikasi IndoQuran</li>
                      <li>Fitur dasar membaca Al-Quran dengan terjemahan Bahasa Indonesia</li>
                      <li>Navigasi daftar surah dan ayat</li>
                      <li>Pencarian terjemahan sederhana</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}