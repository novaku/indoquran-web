'use client';

import React from 'react';
import LazyLoadImage from '@/components/LazyLoadImage';

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold text-amber-800 mb-6 flex items-center">
          <LazyLoadImage src="/icons/kebijakan-privasi-icon.svg" alt="Kebijakan Privasi" width={32} height={32} className="w-8 h-8 mr-3" />
          Kebijakan Privasi
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 prose prose-amber w-full max-w-full">
          <p className="text-gray-600 mb-4">
            Terakhir diperbarui: 11 Mei 2025
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">1. Pengantar</h2>
          <p>
            Selamat datang di Kebijakan Privasi IndoQuran. Aplikasi kami dirancang untuk memberikan pengalaman membaca 
            Al-Quran yang nyaman dan bermanfaat dengan tetap menjunjung tinggi privasi Anda. Dokumen ini menjelaskan dengan jelas bagaimana 
            kami mengumpulkan, menggunakan, melindungi, dan mengelola informasi pribadi Anda saat menggunakan aplikasi IndoQuran.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">2. Informasi yang Kami Kumpulkan</h2>
          <p>
            Untuk memberikan layanan terbaik, kami mengumpulkan beberapa jenis informasi:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Informasi Akun:</strong> Ketika Anda mendaftar, kami mengumpulkan nama pengguna dan alamat email Anda. Kata sandi selalu disimpan dalam bentuk terenkripsi yang aman.</li>
            <li><strong>Data Penggunaan:</strong> Kami menyimpan riwayat bacaan, bookmark, catatan pribadi, dan ayat-ayat favorit Anda untuk memudahkan akses saat dibutuhkan.</li>
            <li><strong>Informasi Kontak:</strong> Saat menggunakan formulir kontak kami, kami mengumpulkan nama, alamat email, dan isi pesan Anda untuk merespons pertanyaan Anda.</li>
            <li><strong>Data Lokasi:</strong> Hanya dengan izin eksplisit Anda, kami mengakses informasi lokasi untuk menyediakan jadwal waktu salat yang akurat untuk wilayah Anda.</li>
            <li><strong>Informasi Perangkat:</strong> Kami mengumpulkan informasi dasar seperti jenis perangkat, browser, dan sistem operasi untuk memastikan aplikasi berjalan dengan optimal di perangkat Anda.</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">3. Bagaimana Kami Menggunakan Informasi</h2>
          <p>
            Informasi yang kami kumpulkan digunakan untuk:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Menyediakan dan terus mengembangkan layanan IndoQuran yang berkualitas</li>
            <li>Memungkinkan Anda menyimpan dan mengakses preferensi bacaan, bookmark, dan catatan pribadi di berbagai perangkat</li>
            <li>Menyajikan pengalaman yang dipersonalisasi berdasarkan kebiasaan dan preferensi membaca Anda</li>
            <li>Mengembangkan fitur-fitur baru yang sesuai dengan kebutuhan pengguna</li>
            <li>Mengirimkan notifikasi penting mengenai akun atau perubahan pada layanan kami</li>
            <li>Menyelesaikan masalah teknis dan meningkatkan performa aplikasi</li>
            <li>Menganalisis bagaimana pengguna berinteraksi dengan aplikasi untuk penyempurnaan yang berkelanjutan</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">4. Keamanan Data Anda</h2>
          <p>
            Kami berkomitmen penuh untuk melindungi data Anda dengan menerapkan berbagai langkah keamanan:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Enkripsi end-to-end untuk semua data sensitif yang ditransmisikan</li>
            <li>Sistem hashing dan salting tingkat lanjut untuk keamanan kata sandi</li>
            <li>Pembaruan keamanan rutin dan pemantauan berkelanjutan untuk mencegah akses tidak sah</li>
            <li>Akses data yang dibatasi hanya kepada personel yang berwenang</li>
            <li>Sistem pencadangan data otomatis untuk melindungi informasi Anda</li>
            <li>Infrastruktur server yang dilindungi dengan firewall dan sistem deteksi intrusi modern</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">5. Berapa Lama Kami Menyimpan Data</h2>
          <p>
            Kami menyimpan data pribadi Anda hanya selama diperlukan untuk menyediakan layanan yang Anda gunakan atau untuk memenuhi tujuan yang dijelaskan dalam kebijakan ini. Jika Anda menghapus akun, kami akan menghapus atau mengaburkan identitas dalam informasi pribadi Anda dalam waktu 30 hari, kecuali jika ada kewajiban hukum yang mengharuskan kami menyimpannya lebih lama.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">6. Komitmen terhadap Privasi Anda</h2>
          <p>
            Kami berjanji untuk menghormati privasi Anda:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Kami <strong>tidak pernah</strong> menjual, memperdagangkan, atau menyewakan informasi pribadi pengguna kepada pihak lain</li>
            <li>Kami hanya membagikan data anonim dan agregat untuk keperluan analisis dan peningkatan layanan</li>
            <li>Informasi pribadi hanya dibagikan dalam situasi yang sangat terbatas seperti kewajiban hukum atau untuk melindungi hak-hak kami</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">7. Teknologi yang Kami Gunakan</h2>
          <p>
            IndoQuran menggunakan beberapa teknologi modern untuk memberikan pengalaman terbaik:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Cookie:</strong> Membantu kami mengingat preferensi Anda dan meningkatkan navigasi dalam aplikasi</li>
            <li><strong>Analitik:</strong> Membantu kami memahami bagaimana aplikasi digunakan untuk perbaikan berkelanjutan</li>
          </ul>
          <p>
            Anda memiliki kontrol penuh untuk mengatur preferensi cookie melalui pengaturan browser atau perangkat Anda.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">8. Hak-Hak Anda sebagai Pengguna</h2>
          <p>
            Sebagai pengguna IndoQuran, Anda memiliki hak-hak berikut terkait data pribadi Anda:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Hak untuk Mengakses:</strong> Anda berhak mendapatkan salinan data pribadi yang kami miliki tentang Anda</li>
            <li><strong>Hak untuk Mengoreksi:</strong> Anda dapat meminta kami memperbaiki informasi yang tidak akurat</li>
            <li><strong>Hak untuk Menghapus:</strong> Anda dapat meminta penghapusan data pribadi Anda (dikenal sebagai "hak untuk dilupakan")</li>
            <li><strong>Hak untuk Membatasi:</strong> Anda dapat meminta pembatasan pemrosesan data Anda dalam kondisi tertentu</li>
            <li><strong>Hak untuk Portabilitas:</strong> Anda dapat meminta transfer data Anda dalam format yang dapat dibaca mesin</li>
            <li><strong>Hak untuk Menolak:</strong> Anda dapat menolak pemrosesan data Anda dalam situasi spesifik</li>
          </ul>
          <p>
            Untuk mengajukan permintaan terkait hak-hak ini, silakan hubungi kami melalui informasi kontak yang tersedia di bawah.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">9. Kebijakan untuk Pengguna Anak</h2>
          <p>
            IndoQuran tidak dirancang untuk digunakan oleh anak-anak di bawah usia 13 tahun. Kami tidak mengumpulkan informasi pribadi dari anak-anak secara sengaja. Jika Anda sebagai orang tua atau wali mengetahui bahwa anak Anda telah memberikan informasi pribadi kepada kami, mohon segera hubungi kami agar kami dapat mengambil tindakan yang diperlukan untuk menghapus informasi tersebut.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">10. Pembaruan Kebijakan Privasi</h2>
          <p>
            Kebijakan privasi ini dapat diperbarui dari waktu ke waktu seiring dengan perkembangan layanan kami atau perubahan regulasi. Setiap perubahan akan dipublikasikan di halaman ini dengan tanggal pembaruan yang jelas. Untuk perubahan yang signifikan, kami akan memberikan notifikasi tambahan melalui email atau pemberitahuan dalam aplikasi untuk memastikan Anda selalu terinformasi.
          </p>
          
          <h2 className="text-xl font-semibold text-amber-700 mt-6 mb-3">11. Cara Menghubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait kebijakan privasi atau data pribadi Anda, jangan ragu untuk menghubungi kami melalui:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Halaman <a href="/kontak" className="text-amber-600 hover:text-amber-800">Kontak</a> resmi kami</li>
            <li>Email: <a href="mailto:privacy@indoquran.com" className="text-amber-600 hover:text-amber-800">privacy@indoquran.com</a></li>
            <li>Kami berkomitmen untuk merespons setiap pertanyaan dalam waktu maksimal 30 hari</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
