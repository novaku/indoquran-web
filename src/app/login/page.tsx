'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectedFromRegister, setRedirectedFromRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, forgotPassword } = useAuth();
  
  // Check if the email parameter is present in the URL
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setRedirectedFromRegister(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/profile');
    } catch (err: any) {
      // Provide more specific error messages
      if (redirectedFromRegister) {
        setError('Login gagal. Password yang Anda masukkan tidak cocok dengan akun yang sudah terdaftar.');
      } else if (err.message?.toLowerCase().includes('credentials')) {
        setError('Email atau password salah. Silakan periksa kembali.');
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    try {
      // Call forgotPassword method from useAuth hook
      await forgotPassword(resetEmail);
      setResetEmailSent(true);
    } catch (err: any) {
      setResetError(err.message || 'Permintaan reset password gagal. Silakan coba lagi.');
      console.error(err);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-[#5D4037] text-center flex items-center justify-center">
        <img src="/icons/login-icon.svg" alt="Login" className="w-7 h-7 mr-2" />
        {showForgotPassword ? 'Reset Password' : 'Masuk ke Akun Anda'}
      </h1>
      
      {error && !showForgotPassword && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {redirectedFromRegister && !showForgotPassword && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-4" role="alert">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">Email ini sudah terdaftar</p>
              <p className="text-sm mt-1">Silakan masukkan password Anda untuk login ke akun yang sudah ada.</p>
            </div>
          </div>
        </div>
      )}
      
      {!showForgotPassword ? (
        <>
          <form onSubmit={handleSubmit} className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6]">
            <div className="mb-4">
              <label htmlFor="email" className="block text-[#5D4037] font-medium mb-2 flex items-center">
                Email
                {redirectedFromRegister && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Terisi otomatis
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full py-2 px-3 pl-10 border ${
                    redirectedFromRegister ? 'border-amber-400 bg-amber-50' : 'border-[#d3c6a6]'
                  } rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none`}
                  autoFocus={redirectedFromRegister}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${redirectedFromRegister ? 'text-amber-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
              {redirectedFromRegister && (
                <p className="mt-1 text-xs text-amber-600">
                  Gunakan email ini untuk login ke akun Anda yang sudah ada
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-[#5D4037] font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full py-2 px-3 pl-10 border border-[#d3c6a6] rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none"
                  autoFocus={!redirectedFromRegister} // Focus on password if not redirected, otherwise focus on the autofilled email
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {redirectedFromRegister && (
                <p className="mt-1 text-xs text-[#5D4037]">
                  Masukkan password akun Anda yang sudah terdaftar
                </p>
              )}
            </div>
            
            <div className="mb-4 text-right">
              <button 
                type="button" 
                onClick={() => {
                  setShowForgotPassword(true);
                  setResetEmail(email); // Pre-fill with current email if any
                }}
                className="text-[#8D6E63] text-sm hover:underline"
              >
                Lupa Password?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#8D6E63] text-white py-2 px-4 rounded-md hover:bg-[#6D4C41] transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
            
            <div className="mt-4 text-center">
              <p className="text-[#5D4037]">
                Belum punya akun?{' '}
                <Link href="/register" className="text-[#8D6E63] hover:underline">
                  Daftar disini
                </Link>
              </p>
            </div>
          </form>
        </>
      ) : (
        <>
          {resetEmailSent ? (
            <div className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6] text-center">
              <div className="flex justify-center mb-4">
                <svg className="h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#5D4037] mb-2">Email Terkirim</h2>
              <p className="text-[#5D4037] mb-4">
                Instruksi untuk reset password telah dikirim ke email <strong>{resetEmail}</strong>. 
                Silakan periksa kotak masuk email Anda dan ikuti panduan yang diberikan.
              </p>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                }}
                className="bg-[#8D6E63] text-white py-2 px-4 rounded-md hover:bg-[#6D4C41] transition-colors"
              >
                Kembali ke Halaman Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6]">
              {resetError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  <p>{resetError}</p>
                </div>
              )}
              
              <p className="text-[#5D4037] mb-4">
                Masukkan email yang terkait dengan akun Anda. Kami akan mengirimkan instruksi untuk reset password Anda.
              </p>
              
              <div className="mb-4">
                <label htmlFor="resetEmail" className="block text-[#5D4037] font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full py-2 px-3 pl-10 border border-[#d3c6a6] rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-[#8D6E63] hover:underline"
                >
                  Kembali ke Login
                </button>
                
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`bg-[#8D6E63] text-white py-2 px-4 rounded-md hover:bg-[#6D4C41] transition-colors ${
                    resetLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {resetLoading ? 'Mengirim...' : 'Kirim Instruksi Reset'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}