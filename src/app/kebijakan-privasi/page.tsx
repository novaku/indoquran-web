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
        <h1 className="text-3xl font-bold text-amber-800 mb-6">Kebijakan Privasi</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 prose prose-amber max-w-none">
          <p className="text-gray-600 mb-4">
            Terakhir diperbarui: 11 Mei 2025
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Pengantar</h2>
          <p>
            Selamat datang di kebijakan privasi IndoQuran. Dokumen ini menjelaskan bagaimana kami mengumpulkan,
            menggunakan, dan melindungi data pribadi Anda ketika Anda menggunakan aplikasi IndoQuran.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Informasi yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan informasi berikut dari pengguna kami:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Informasi Akun:</strong> Nama pengguna, alamat email, dan kata sandi terenkripsi saat Anda mendaftar.</li>
            <li><strong>Data Penggunaan:</strong> Riwayat bacaan, bookmark, dan favorit ayat-ayat Al-Quran.</li>
            <li><strong>Informasi Kontak:</strong> Nama dan alamat email Anda saat menghubungi kami melalui formulir kontak.</li>
            <li><strong>Informasi Teknis:</strong> Alamat IP, jenis perangkat, browser, dan sistem operasi yang digunakan.</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Bagaimana Kami Menggunakan Informasi Anda</h2>
          <p>
            Kami menggunakan informasi yang dikumpulkan untuk:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Menyediakan dan memelihara layanan IndoQuran</li>
            <li>Menyimpan preferensi bacaan dan bookmark Anda</li>
            <li>Meningkatkan dan mengembangkan fitur baru</li>
            <li>Mengirimkan pemberitahuan terkait akun atau layanan</li>
            <li>Mendiagnosa masalah teknis dan meningkatkan kinerja aplikasi</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Keamanan Data</h2>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang dirancang untuk melindungi informasi pribadi Anda. 
            Ini termasuk enkripsi kata sandi, enkripsi data sensitif, dan perlindungan server dari akses yang tidak sah.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Pembagian Informasi</h2>
          <p>
            Kami tidak menjual, memperdagangkan, atau menyewakan informasi identitas pribadi pengguna kepada pihak ketiga. 
            Kami dapat membagikan data anonim dan agregat untuk tujuan analisis dan peningkatan layanan.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Cookie dan Teknologi Pelacakan</h2>
          <p>
            Aplikasi IndoQuran menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, 
            menganalisis penggunaan aplikasi, dan menyesuaikan konten sesuai kebutuhan Anda.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Hak-Hak Pengguna</h2>
          <p>
            Anda memiliki hak untuk:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Mengakses data pribadi yang kami simpan tentang Anda</li>
            <li>Meminta koreksi informasi yang tidak akurat</li>
            <li>Meminta penghapusan data Anda (hak untuk dilupakan)</li>
            <li>Membatasi atau menolak pemrosesan data Anda</li>
            <li>Meminta salinan data Anda dalam format yang dapat dibaca mesin</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Perubahan Kebijakan Privasi</h2>
          <p>
            Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan diposting di halaman ini, 
            dan dalam kasus perubahan signifikan, kami akan memberi tahu Anda melalui email atau pemberitahuan di aplikasi.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan atau kekhawatiran tentang kebijakan privasi kami atau data Anda, silakan hubungi kami melalui:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Mengunjungi halaman <a href="/kontak" className="text-amber-600 hover:text-amber-800">Kontak</a> kami</li>
            <li>Mengirim email ke: privacy@indoquran.com</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
