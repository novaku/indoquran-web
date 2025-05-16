'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import LazyLoadImage from '@/components/LazyLoadImage';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'tentang' | 'fitur' | 'pengembangan' | 'perubahan'>('tentang');

  return (
    <main className="w-full px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
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
                      clickable={true}
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
                      clickable={true}
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
                      clickable={true}
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
                      clickable={true}
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
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">5. Doa Bersama</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/prayer-share.png" 
                      alt="Fitur Doa Bersama" 
                      width={800} 
                      height={331} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                      clickable={true}
                    />
                    </div>
                    <p className="text-sm text-center mt-2 text-amber-700 italic">Platform berbagi doa dan saling mendoakan sesama muslim</p>
                  <p className="text-amber-800 mb-4">
                    Fitur Doa Bersama adalah platform komunitas yang memungkinkan pengguna untuk berbagi doa, harapan, dan permohonan dengan 
                    sesama muslim. Dibangun dengan konsep <em>silaturahmi digital</em>, fitur ini menciptakan ruang spiritual yang 
                    mengundang pengguna saling mendukung melalui doa bersama. Anggota komunitas dapat memberikan dukungan dengan mengucapkan "Amiin" 
                    atau menambahkan komentar doa untuk saling menguatkan dalam kebaikan dan keimanan.
                  </p>
                  <div className="mt-3 space-y-2 text-amber-800">
                    <h4 className="font-medium">Fitur Utama:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Sistem posting doa dengan dukungan format teks yang mudah dibaca</li>
                      <li>Mekanisme "Amiin" yang memungkinkan pengguna dengan cepat mendukung doa orang lain</li>
                      <li>Sistem komentar berjenjang untuk diskusi dan doa tambahan</li>
                      <li>Penyortiran doa berdasarkan terbaru, terpopuler, atau yang paling banyak mendapat dukungan</li>
                      <li>Opsi privasi untuk mengontrol visibilitas doa (publik/terbatas)</li>
                      <li>Notifikasi ketika seseorang mengucapkan "Amiin" atau memberikan komentar pada doa Anda</li>
                      <li>Kemampuan berbagi doa melalui platform sosial atau tautan langsung</li>
                      <li>Penanda doa yang telah terjawab atau dalam proses peninjauan</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">6. Tafsir Komprehensif</h3>
                  <div className="mb-4 flex justify-center">
                    <LazyLoadImage 
                      src="/images/features/tafsir-view.png" 
                      alt="Tampilan Tafsir Ayat" 
                      width={800} 
                      height={189} 
                      className="rounded-lg border border-amber-200 shadow-md w-full mx-auto"
                      clickable={true}
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
                      clickable={true}
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
                      clickable={true}
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
                      clickable={true}
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
                      clickable={true}
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
                        clickable={true}
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
                <h2>Teknologi dan Pengembangan</h2>
                
                <p>
                  IndoQuran dibangun dengan fondasi teknologi web terkini untuk menghadirkan pengalaman digital 
                  Al-Quran yang unggul dalam performa, keamanan, dan aksesibilitas. Dengan pendekatan "mobile-first" 
                  dan fokus pada kecepatan akses, aplikasi ini dirancang untuk memberikan pengalaman membaca yang nyaman 
                  dan keterbacaan optimal di berbagai perangkat. Arsitektur aplikasi kami didukung oleh ekosistem teknologi berikut:
                </p>
                
                <ul>
                  <li><strong>Next.js 15</strong> - Kerangka pengembangan React generasi terbaru dengan fitur Server Components, Streaming SSR, dan App Router yang mendukung rendering hybrid untuk performa optimal</li>
                  <li><strong>TypeScript</strong> - Bahasa pemrograman berskala enterprise dengan sistem tipe statis yang meningkatkan keamanan kode, memfasilitasi refaktorisasi, dan mendukung pengembangan kolaboratif</li>
                  <li><strong>TailwindCSS</strong> - Framework CSS utilitas dengan pendekatan "utility-first" yang memungkinkan desain responsif, konsistensi visual, dan bundel CSS yang dioptimalkan</li>
                  <li><strong>React Query</strong> - Pustaka manajemen status server dengan kemampuan caching cerdas, invalidasi otomatis, dan sinkronisasi data yang efisien untuk pengalaman pengguna yang responsif</li>
                  <li><strong>Redis</strong> - Solusi penyimpanan data in-memory untuk caching berkinerja tinggi, mendukung akses data yang cepat dan mengurangi beban pada database utama</li>
                </ul>
                
                <h3 className="mt-6">Peta Pengembangan</h3>
                <p>
                  Tim IndoQuran terus berinovasi untuk menyempurnakan aplikasi Al-Quran Indonesia. Kami berkomitmen menghadirkan 
                  pengalaman digital membaca Al-Quran yang semakin berkualitas dan memperkaya fitur yang bermanfaat bagi pengguna.
                  Berikut adalah pencapaian kami dan rencana pengembangan ke depan:
                </p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-amber-800">Fitur yang Telah Terealisasi:</h4>
                  <ol className="list-decimal pl-5 mt-2">
                    <li><span className="line-through text-amber-600">Sistem bookmark dan penanda ayat favorit</span> <span className="text-green-600 font-medium">✓</span></li>
                    <li><span className="line-through text-amber-600">Koleksi audio murattal dari qari internasional terpilih</span> <span className="text-green-600 font-medium">✓</span></li>
                    <li><span className="line-through text-amber-600">Sistem pencatatan pribadi untuk refleksi terhadap ayat-ayat</span> <span className="text-green-600 font-medium">✓</span></li>
                    <li><span className="line-through text-amber-600">Jadwal waktu sholat dengan teknologi geolokasi presisi</span> <span className="text-green-600 font-medium">✓</span></li>
                    <li><span className="line-through text-amber-600">Sistem pengingat waktu ibadah yang dapat disesuaikan</span> <span className="text-green-600 font-medium">✓</span></li>
                    <li><span className="line-through text-amber-600">Tafsir Tematik Al-Maudhu'i dengan indeksasi komprehensif</span> <span className="text-green-600 font-medium">✓</span></li>
                    <li><span className="line-through text-amber-600">Platform donasi transparan untuk keberlanjutan layanan</span> <span className="text-green-600 font-medium">✓</span></li>
                    <li><span className="line-through text-amber-600">Fitur Doa Bersama untuk saling mendoakan dalam komunitas</span> <span className="text-green-600 font-medium">✓</span></li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium text-amber-800">Inovasi yang Segera Hadir:</h4>
                  <ol className="list-decimal pl-5 mt-2">
                    <li>Visualisasi kaligrafi Al-Quran interaktif dengan teknologi canvas</li>
                    <li>Sistem pencarian semantik dengan filter multi-dimensi (tema, juz, periode turun)</li>
                    <li>Ekosistem berbagi ayat terintegrasi dengan platform sosial utama</li>
                    <li>Modul pembelajaran Al-Quran interaktif dengan pelacakan kemajuan</li>
                    <li>Komunitas diskusi tematik untuk memperdalam pemahaman ayat</li>
                  </ol>
                </div>
                
                <h3 className="mt-6">Pengembangan Fitur Doa Bersama</h3>
                <p className="mb-3">
                  Fitur Doa Bersama dikembangkan untuk memfasilitasi kebutuhan spiritual dan sosial pengguna IndoQuran. 
                  Platform ini dibangun sebagai ruang digital yang memungkinkan umat muslim saling berbagi dan mendukung 
                  dalam doa dan permohonan kepada Allah SWT. Berikut adalah perjalanan pengembangan fitur ini:
                </p>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h4 className="font-semibold mb-2 text-amber-900">Tahapan Pengembangan:</h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-amber-800">
                    <li>
                      <span className="font-medium">Riset Kebutuhan Pengguna (Januari 2025)</span>
                      <p className="text-sm mt-0.5">
                        Dilakukan survei kepada 1,200+ pengguna IndoQuran untuk mengidentifikasi kebutuhan akan platform
                        berbagi doa dalam ekosistem aplikasi Al-Quran. Hasilnya menunjukkan 78% responden menginginkan
                        fitur ini.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">Perancangan Sistem (Februari 2025)</span>
                      <p className="text-sm mt-0.5">
                        Pembangunan arsitektur database dan API dengan mempertimbangkan aspek privasi dan keamanan data.
                        Implementasi schema relasional untuk prayers dan prayer_responses.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">Pengembangan Antarmuka (Maret 2025)</span>
                      <p className="text-sm mt-0.5">
                        Pembuatan komponen React yang responsif dengan fokus pada aksesibilitas dan UX yang intuitif.
                        Pengembangan sistem real-time untuk notifikasi dan interaksi pengguna.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">Pengujian Beta (April 2025)</span>
                      <p className="text-sm mt-0.5">
                        Uji coba terbatas dengan 500 pengguna aktif untuk mengidentifikasi bug dan meningkatkan performa.
                        Optimalisasi kueri database dan caching untuk mendukung pertumbuhan jumlah doa.
                      </p>
                    </li>
                    <li>
                      <span className="font-medium">Peluncuran Resmi (2 Mei 2025)</span>
                      <p className="text-sm mt-0.5">
                        Fitur diluncurkan bersamaan dengan pembaruan UI/UX platform secara keseluruhan dan mendapatkan
                        respons positif dari komunitas pengguna.
                      </p>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  <h4 className="font-semibold mb-2 text-amber-900">Rencana Pengembangan Fitur Doa Mendatang:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-amber-800">
                    <li>Implementasi kategori doa untuk memudahkan pengelompokan dan pencarian</li>
                    <li>Fitur moderasi konten berbasis AI untuk menjaga kualitas dan kesesuaian dengan nilai Islami</li>
                    <li>Integrasi dengan jadwal waktu sholat untuk mengingatkan waktu-waktu mustajab untuk berdoa</li>
                    <li>Pengembangan komunitas doa tematik berdasarkan permasalahan umum</li>
                    <li>Fitur statistik dan analitik untuk melihat dampak dan jangkauan doa</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r shadow-sm">
                  <p className="text-green-800 font-medium text-lg">Pembaruan Terkini - Mei 2025</p>
                  <p className="text-green-700 mt-1">
                    Alhamdulillah, dengan penuh syukur kami menghadirkan pembaruan signifikan pada IndoQuran. Pengguna kini dapat 
                    mengakses jadwal waktu sholat dengan akurasi tinggi berkat teknologi geolokasi yang kami implementasikan. 
                    Sistem ini secara otomatis mengenali lokasi Anda dan menyajikan jadwal sholat tepat waktu dengan fitur pengingat 
                    yang dapat disesuaikan sepenuhnya.
                  </p>
                  <p className="text-green-700 mt-2">
                    Kami juga dengan bangga meluncurkan Tafsir Tematik Al-Maudhu'i, sebuah pendekatan revolusioner untuk memahami Al-Quran 
                    berdasarkan tema-tema yang saling terkait. Fitur ini merupakan hasil kerja intensif tim kami dalam mengorganisir 
                    dan mengindeks ayat-ayat dari berbagai surah secara sistematis berdasarkan tema. Dengan fitur ini, pemahaman 
                    Al-Quran menjadi lebih mendalam dan komprehensif, membantu pengguna menemukan tuntunan hidup yang relevan dalam konteks kekinian.
                  </p>
                  <p className="text-green-700 mt-2">
                    <strong>Terbaru 14 Mei 2025:</strong> Dengan semangat kebersamaan dan keberlanjutan, kami telah meluncurkan platform 
                    donasi yang transparan untuk mendukung pengembangan IndoQuran. Kontribusi Anda, sekecil apapun, memiliki nilai 
                    yang sangat berarti bagi keberlanjutan dan pengembangan layanan ini. Setiap donasi dikelola dengan amanah dan 
                    digunakan secara efektif untuk meningkatkan kualitas layanan. 
                    Mari bersama membangun keberkahan melalui <Link href="/donasi" className="text-green-800 font-semibold hover:underline">halaman Donasi</Link>.
                  </p>
                  <p className="text-green-700 mt-2">
                    <strong>Peluncuran 2 Mei 2025:</strong> Fitur <Link href="/doa" className="text-green-800 font-semibold hover:underline">Doa Bersama</Link> kini 
                    tersedia untuk seluruh pengguna IndoQuran. Fitur ini memungkinkan komunitas muslim untuk saling berbagi doa dan harapan, 
                    memberikan dukungan dengan mengucapkan "Amiin", serta menambahkan komentar doa tambahan. Dalam dua minggu pertama setelah 
                    peluncuran, lebih dari 5,000 doa telah dibagikan dan mendapatkan lebih dari 25,000 ucapan "Amiin" dari komunitas.
                    Kami berharap fitur ini dapat memperkuat ikatan spiritual dan sosial di kalangan pengguna IndoQuran.
                  </p>
                </div>
                
                <h3 className="mt-6">Kontribusi Komunitas</h3>
                <p>
                  IndoQuran adalah proyek sumber terbuka (open source) yang berkembang berkat partisipasi aktif komunitas. 
                  Kami menyambut berbagai bentuk kontribusi dari berbagai latar belakang keahlian - baik dari pengembang dengan 
                  kontribusi kode, ahli bahasa untuk terjemahan dan tafsir yang lebih baik, desainer UX untuk meningkatkan 
                  pengalaman pengguna, hingga pengguna umum yang memberikan laporan bug dan umpan balik konstruktif. 
                  Setiap kontribusi memiliki nilai yang berharga dalam membangun ekosistem Al-Quran digital 
                  yang semakin komprehensif dan bermanfaat.
                </p>
                
                <h3 className="mt-6">Komunikasi & Bantuan</h3>
                <p>
                  Kami berkomitmen menyediakan dukungan yang responsif dan komunikasi terbuka dengan pengguna. 
                  Untuk pertanyaan, saran, laporan masalah, atau keinginan berkontribusi, silakan hubungi tim IndoQuran melalui:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Email: <a href="mailto:kontak@indoquran.web.id" className="text-amber-700 font-medium hover:underline transition-colors">kontak@indoquran.web.id</a></li>
                  <li>Repositori GitHub: <a href="https://github.com/indoquran-web" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-medium hover:underline transition-colors">github.com/indoquran-web</a></li>
                  <li>Formulir Komunikasi: <Link href="/kontak" className="text-amber-700 font-medium hover:underline transition-colors">Halaman Kontak Resmi</Link></li>
                  <li>Media Sosial: <span className="text-amber-700 font-medium">@IndoQuranApp</span> di Twitter/X dan Instagram</li>
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
                  <div className="border-l-4 border-amber-500 pl-4 pb-1 bg-amber-50/50 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.5.2 (14 Mei 2025)</h3>
                    <p className="text-sm text-amber-700 mb-3 font-medium">Platform Donasi & Penyempurnaan Antarmuka</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Peluncuran platform donasi dengan sistem pengelolaan transparan</li>
                      <li>Integrasi metode pembayaran komprehensif (transfer bank, e-wallet, QRIS)</li>
                      <li>Dashboard transparansi pemanfaatan dana untuk pengembangan</li>
                      <li>Sistem apresiasi digital berdasarkan tingkat kontribusi</li>
                      <li>Peningkatan responsivitas antarmuka pengguna di perangkat mobile</li>
                      <li>Optimasi performa dengan teknik lazy loading dan code splitting</li>
                      <li>Revisi sistem caching untuk kecepatan akses konten yang lebih baik</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-amber-500 pl-4 pb-1 bg-amber-50/50 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.5.1 (2 Mei 2025)</h3>
                    <p className="text-sm text-amber-700 mb-3 font-medium">Fitur Doa Bersama & Komunitas Digital</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Peluncuran platform Doa Bersama untuk berbagi dan mendukung doa sesama muslim</li>
                      <li>Implementasi sistem "Amiin" dan komentar doa dengan dukungan notifikasi</li>
                      <li>Pengembangan mekanisme moderasi konten untuk menjaga kualitas doa</li>
                      <li>Fitur penyortiran dan penyaringan doa berdasarkan waktu dan popularitas</li>
                      <li>Optimasi performa database untuk menangani pertumbuhan jumlah doa</li>
                      <li>Integrasi sistem privasi dan keamanan data untuk konten pengguna</li>
                      <li>Pengembangan API khusus untuk layanan Doa Bersama dengan implementasi caching</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-amber-300 pl-4 pb-1 bg-amber-50/50 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.5.0 (13 Mei 2025)</h3>
                    <p className="text-sm text-amber-700 mb-3 font-medium">Jadwal Sholat & Tafsir Tematik Komprehensif</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Implementasi widget jadwal waktu sholat dengan desain intuitif</li>
                      <li>Sistem geolokasi presisi tinggi untuk akurasi jadwal ibadah</li>
                      <li>Peluncuran Tafsir Tematik Al-Maudhu'i dengan navigasi hierarkis</li>
                      <li>Ekspansi basis data tema tafsir mencakup 55+ topik dengan 1000+ referensi ayat</li>
                      <li>Integrasi sistem notifikasi pengingat waktu sholat yang dapat dikonfigurasi</li>
                      <li>Rekayasa performa pencarian ayat dengan implementasi Redis dan full-text indexing</li>
                      <li>Perbaikan serangkaian bug pada sistem bookmark dan fitur catatan pengguna</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-amber-300 pl-4 pb-1 bg-amber-50/30 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.4.2 (27 Maret 2025)</h3>
                    <p className="text-sm text-amber-700 mb-3 font-medium">Penyempurnaan Teknis & Stabilitas</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Revisi rendering tafsir ayat dengan dukungan format teks yang lebih kaya</li>
                      <li>Reengineering sistem streaming audio dengan teknik adaptive bitrate</li>
                      <li>Implementasi desain responsif yang konsisten untuk perangkat dengan layar kecil</li>
                      <li>Migrasi format penyimpanan bookmark ke struktur data yang dioptimalkan</li>
                      <li>Penyesuaian kontras warna dan ukuran teks untuk keterbacaan lebih baik</li>
                      <li>Integrasi sistem pemantauan performa real-time</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-amber-300 pl-4 pb-1 bg-amber-50/30 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.4.0 (8 Februari 2025)</h3>
                    <p className="text-sm text-amber-700 mb-3 font-medium">Pengayaan Fitur Personalisasi & Audio</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Peluncuran sistem catatan refleksi pribadi dengan editor rich-text</li>
                      <li>Ekspansi tema antarmuka dengan opsi kontras tinggi dan mode baca malam</li>
                      <li>Peningkatan arsitektur bookmark dengan kategorisasi dan penandaan kontekstual</li>
                      <li>Penambahan koleksi audio dari qari internasional terpilih (Sheikh Mishary, Sheikh Sudais, Sheikh Ghamdi)</li>
                      <li>Implementasi standar WCAG 2.1 AA untuk aksesibilitas yang inklusif</li>
                      <li>Pembaruan arsitektur API dengan caching layer dan load balancing</li>
                      <li>Integrasi sistem sinkronisasi multi-perangkat melalui cloud storage</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-4 pb-1 bg-gray-50/50 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.3.1 (15 Desember 2024)</h3>
                    <p className="text-sm text-amber-700/80 mb-3 font-medium">Peningkatan Stabilitas Sistem</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Resolusi anomali sinkronisasi pada pelacakan posisi pembacaan</li>
                      <li>Optimasi waktu muat dengan penerapan teknik critical CSS dan deferred loading</li>
                      <li>Standarisasi rendering lintas browser (Safari, Firefox, Chrome, Edge)</li>
                      <li>Penerapan kerangka keamanan JWT dengan rotasi token dan enkripsi end-to-end</li>
                      <li>Migrasi ke sistem penyimpanan terenkripsi untuk data sensitif pengguna</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-4 pb-1 bg-gray-50/50 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.3.0 (28 Oktober 2024)</h3>
                    <p className="text-sm text-amber-700/80 mb-3 font-medium">Transformasi dengan Next.js 15 & Fitur Personalisasi</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Migrasi ke Next.js 15 dengan React Server Components dan Streaming SSR</li>
                      <li>Implementasi sistem bookmark hierarkis dengan tag dan kategori pengguna</li>
                      <li>Peluncuran fitur "Lanjutkan Membaca" dengan pelacakan progres multi-device</li>
                      <li>Revitalisasi antarmuka dengan desain yang lebih intuitif dan responsif</li>
                      <li>Adopsi strategi pembuatan statis selektif untuk halaman utama dan referensi</li>
                      <li>Implementasi rute paralel untuk pengalaman navigasi yang lebih mulus</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-4 pb-1 bg-gray-50/40 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 2.0.0 (15 Juli 2024)</h3>
                    <p className="text-sm text-amber-700/80 mb-3 font-medium">Peluncuran Platform Baru</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Transformasi arsitektur dengan antarmuka modern berbasis React dan TypeScript</li>
                      <li>Implementasi kerangka aplikasi Next.js dengan dukungan SSR dan static generation</li>
                      <li>Integrasi perpustakaan audio murattal komprehensif untuk seluruh 114 surah</li>
                      <li>Pengembangan mesin pencarian terjemahan dengan dukungan semantik dan sinonim</li>
                      <li>Implementasi Progressive Web App untuk akses offline dan instalasi lokal</li>
                      <li>Peluncuran sistem pengguna dengan profil dan personalisasi</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-4 pb-1 bg-gray-50/40 rounded-r shadow-sm">
                    <h3 className="text-lg font-semibold text-amber-900">Versi 1.0.0 (10 Januari 2024)</h3>
                    <p className="text-sm text-amber-700/80 mb-3 font-medium">Fondasi Awal</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Peluncuran perdana aplikasi IndoQuran dengan fungsi dasar</li>
                      <li>Implementasi sistem pembacaan Al-Quran dengan terjemahan Bahasa Indonesia standar Kemenag</li>
                      <li>Pengembangan sistem navigasi surah dan ayat berbasis indeks</li>
                      <li>Implementasi fitur pencarian teks terjemahan dasar</li>
                      <li>Optimasi dasar untuk perangkat mobile dan desktop</li>
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