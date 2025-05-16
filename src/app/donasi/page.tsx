import React from 'react';
import Link from 'next/link';
import LazyLoadImage from '@/components/LazyLoadImage';
import CopyButton from '@/components/CopyButton';
import { getDonations } from '@/services/donationService'; // Server-side function only
import { formatCurrency, getMonthName, getCurrentMonthYear } from '@/utils/donationClient'; // Client-safe functions

// This is a server component by default in the app directory
// Next.js 13+ page components in app/ dir are server components by default

// This makes the page dynamic to show up-to-date donation data
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function DonasiPage() {
  // Get the current month and year
  const { month, year } = getCurrentMonthYear();
  
  // Fetch donation data with robust error handling and fallbacks
  let donationData;
  let dataFetchingError = false;
  
  try {
    console.log(`Fetching donations for ${year}-${month} using server-side database access`);
    // Use direct database access from server
    donationData = await getDonations(year, month);
  } catch (error) {
    console.error('Error fetching donation data:', error);
    dataFetchingError = true;
    
    // If database access fails, use a default structure
    donationData = {
      monthlyDonations: [],
      currentMonth: [],
      yearlyTotal: {
        total_amount: 0,
        donor_count: 0,
        avg_donation: 0
      },
      allocations: []
    };
  }
  
  console.log('Donation data fetch complete:', 
    dataFetchingError ? 'Using fallback data' : 'Using real data');
    
  return (
    <main className="w-full px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
      <div className="bg-white rounded-xl overflow-hidden border border-amber-200 shadow-lg mb-8">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-6 flex items-center">
            <LazyLoadImage src="/icons/donasi-icon.svg" alt="Donasi" width={32} height={32} className="w-8 h-8 mr-3" />
            Donasi untuk Al-Quran Indonesia
          </h1>
          
          {dataFetchingError && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 text-amber-700">
              <p className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Data donasi sedang dimuat. Beberapa informasi mungkin tidak lengkap atau terakhir diperbarui.
              </p>
            </div>
          )}
          
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
              
              <h2 className="text-3xl font-bold text-center text-amber-900 mt-12 mb-6 flex justify-center items-center">
                <span className="bg-amber-100 px-4 py-1 rounded-lg">💰 Informasi Rekening Donasi 💰</span>
              </h2>
              
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-6 rounded-xl border-2 border-amber-400 shadow-lg mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 -mt-10 -mr-10 bg-amber-400 opacity-10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 -mb-20 -ml-20 bg-amber-500 opacity-5 rounded-full"></div>
                
                <div className="mb-6 border-b-2 border-amber-300 pb-4 relative z-10">
                  <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center bg-white inline-block px-4 py-1 rounded-lg shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-amber-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                    Transfer Bank
                  </h3>
                </div>
                
                {/* Bank Permata */}
                <div className="mb-8 pb-8 border-b-2 border-amber-300 relative z-10">
                  <div className="relative bg-white p-5 rounded-xl shadow-md border-2 border-amber-200 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 bg-amber-400 text-white text-sm font-bold py-1 px-3 rounded-bl-lg rounded-tr-lg shadow-sm">
                      Rekening Utama
                    </div>
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="w-40 mb-4 md:mb-0 md:mr-6 flex-shrink-0 bg-white p-3 rounded-lg border border-amber-200 shadow-sm">
                        <LazyLoadImage 
                          src="/images/bank-permata-logo.png" 
                          alt="Logo Bank Permata" 
                          width={160} 
                          height={80} 
                          className="w-full h-auto"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center">
                          <span className="bg-amber-100 px-2 py-0.5 rounded mr-2">🏦</span> Bank Permata
                        </h3>
                        <div className="space-y-1 text-amber-800">
                          <p className="font-medium">Nomor Rekening:</p>
                          <div className="bg-amber-50 p-2 rounded-md border border-amber-200 mb-2 flex items-center">
                            <p className="text-2xl font-mono font-bold text-amber-900">9906-4392-60</p>
                            <CopyButton textToCopy="990643926" />
                          </div>
                          <p className="font-medium">Atas Nama:</p>
                          <p className="text-xl font-semibold bg-amber-50 p-2 rounded-md border border-amber-200">Nova Herdi Kusumah</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* E-Wallet */}
                <div className="mb-6 relative z-10">
                  <div className="border-b-2 border-amber-300 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center bg-white inline-block px-4 py-1 rounded-lg shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-amber-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                      E-Wallet / QRIS
                    </h3>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl shadow-md border-2 border-amber-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="w-40 h-40 mb-4 md:mb-0 md:mr-6 flex-shrink-0 flex justify-center items-center">
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-full border-2 border-amber-300 flex items-center justify-center shadow-inner">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-amber-500">
                            <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                            <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-grow text-center md:text-left">
                        <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center justify-center md:justify-start">
                          <span className="bg-amber-100 px-2 py-0.5 rounded mr-2">📱</span> 
                          <span>OVO, GoPay, DANA, ShopeePay, Astra Pay</span>
                        </h3>
                        <div className="space-y-3 text-amber-800">
                          <p className="font-medium">Nomor:</p>
                          <div className="bg-amber-50 p-2 rounded-md border border-amber-200 mb-3 flex items-center justify-center md:justify-start">
                            <p className="text-2xl font-mono font-bold text-amber-900">0811-1101-024</p>
                            <CopyButton textToCopy="081111010024" />
                          </div>
                          <p className="font-medium">Atas Nama:</p>
                          <p className="text-xl font-semibold bg-amber-50 p-2 rounded-md border border-amber-200">Nova Herdi Kusumah</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 p-5 rounded-xl border-2 border-amber-300 shadow-md relative z-10">
                  <div className="absolute top-0 right-0 transform rotate-45 translate-x-1/4 -translate-y-1/4 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-amber-800">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center mb-4 pb-2 border-b-2 border-amber-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h4 className="text-xl font-bold text-amber-900">Langkah Donasi:</h4>
                  </div>
                  
                  <ol className="space-y-4 relative z-10">
                    <li className="flex items-start">
                      <span className="flex items-center justify-center bg-amber-500 text-white rounded-full w-8 h-8 font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                      <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex-grow">
                        <p className="text-amber-900">Transfer ke salah satu rekening bank atau e-wallet di atas</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex items-center justify-center bg-amber-500 text-white rounded-full w-8 h-8 font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                      <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex-grow">
                        <p className="text-amber-900">Masukkan nominal donasi yang diinginkan</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex items-center justify-center bg-amber-500 text-white rounded-full w-8 h-8 font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                      <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex-grow">
                        <p className="text-amber-900">
                          Untuk membantu kami melacak donasi, tambahkan angka <span className="font-bold text-amber-600">15</span> di akhir nominal donasi
                          <span className="block mt-1 text-sm italic">(misalnya Rp 100.015, Rp 50.015)</span>
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex items-center justify-center bg-amber-500 text-white rounded-full w-8 h-8 font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                      <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex-grow">
                        <p className="text-amber-900">
                          Setelah transfer, Anda bisa mengonfirmasi donasi melalui 
                          <Link href="/kontak" className="inline-block mx-1 px-2 py-0.5 bg-amber-100 text-amber-800 hover:text-amber-900 hover:bg-amber-200 rounded font-medium transition-colors">
                            halaman kontak
                          </Link> 
                          (opsional)
                        </p>
                      </div>
                    </li>
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
              
              <h2 className="text-2xl font-bold text-amber-900 mt-10 mb-4">Donasi Terkini</h2>
              
              <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-6 rounded-xl border border-amber-200 shadow-md mb-8">
                <div className="mb-4 border-b border-amber-200 pb-3">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                    Donasi Masuk ({getMonthName(getCurrentMonthYear().month)} {getCurrentMonthYear().year})
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden border border-amber-200">
                    <thead className="bg-amber-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-amber-800">Tanggal</th>
                        <th className="px-4 py-2 text-left text-amber-800">Jumlah</th>
                        <th className="px-4 py-2 text-left text-amber-800">Metode</th>
                        <th className="px-4 py-2 text-left text-amber-800">Inisial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {donationData.currentMonth.length > 0 ? (
                        donationData.currentMonth.map((donation) => (
                          <tr key={donation.id} className="hover:bg-amber-50">
                            <td className="px-4 py-3 text-amber-800">{new Date(donation.donation_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                            <td className="px-4 py-3 text-amber-800 font-medium">{formatCurrency(donation.amount)}</td>
                            <td className="px-4 py-3 text-amber-800">{donation.method}</td>
                            <td className="px-4 py-3 text-amber-800">{donation.donor_initial}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-amber-600">
                            Belum ada donasi untuk bulan ini
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {donationData.currentMonth.length > 0 && (
                      <tfoot className="bg-amber-50">
                        <tr>
                          <td className="px-4 py-3 font-medium text-amber-800">Total</td>
                          <td className="px-4 py-3 font-bold text-amber-800">
                            {donationData.monthlyDonations.length > 0 && 
                              formatCurrency(donationData.monthlyDonations[0].total_amount)}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                
                <div className="mt-4 bg-white p-4 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-800 mb-4">Alokasi Dana Donasi:</h4>
                  
                  <div className="mb-4 pb-2 border-b border-amber-100">
                    <p className="text-sm text-amber-700">Donasi yang kami terima digunakan secara transparan dan bertanggung jawab untuk berbagai keperluan berikut:</p>
                  </div>
                  
                  <div className="space-y-4">
                    {donationData.allocations.map((allocation, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm font-medium text-amber-800 mb-1">
                          <span>{allocation.category}</span>
                          <span>{formatCurrency(allocation.amount)}</span>
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-2.5 mb-1">
                          <div 
                            className={`h-2.5 rounded-full ${
                              index % 4 === 0 ? 'bg-green-500' : 
                              index % 4 === 1 ? 'bg-amber-500' : 
                              index % 4 === 2 ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${allocation.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-amber-600 italic">
                          {allocation.category === 'Server & Hosting' && 'Biaya bulanan server cloud, hosting, domain, dan infrastruktur teknis.'}
                          {allocation.category === 'Pengembangan' && 'Pengembangan fitur baru dan perbaikan bug dalam aplikasi.'}
                          {allocation.category === 'Konten' && 'Pembuatan dan pemeliharaan konten Al-Quran, terjemahan, dan tafsir.'}
                          {allocation.category === 'Operasional' && 'Biaya administrasi dan operasional harian aplikasi.'}
                          {!['Server & Hosting', 'Pengembangan', 'Konten', 'Operasional'].includes(allocation.category) && 'Mendukung keberlangsungan dan pengembangan aplikasi.'}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-2 border-t border-amber-100">
                    <div className="bg-amber-50 p-3 rounded text-sm">
                      <h5 className="font-medium text-amber-800 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        Rincian Alokasi Dana
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-amber-700">
                        <li><span className="font-medium">Server & Hosting (30-40%)</span>: Pembayaran layanan cloud, domain, dan keamanan</li>
                        <li><span className="font-medium">Pengembangan (25-35%)</span>: Pembuatan fitur baru dan peningkatan kinerja aplikasi</li>
                        <li><span className="font-medium">Konten (15-25%)</span>: Pengembangan terjemahan dan tafsir berkualitas</li>
                        <li><span className="font-medium">Operasional (10-20%)</span>: Dukungan teknis dan administrasi aplikasi</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 mb-4 border-t border-amber-200 pt-6">
                  <h4 className="font-medium text-amber-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                    </svg>
                    Ringkasan Donasi Tahun {getCurrentMonthYear().year}
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden border border-amber-200">
                      <thead className="bg-amber-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-amber-800">Bulan</th>
                          <th className="px-4 py-2 text-left text-amber-800">Total Donasi</th>
                          <th className="px-4 py-2 text-left text-amber-800">Jumlah Donatur</th>
                          <th className="px-4 py-2 text-left text-amber-800">Rata-rata</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100">
                        {donationData.monthlyDonations.length > 0 ? (
                          donationData.monthlyDonations.map((monthData, index) => (
                            <tr key={`${monthData.year}-${monthData.month}`} className="hover:bg-amber-50">
                              <td className="px-4 py-3 text-amber-800">{getMonthName(monthData.month)}</td>
                              <td className="px-4 py-3 text-amber-800 font-medium">{formatCurrency(monthData.total_amount)}</td>
                              <td className="px-4 py-3 text-amber-800">{monthData.donor_count}</td>
                              <td className="px-4 py-3 text-amber-800">{formatCurrency(monthData.avg_donation)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-amber-600">
                              Belum ada data donasi untuk tahun ini
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {donationData.yearlyTotal && donationData.yearlyTotal.total_amount > 0 && (
                        <tfoot className="bg-amber-50">
                          <tr>
                            <td className="px-4 py-3 font-bold text-amber-800">Total {getCurrentMonthYear().year}</td>
                            <td className="px-4 py-3 font-bold text-amber-800">{formatCurrency(donationData.yearlyTotal.total_amount)}</td>
                            <td className="px-4 py-3 font-bold text-amber-800">{donationData.yearlyTotal.donor_count}</td>
                            <td className="px-4 py-3 font-bold text-amber-800">{formatCurrency(donationData.yearlyTotal.avg_donation)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                  
                  {/* Target comparison section removed */}
                </div>
                
                <p className="text-sm text-amber-700 mt-4 italic text-center">
                  *Catatan: Untuk privasi donatur, hanya inisial yang ditampilkan. Terima kasih atas dukungannya.
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
