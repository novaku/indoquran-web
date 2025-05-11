'use client';

import React, { useEffect, useState } from 'react';
import OfflineBanner from '@/components/OfflineBanner';
import offlineStorage from '@/utils/offlineStorage';

export default function PrivacyPolicyPage() {
  // Cache this page for offline access when it's loaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track that this page was visited (for offline access history)
      offlineStorage.trackStaticPage('/kebijakan-privasi');
      
      // Get the current page content
      const pageContent = {
        title: 'Kebijakan Privasi | IndoQuran',
        content: document.querySelector('main')?.innerHTML || '',
        lastUpdated: Date.now()
      };
      
      // Store the page content for offline access
      offlineStorage.saveStaticPage('/kebijakan-privasi', pageContent);
    }
  }, []);

  const [isOffline, setIsOffline] = useState(false);
  
  // Check if we're offline
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(offlineStorage.isOffline());
      
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <OfflineBanner />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-800 mb-6 flex items-center">
          <img src="/icons/kebijakan-privasi-icon.svg" alt="Kebijakan Privasi" className="w-8 h-8 mr-3" />
          Kebijakan Privasi
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 prose prose-amber max-w-none">
          <p className="text-gray-600 mb-4">
            Terakhir diperbarui: 11 Mei 2025
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">1. Pengantar</h2>
          <p>
            Selamat datang di Kebijakan Privasi IndoQuran. Aplikasi ini didesain untuk memberikan pengalaman membaca 
            Al-Quran yang nyaman dengan tetap menghormati privasi Anda. Dokumen ini menjelaskan secara terperinci bagaimana 
            kami mengumpulkan, menggunakan, melindungi, dan mengelola data pribadi Anda saat Anda menggunakan aplikasi IndoQuran.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">2. Jenis Informasi yang Kami Kumpulkan</h2>
          <p>
            Untuk memberikan layanan yang optimal, kami mengumpulkan berbagai jenis informasi:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Informasi Akun:</strong> Saat mendaftar, kami mengumpulkan nama pengguna, alamat email, dan menyimpan kata sandi Anda dalam bentuk terenkripsi.</li>
            <li><strong>Data Penggunaan:</strong> Kami menyimpan informasi seperti riwayat bacaan, bookmark, catatan pribadi, dan ayat-ayat Al-Quran yang Anda tandai sebagai favorit.</li>
            <li><strong>Informasi Kontak:</strong> Saat Anda menghubungi kami melalui formulir kontak, kami mengumpulkan nama, alamat email, dan isi pesan Anda.</li>
            <li><strong>Data Lokasi:</strong> Dengan izin Anda, kami dapat mengakses informasi lokasi untuk menyediakan waktu salat yang akurat sesuai lokasi Anda.</li>
            <li><strong>Informasi Teknis:</strong> Kami mengumpulkan data teknis seperti alamat IP, jenis perangkat, versi browser, sistem operasi, dan informasi jaringan untuk memastikan kompatibilitas dan meningkatkan kinerja.</li>
            <li><strong>Data Penyimpanan Lokal:</strong> Kami menggunakan penyimpanan lokal di perangkat Anda untuk fitur offline dan mempercepat pengalaman pengguna.</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">3. Penggunaan Informasi</h2>
          <p>
            Data yang kami kumpulkan digunakan untuk beberapa tujuan utama:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Menyediakan dan memelihara layanan IndoQuran secara berkelanjutan</li>
            <li>Memungkinkan Anda menyimpan dan mengakses preferensi bacaan, bookmark, dan catatan pribadi di berbagai perangkat</li>
            <li>Memberikan pengalaman yang dipersonalisasi berdasarkan kebiasaan membaca dan preferensi Anda</li>
            <li>Meningkatkan dan mengembangkan fitur-fitur baru berdasarkan umpan balik dan pola penggunaan</li>
            <li>Mengirimkan pemberitahuan penting terkait akun atau perubahan layanan</li>
            <li>Mendiagnosa masalah teknis dan meningkatkan kecepatan dan stabilitas aplikasi</li>
            <li>Melakukan analisis agregat untuk memahami bagaimana pengguna berinteraksi dengan aplikasi</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">4. Perlindungan dan Keamanan Data</h2>
          <p>
            Keamanan data Anda adalah prioritas utama kami. Kami menerapkan berbagai langkah perlindungan:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Enkripsi end-to-end untuk semua transmisi data sensitif</li>
            <li>Hashing dan salting untuk penyimpanan kata sandi</li>
            <li>Pembaruan keamanan berkala dan pemantauan untuk mencegah akses tidak sah</li>
            <li>Pembatasan akses data hanya kepada karyawan yang membutuhkannya</li>
            <li>Pencadangan data reguler untuk mencegah kehilangan data</li>
            <li>Perlindungan server dengan firewall dan sistem deteksi intrusi</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">5. Penyimpanan dan Retensi Data</h2>
          <p>
            Kami menyimpan data pribadi Anda selama diperlukan untuk menyediakan layanan yang Anda minta atau untuk tujuan lain yang kami jelaskan dalam kebijakan ini. Jika Anda menghapus akun, kami akan menghapus atau menganonimkan informasi pribadi Anda dalam waktu 30 hari, kecuali diperlukan secara hukum untuk menyimpannya lebih lama.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">6. Pembagian Informasi</h2>
          <p>
            Komitmen kami terhadap privasi Anda sangat tegas:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Kami <strong>tidak pernah</strong> menjual, memperdagangkan, atau menyewakan informasi identitas pribadi pengguna kepada pihak ketiga</li>
            <li>Kami dapat membagikan data anonim dan agregat untuk tujuan analisis dan peningkatan layanan</li>
            <li>Dalam kasus yang sangat terbatas, kami mungkin membagikan informasi jika diwajibkan oleh hukum atau untuk melindungi hak hukum kami</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">7. Teknologi Penyimpanan dan Pelacakan</h2>
          <p>
            Aplikasi IndoQuran menggunakan beberapa teknologi untuk meningkatkan pengalaman pengguna:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Cookie:</strong> Untuk mengingat preferensi dan meningkatkan navigasi</li>
            <li><strong>Local Storage:</strong> Untuk menyimpan data Al-Quran secara offline dan mempercepat akses</li>
            <li><strong>Analytics:</strong> Untuk memahami pola penggunaan dan meningkatkan aplikasi</li>
          </ul>
          <p>
            Anda dapat mengelola preferensi cookie dan penyimpanan lokal melalui pengaturan browser atau perangkat Anda.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">8. Hak-Hak Pengguna</h2>
          <p>
            Sebagai pengguna, Anda memiliki hak terhadap data pribadi Anda:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Hak Akses:</strong> Anda dapat meminta salinan data pribadi yang kami simpan tentang Anda</li>
            <li><strong>Hak Koreksi:</strong> Anda dapat meminta pembaruan atau perbaikan informasi yang tidak akurat</li>
            <li><strong>Hak Penghapusan:</strong> Anda dapat meminta kami menghapus data pribadi Anda (hak untuk dilupakan)</li>
            <li><strong>Hak Pembatasan:</strong> Anda dapat meminta kami membatasi pemrosesan data Anda dalam situasi tertentu</li>
            <li><strong>Hak Portabilitas Data:</strong> Anda dapat meminta salinan data Anda dalam format yang dapat dibaca mesin</li>
            <li><strong>Hak Keberatan:</strong> Anda dapat menolak pemrosesan data pribadi Anda dalam situasi tertentu</li>
          </ul>
          <p>
            Untuk menggunakan hak-hak ini, silakan hubungi kami melalui informasi kontak di bawah.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">9. Kebijakan Privasi Anak</h2>
          <p>
            Aplikasi IndoQuran tidak ditujukan untuk anak-anak di bawah usia 13 tahun. Kami tidak secara sadar mengumpulkan informasi pribadi dari anak-anak. Jika Anda adalah orang tua atau wali dan percaya bahwa anak Anda telah memberikan informasi pribadi kepada kami, silakan hubungi kami untuk menghapus informasi tersebut.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">10. Perubahan Kebijakan Privasi</h2>
          <p>
            Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu untuk mencerminkan perubahan dalam praktik atau peraturan hukum kami. Perubahan akan diposting di halaman ini dengan tanggal pembaruan, dan dalam kasus perubahan signifikan, kami akan memberi tahu Anda melalui email atau pemberitahuan di aplikasi.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">11. Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait kebijakan privasi kami atau data Anda, silakan hubungi kami melalui:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Halaman <a href="/kontak" className="text-amber-600 hover:text-amber-800">Kontak</a> kami</li>
            <li>Email: <a href="mailto:privacy@indoquran.com" className="text-amber-600 hover:text-amber-800">privacy@indoquran.com</a></li>
            <li>Kami akan merespons permintaan Anda dalam waktu 30 hari</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
