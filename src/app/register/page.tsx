'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import LazyLoadImage from '@/components/LazyLoadImage';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  // Function to validate email format
  const isValidEmail = (email: string): boolean => {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  // Function to check password strength
  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; message: string } => {
    if (!password) {
      return { strength: 'weak', message: 'Password diperlukan' };
    }
    
    if (password.length < 6) {
      return { strength: 'weak', message: 'Terlalu pendek (min. 6 karakter)' };
    }
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const strength = 
      (hasLowerCase && hasUpperCase && (hasNumbers || hasSpecialChars) && password.length >= 8) ? 'strong' :
      (hasLowerCase && (hasUpperCase || hasNumbers || hasSpecialChars) && password.length >= 6) ? 'medium' :
      'weak';
      
    const message = 
      strength === 'strong' ? 'Password kuat' :
      strength === 'medium' ? 'Password cukup baik' :
      'Password lemah';
    
    return { strength, message };
  };
  
  // Function to check if all fields are valid
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Nama harus diisi');
      return false;
    } else if (name.trim().length < 2) {
      setError('Nama terlalu pendek (min. 2 karakter)');
      return false;
    }
    
    if (!email.trim()) {
      setError('Email harus diisi');
      return false;
    } else if (!isValidEmail(email)) {
      setError('Format email tidak valid (contoh: nama@domain.com)');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      await register(name, email, password);
      setSuccess(true);
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err: any) {
      const errorMsg = err.message || 'Pendaftaran gagal, silakan coba lagi.';
      
      // Check if email is already registered
      if (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('terdaftar')) {
        // Show temporary message
        setError('Email ini sudah terdaftar. Mengalihkan Anda ke halaman login...');
        
        // Redirect to login page with email prefilled after a short delay
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else if (errorMsg.toLowerCase().includes('server')) {
        setError('Terjadi masalah pada server. Silakan coba beberapa saat lagi.');
      } else if (errorMsg.toLowerCase().includes('network')) {
        setError('Masalah koneksi internet. Periksa koneksi Anda dan coba lagi.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#5D4037] text-center flex items-center justify-center">
        <LazyLoadImage src="/icons/login-icon.svg" alt="Register" width={28} height={28} className="w-7 h-7 mr-2" />
        Daftar Akun Baru
      </h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4" role="alert">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">Pendaftaran gagal</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4" role="alert">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">Pendaftaran berhasil!</p>
              <p className="mt-1 text-sm">Akun Anda telah dibuat. Anda akan dialihkan ke halaman login dalam beberapa detik...</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6]">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-5 text-sm">
          <p className="font-medium text-blue-700 mb-2">Petunjuk Pendaftaran:</p>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Semua kolom wajib diisi</li>
            <li>Email harus dalam format valid (contoh: nama@domain.com)</li>
            <li>Password minimal 6 karakter</li>
            <li>Konfirmasi password harus sama dengan password</li>
          </ul>
        </div>
      
        <div className="mb-4">
          <label htmlFor="name" className="block text-[#5D4037] font-medium mb-2">
            Nama <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-required="true"
            className={`w-full py-2 px-3 border ${
              !name.trim() ? 'border-amber-300' : 
              name.trim().length < 2 ? 'border-red-400' : 
              'border-[#d3c6a6]'
            } rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none`}
            placeholder="Masukkan nama lengkap"
            minLength={2}
          />
          {name && name.trim().length < 2 && (
            <p className="text-xs text-red-500 mt-1">Nama terlalu pendek (min. 2 karakter)</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-[#5D4037] font-medium mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            className={`w-full py-2 px-3 border ${email && !isValidEmail(email) ? 'border-red-500' : 'border-[#d3c6a6]'} rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none`}
            placeholder="contoh@email.com"
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
          />
          {email && !isValidEmail(email) && (
            <p className="text-xs text-red-500 mt-1">Format email tidak valid</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-[#5D4037] font-medium mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            minLength={6}
            className={`w-full py-2 px-3 border ${password && password.length < 6 ? 'border-red-500' : 'border-[#d3c6a6]'} rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none`}
            placeholder="Minimal 6 karakter"
          />
          
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Kekuatan Password:</span>
                <span className={`text-xs ${
                  getPasswordStrength(password).strength === 'strong' ? 'text-green-600' :
                  getPasswordStrength(password).strength === 'medium' ? 'text-amber-600' :
                  'text-red-600'
                }`}>{getPasswordStrength(password).message}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${
                  getPasswordStrength(password).strength === 'strong' ? 'bg-green-500 w-full' :
                  getPasswordStrength(password).strength === 'medium' ? 'bg-amber-500 w-2/3' :
                  'bg-red-500 w-1/3'
                } transition-all duration-300`}></div>
              </div>
              
              {password.length < 6 && (
                <p className="text-xs text-red-500 mt-1">Password terlalu pendek (min. 6 karakter)</p>
              )}
              
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li className={`flex items-center ${password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                  <svg className={`h-3 w-3 mr-1 ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    {password.length >= 6 ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    ) : (
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    )}
                  </svg>
                  Minimal 6 karakter
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <svg className={`h-3 w-3 mr-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    {/[A-Z]/.test(password) ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    ) : (
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    )}
                  </svg>
                  Mengandung huruf kapital
                </li>
                <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <svg className={`h-3 w-3 mr-1 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    {/\d/.test(password) ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    ) : (
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    )}
                  </svg>
                  Mengandung angka
                </li>
              </ul>
            </div>
          )}
          
          {!password && (
            <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-[#5D4037] font-medium mb-2">
            Konfirmasi Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-required="true"
              className={`w-full py-2 px-3 border ${confirmPassword && password !== confirmPassword ? 'border-red-500' : confirmPassword && password === confirmPassword ? 'border-green-500' : 'border-[#d3c6a6]'} rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none`}
              placeholder="Masukkan ulang password"
            />
            {confirmPassword && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {password === confirmPassword ? (
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="text-xs text-green-500 mt-1">Password cocok</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-[#8D6E63] to-[#795548] text-white py-3 px-4 rounded-md hover:from-[#7D5E53] hover:to-[#694538] transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:ring-opacity-50 shadow-md ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memproses...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span>Daftar</span>
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-[#5D4037]">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#8D6E63] hover:underline">
              Masuk disini
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}