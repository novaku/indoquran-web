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
              
              <h2 className="text-3xl font-bold text-center text-amber-900 mt-12 mb-8 flex justify-center items-center relative">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent top-1/2 transform -translate-y-1/2 opacity-50"></div>
                <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 px-8 py-2 rounded-lg shadow-md border border-amber-300 relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-600 mr-2">
                    <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
                  </svg>
                  <span>Mengapa Donasi Dibutuhkan?</span>
                </div>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border-2 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-amber-400 opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-full shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-800 mb-3 group-hover:text-amber-900">Biaya Operasional</h3>
                      <p className="text-amber-700">
                        Mendukung biaya server, hosting, domain, dan infrastruktur teknis lainnya agar aplikasi 
                        tetap berjalan lancar tanpa gangguan. <span className="font-medium">Server berkualitas tinggi diperlukan</span> untuk menjamin 
                        akses cepat ke Al-Quran kapanpun dibutuhkan.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border-2 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-amber-400 opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-full shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-800 mb-3 group-hover:text-amber-900">Pengembangan Fitur Baru</h3>
                      <p className="text-amber-700">
                        Membantu kami mengembangkan <span className="font-medium">fitur-fitur baru yang bermanfaat</span> seperti tafsir interaktif, 
                        pembelajaran tajwid, dan pengembangan aplikasi mobile untuk mempermudah akses Al-Quran kapanpun dan dimanapun.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border-2 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-amber-400 opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-full shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-800 mb-3 group-hover:text-amber-900">Bebas Iklan <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">Komitmen Kami</span></h3>
                      <p className="text-amber-700">
                        Donasi memungkinkan kami menjaga aplikasi <span className="font-medium">100% bebas dari iklan</span>, sehingga pengguna bisa fokus 
                        pada pembelajaran Al-Quran tanpa gangguan. Ini adalah komitmen kami untuk memberikan pengalaman spiritual yang tenang dan nyaman.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border-2 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-amber-400 opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-full shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-800 mb-3 group-hover:text-amber-900">Peningkatan Konten</h3>
                      <p className="text-amber-700">
                        Mendukung pengembangan <span className="font-medium">konten berkualitas tinggi</span> seperti tafsir tematik, ilustrasi ayat, dan artikel 
                        pendukung untuk memperdalam pemahaman Al-Quran dan memudahkan penerapannya dalam kehidupan sehari-hari.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-100 via-white to-amber-100 p-5 rounded-xl border border-amber-300 shadow-sm mb-10 text-center">
                <p className="text-amber-800 font-medium">
                  Dengan berdonasi, Anda tidak hanya mendukung pengembangan aplikasi, tetapi juga berinvestasi dalam penyebaran ilmu Al-Quran kepada jutaan Muslim di Indonesia.
                </p>
              </div>
              
              <h2 id="informasi-rekening" className="text-3xl font-bold text-center text-amber-900 mt-12 mb-6 flex justify-center items-center">
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
              
              <h2 className="text-3xl font-bold text-center text-green-900 mt-12 mb-8 flex justify-center items-center relative">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-300 to-transparent top-1/2 transform -translate-y-1/2 opacity-50"></div>
                <div className="bg-gradient-to-r from-green-100 via-green-50 to-green-100 px-8 py-2 rounded-lg shadow-md border border-green-300 relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-600 mr-2">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                  </svg>
                  <span>Donasi Terkini</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-500 ml-2">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                </div>
              </h2>
              
              <div className="bg-gradient-to-br from-green-50 via-white to-amber-50 p-6 rounded-xl border-2 border-green-400 shadow-lg mb-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 -mt-10 -mr-10 bg-green-400 opacity-5 rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 -mb-20 -ml-20 bg-green-500 opacity-5 rounded-full animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-amber-400 opacity-5 rounded-full animate-ping" style={{animationDuration: '5s'}}></div>
                <div className="absolute top-1/3 right-1/4 w-16 h-16 border-2 border-dashed border-green-300 opacity-20 rounded-full animate-spin" style={{animationDuration: '15s'}}></div>
                <div className="absolute bottom-1/4 right-1/3 w-24 h-24 border border-amber-300 opacity-10 rounded-full animate-ping" style={{animationDuration: '7s', animationDelay: '2s'}}></div>
                
                {/* Top decorative corner elements */}
                <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-0 left-0 w-[2px] h-8 bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="absolute top-0 left-0 w-8 h-[2px] bg-gradient-to-r from-green-500 to-transparent"></div>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-0 right-0 w-[2px] h-8 bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-8 h-[2px] bg-gradient-to-l from-green-500 to-transparent"></div>
                </div>
                
                {/* Bottom decorative corner elements */}
                <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-gradient-to-t from-amber-500 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-gradient-to-r from-amber-500 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-gradient-to-t from-amber-500 to-transparent"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-gradient-to-l from-amber-500 to-transparent"></div>
                </div>
                
                <div className="mb-4 border-b-2 border-green-200 pb-4 relative z-10">
                  <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center justify-center bg-white inline-block px-4 py-2 rounded-lg shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                    <span className="bg-green-50 px-2 rounded mx-1">Donasi Masuk</span> 
                    <span className="bg-amber-100 px-2 rounded">{getMonthName(getCurrentMonthYear().month)} {getCurrentMonthYear().year}</span>
                  </h3>
                </div>
                
                <div className="overflow-x-auto relative z-10">
                  <div className="bg-white p-1 rounded-xl shadow-md border-2 border-green-200">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-green-100 to-green-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-green-800 font-bold border-b-2 border-green-200">Tanggal</th>
                          <th className="px-4 py-3 text-left text-green-800 font-bold border-b-2 border-green-200">Jumlah</th>
                          <th className="px-4 py-3 text-left text-green-800 font-bold border-b-2 border-green-200">Metode</th>
                          <th className="px-4 py-3 text-left text-green-800 font-bold border-b-2 border-green-200">Inisial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-100">
                        {donationData.currentMonth.length > 0 ? (
                          donationData.currentMonth.map((donation, index) => (
                            <tr key={donation.id} className={`hover:bg-green-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-green-50/30'}`}>
                              <td className="px-4 py-3 text-amber-800">{new Date(donation.donation_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                              <td className="px-4 py-3 font-medium">
                                <span className="bg-green-50 px-2 py-0.5 rounded text-green-800 font-semibold">{formatCurrency(donation.amount)}</span>
                              </td>
                              <td className="px-4 py-3 text-amber-800">{donation.method}</td>
                              <td className="px-4 py-3 text-amber-800 font-medium">{donation.donor_initial}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center">
                              <div className="flex flex-col items-center justify-center py-6">
                                <div className="mb-5 p-4 bg-white rounded-full shadow-md border-2 border-green-200 relative">
                                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 to-amber-100 opacity-30 animate-pulse"></div>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                                <h4 className="text-xl font-bold text-green-800 mb-2">Belum Ada Donasi Bulan Ini</h4>
                                <p className="text-amber-700 text-center mb-4 max-w-sm">Jadilah yang pertama mendukung pengembangan Al-Quran Indonesia bulan ini</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  <Link href="#informasi-rekening" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                    </svg>
                                    Donasi Sekarang
                                  </Link>
                                  <Link href="#alokasi-dana" className="inline-flex items-center px-4 py-2 bg-white border border-green-500 text-green-600 rounded-lg shadow-sm hover:bg-green-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                    Lihat Alokasi Dana
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {donationData.currentMonth.length > 0 && (
                        <tfoot className="bg-gradient-to-r from-green-100 to-green-50 border-t-2 border-green-200">
                          <tr>
                            <td className="px-4 py-4 font-bold text-green-800">Total</td>
                            <td className="px-4 py-4">
                              {donationData.monthlyDonations.length > 0 && 
                                <div className="text-xl font-bold text-green-800 bg-white px-3 py-1 rounded-md inline-block border border-green-200 shadow-sm">
                                  {formatCurrency(donationData.monthlyDonations[0].total_amount)}
                                </div>
                              }
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
                
                <div id="alokasi-dana" className="mt-4 bg-white p-4 rounded-lg border border-amber-200">
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
                  
                  <div className="overflow-x-auto relative z-10">
                    <div className="bg-white p-1 rounded-xl shadow-md border-2 border-amber-300">
                      <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-gradient-to-r from-amber-100 to-amber-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-amber-800 font-bold border-b-2 border-amber-200">Bulan</th>
                            <th className="px-4 py-3 text-left text-amber-800 font-bold border-b-2 border-amber-200">Total Donasi</th>
                            <th className="px-4 py-3 text-left text-amber-800 font-bold border-b-2 border-amber-200">Jumlah Donatur</th>
                            <th className="px-4 py-3 text-left text-amber-800 font-bold border-b-2 border-amber-200">Rata-rata</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100">
                          {donationData.monthlyDonations.length > 0 ? (
                            donationData.monthlyDonations.map((monthData, index) => (
                              <tr key={`${monthData.year}-${monthData.month}`} className={`hover:bg-amber-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}`}>
                                <td className="px-4 py-3 text-amber-800 font-medium">{getMonthName(monthData.month)}</td>
                                <td className="px-4 py-3">
                                  <span className="bg-amber-50 px-2 py-0.5 rounded text-amber-800 font-semibold">{formatCurrency(monthData.total_amount)}</span>
                                </td>
                                <td className="px-4 py-3 text-amber-800">
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1 text-amber-500">
                                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 01-.41-1.518c0-1.003.815-1.816 1.82-1.816.45 0 .863.152 1.194.407.324.253.683.374 1.15.374.45 0 .83-.13 1.147-.403a.75.75 0 01.834-.135 5.981 5.981 0 00.524.143A1.875 1.875 0 019 14.25v1.9a1.875 1.875 0 01-1.377 1.807A5.989 5.989 0 005.5 18.25H5c-.55 0-1-.45-1-1v-1a1 1 0 00-1-1h-.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.146-.354l.854-.853V9.5a.5.5 0 01.5-.5h.5a.5.5 0 01.5.5v.793l.854.853A.5.5 0 015 11.5a.565.565 0 01-.565.534.19.19 0 00-.125.031A18.977 18.977 0 015.5 12.67v-.24L4.5 11.5v-1a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1l-.5.5.5.5v.707l1.5 1.5V9.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v.24l1.003-.003a20.12 20.12 0 01-4.305 5.334.997.997 0 00-.388.654c0 .31.143.602.387.802A.866.866 0 017 16.6h.5v1.05a2.375 2.375 0 01-.318.17 5.111 5.111 0 01-2.395.603 4.337 4.337 0 01-2.086-.501 1.773 1.773 0 01-.75-1.465V15.33a3.5 3.5 0 00-.599-1.143.494.494 0 01.118-.693l.7-.5z" />
                                      <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15.5a.5.5 0 01.223.416v.229c0 .304-.145.588-.393.77a3.683 3.683 0 01-2.055.607c-.345.001-.682-.071-.99-.22a.493.493 0 01.08-.91h.112a4.42 4.42 0 003.038-1.54.5.5 0 01.632-.115l.353.232z" />
                                    </svg>
                                    {monthData.donor_count}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-amber-800">{formatCurrency(monthData.avg_donation)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center">
                                <div className="flex flex-col items-center justify-center text-amber-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                  <p className="font-medium text-lg">Belum ada data donasi untuk tahun ini</p>
                                  <p className="text-sm text-amber-500 mt-1">Data akan muncul setelah ada donasi masuk</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {donationData.yearlyTotal && donationData.yearlyTotal.total_amount > 0 && (
                          <tfoot className="bg-gradient-to-r from-amber-100 to-amber-50 border-t-2 border-amber-200">
                            <tr>
                              <td className="px-4 py-4 font-bold text-amber-800">Total {getCurrentMonthYear().year}</td>
                              <td className="px-4 py-4">
                                <div className="text-xl font-bold text-amber-800 bg-white px-3 py-1 rounded-md inline-block border border-amber-200 shadow-sm">
                                  {formatCurrency(donationData.yearlyTotal.total_amount)}
                                </div>
                              </td>
                              <td className="px-4 py-4 font-bold text-amber-800">{donationData.yearlyTotal.donor_count}</td>
                              <td className="px-4 py-4 font-bold text-amber-800">{formatCurrency(donationData.yearlyTotal.avg_donation)}</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                  
                  {/* Target comparison section removed */}
                </div>
                
                <p className="text-sm text-amber-700 mt-4 italic text-center">
                  *Catatan: Untuk privasi donatur, hanya inisial yang ditampilkan. Terima kasih atas dukungannya.
                </p>
              </div>
              
              <h2 className="text-3xl font-bold text-center text-amber-900 mt-12 mb-8 flex justify-center items-center relative">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent top-1/2 transform -translate-y-1/2 opacity-50"></div>
                <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 px-8 py-2 rounded-lg shadow-md border border-amber-300 relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-600 mr-2">
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                  </svg>
                  <span>Bentuk Dukungan Lainnya</span>
                </div>
              </h2>
              
              <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 p-6 rounded-xl border-2 border-amber-300 shadow-lg mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 -mt-10 -mr-10 bg-amber-400 opacity-5 rounded-full animate-pulse" style={{animationDuration: '4s'}}></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 -mb-20 -ml-20 bg-amber-500 opacity-5 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
                
                <p className="mb-6 text-center text-lg text-amber-800">
                  Selain donasi finansial, Anda juga dapat mendukung pengembangan Al-Quran Indonesia melalui:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="bg-white p-5 rounded-xl border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow flex flex-col relative group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-t-lg"></div>
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-amber-800 mb-3 text-center">Doa</h3>
                    <p className="text-amber-700 flex-grow text-center">
                      Dukung kami dengan doa agar aplikasi ini terus memberi manfaat dan menjadi amal jariyah bagi semua yang terlibat.
                    </p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow flex flex-col relative group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-t-lg"></div>
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-amber-800 mb-3 text-center">Feedback</h3>
                    <p className="text-amber-700 flex-grow text-center">
                      Berikan saran, kritik, dan ide pengembangan melalui halaman kontak atau email kami.
                    </p>
                    <div className="mt-4 text-center">
                      <Link href="/kontak" className="inline-flex items-center px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Kirim Feedback
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow flex flex-col relative group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-t-lg"></div>
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-amber-800 mb-3 text-center">Bagikan</h3>
                    <p className="text-amber-700 flex-grow text-center">
                      Bantu sebarkan informasi tentang aplikasi ini kepada keluarga, teman, dan komunitas Anda.
                    </p>
                  </div>
                </div>
                
                <div className="text-center mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800">
                    Setiap bentuk dukungan yang Anda berikan sangat berarti bagi keberlanjutan dan pengembangan aplikasi Al-Quran Indonesia.
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-10 mb-8 max-w-3xl mx-auto">
                <p className="text-amber-900 text-xl font-bold mb-4">
                  Jazakumullah khairan katsiran atas dukungan Anda
                </p>
                <div className="bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 p-6 rounded-xl border border-amber-300 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-amber-400 mx-auto mb-3">
                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-amber-800 italic text-lg relative leading-relaxed">
                    <span className="absolute -left-2 -top-2 text-4xl text-amber-300 opacity-50">"</span>
                    Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai; pada setiap tangkai terdapat seratus biji. Allah melipatgandakan bagi siapa yang Dia kehendaki. Dan Allah Mahaluas, Maha Mengetahui.
                    <span className="absolute -right-2 -bottom-2 text-4xl text-amber-300 opacity-50">"</span>
                  </p>
                  <p className="text-amber-600 font-medium mt-4">(QS. Al-Baqarah: 261)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
