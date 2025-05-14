import React from 'react';
import Link from 'next/link';
import LazyLoadImage from '@/components/LazyLoadImage';

export default function DonasiPage() {
  return (
    <main className="w-full px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
      <div className="bg-white rounded-xl overflow-hidden border border-amber-200 shadow-lg mb-8">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-6 flex items-center">
            <LazyLoadImage src="/icons/donasi-icon.svg" alt="Donasi" width={32} height={32} className="w-8 h-8 mr-3" />
            Donasi untuk Al-Quran Indonesia
          </h1>
          
          <div className="prose prose-amber w-full max-w-full">
            <div className="animate-fadeIn">
              <p className="text-lg mb-6">
                Assalamu'alaikum Warahmatullahi Wabarakatuh, 
              </p>
              
              <p className="mb-6">
                Al-Quran Indonesia adalah aplikasi yang dikembangkan dan dikelola secara mandiri dengan tujuan 
                menyediakan platform belajar Al-Quran yang mudah diakses, berkualitas tinggi, dan <span className="font-bold">bebas dari iklan</span>. 
                Komitmen kami adalah menjaga pengalaman belajar Al-Quran yang fokus, nyaman, dan tidak terganggu oleh iklan komersial.
              </p>
              
              <h2 className="text-2xl font-bold text-amber-900 mt-8 mb-4">Mengapa Donasi Dibutuhkan?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-3">Biaya Operasional</h3>
                  <p className="text-amber-700">
                    Mendukung biaya server, hosting, domain, dan infrastruktur teknis lainnya agar aplikasi 
                    tetap berjalan lancar tanpa gangguan.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-3">Pengembangan Fitur Baru</h3>
                  <p className="text-amber-700">
                    Membantu kami mengembangkan fitur-fitur baru yang bermanfaat seperti tafsir interaktif, 
                    pembelajaran tajwid, dan pengembangan aplikasi mobile.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-3">Bebas Iklan</h3>
                  <p className="text-amber-700">
                    Donasi memungkinkan kami menjaga aplikasi bebas dari iklan, sehingga pengguna bisa fokus 
                    pada pembelajaran Al-Quran tanpa gangguan.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-3">Peningkatan Konten</h3>
                  <p className="text-amber-700">
                    Mendukung pengembangan konten berkualitas seperti tafsir tematik, ilustrasi ayat, dan artikel 
                    pendukung untuk pemahaman Al-Quran.
                  </p>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-amber-900 mt-10 mb-4">Informasi Rekening Donasi</h2>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-300 shadow-md mb-8">
                <div className="mb-6 border-b border-amber-200 pb-3">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                    Transfer Bank
                  </h3>
                </div>
                
                {/* Bank Permata */}
                <div className="mb-6 pb-6 border-b border-amber-200">
                  <div className="flex flex-col md:flex-row items-center mb-6">
                    <div className="w-40 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                      <LazyLoadImage 
                        src="/images/bank-permata-logo.png" 
                        alt="Logo Bank Permata" 
                        width={160} 
                        height={80} 
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-amber-900 mb-2">Bank Permata</h3>
                      <div className="space-y-1 text-amber-800">
                        <p className="font-medium">Nomor Rekening:</p>
                        <p className="text-2xl font-mono font-bold mb-2">9906-4392-60</p>
                        <p className="font-medium">Atas Nama:</p>
                        <p className="text-xl font-semibold">Nova Herdi Kusumah</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* E-Wallet */}
                <div className="mb-6">
                  <div className="border-b border-amber-200 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                      E-Wallet / QRIS
                    </h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="w-40 mb-4 md:mb-0 md:mr-6 flex-shrink-0 flex justify-center">
                      <div className="p-3 bg-white rounded-lg border border-amber-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-amber-500">
                          <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                          <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <h3 className="text-xl font-bold text-amber-900 mb-2">OVO, GoPay, DANA, ShopeePay, Astra Pay</h3>
                      <div className="space-y-1 text-amber-800">
                        <p className="font-medium">Nomor:</p>
                        <p className="text-2xl font-mono font-bold mb-2">0811-1101-024</p>
                        <p className="font-medium">Atas Nama:</p>
                        <p className="text-xl font-semibold">Nova Herdi Kusumah</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-amber-200">
                  <p className="text-amber-800 mb-3 font-medium">Langkah Donasi:</p>
                  <ol className="list-decimal list-inside space-y-2 text-amber-700">
                    <li>Transfer ke salah satu rekening bank atau e-wallet di atas</li>
                    <li>Masukkan nominal donasi yang diinginkan</li>
                    <li>Untuk membantu kami melacak donasi, tambahkan angka "15" di akhir nominal donasi (misalnya Rp 100.015, Rp 50.015)</li>
                    <li>Setelah transfer, Anda bisa mengonfirmasi donasi melalui <Link href="/kontak" className="text-amber-600 hover:text-amber-800 underline">halaman kontak</Link> (opsional)</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r mb-8">
                <h3 className="text-green-800 font-bold mb-2">Kebijakan Transparansi</h3>
                <p className="text-green-700">
                  Kami berkomitmen untuk mengelola donasi dengan transparan dan amanah. 
                  Laporan penggunaan dana donasi akan diperbarui secara berkala dan dapat diakses oleh semua pengguna. 
                  Dana akan dialokasikan untuk pengembangan aplikasi, peningkatan infrastruktur server, dan dukungan operasional.
                </p>
              </div>
              
              <h2 className="text-2xl font-bold text-amber-900 mt-10 mb-4">Bentuk Dukungan Lainnya</h2>
              
              <p className="mb-4">
                Selain donasi finansial, Anda juga dapat mendukung pengembangan Al-Quran Indonesia melalui:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200 flex flex-col">
                  <h3 className="font-bold text-amber-800 mb-3">Doa</h3>
                  <p className="text-amber-700 flex-grow">
                    Dukung kami dengan doa agar aplikasi ini terus memberi manfaat dan menjadi amal jariyah bagi semua yang terlibat.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200 flex flex-col">
                  <h3 className="font-bold text-amber-800 mb-3">Feedback</h3>
                  <p className="text-amber-700 flex-grow">
                    Berikan saran, kritik, dan ide pengembangan melalui halaman kontak atau email kami.
                  </p>
                  <Link href="/kontak" className="mt-3 text-amber-600 hover:text-amber-800 font-medium">
                    Kirim Feedback →
                  </Link>
                </div>
                
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200 flex flex-col">
                  <h3 className="font-bold text-amber-800 mb-3">Bagikan</h3>
                  <p className="text-amber-700 flex-grow">
                    Bantu sebarkan informasi tentang aplikasi ini kepada keluarga, teman, dan komunitas Anda.
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-10 mb-6">
                <p className="text-amber-900 text-lg font-semibold mb-2">
                  Jazakumullah khairan katsiran atas dukungan Anda
                </p>
                <p className="text-amber-700 italic">
                  "Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai; pada setiap tangkai terdapat seratus biji. Allah melipatgandakan bagi siapa yang Dia kehendaki. Dan Allah Mahaluas, Maha Mengetahui." (QS. Al-Baqarah: 261)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
