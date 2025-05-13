'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// No longer need the DecodedToken interface since token validation is done server-side

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null); // null means not checked yet
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Token reset password tidak valid atau hilang.');
      return;
    }

    // Client-side token validation
    const validateToken = async () => {
      try {
        const response = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.valid) {
          setEmail(data.email);
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(data.message || 'Token reset password tidak valid.');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenValid(false);
        setError('Token reset password tidak valid.');
      }
    };
    
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Password tidak sama. Silakan periksa kembali.');
      return;
    }

    if (password.length < 6) {
      setError('Password harus memiliki minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Reset password gagal');
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Reset password gagal. Silakan coba lagi.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while token is being checked
  if (tokenValid === null) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6] flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8D6E63]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-[#5D4037] text-center flex items-center justify-center">
        <svg className="w-7 h-7 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#5D4037">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Reset Password
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!tokenValid ? (
        <div className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6] text-center">
          <svg className="h-16 w-16 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold text-[#5D4037] mb-2">Link Tidak Valid</h2>
          <p className="text-[#5D4037] mb-4">
            Link reset password tidak valid atau sudah kedaluwarsa. Silakan meminta link reset password baru.
          </p>
          <Link 
            href="/login" 
            className="bg-[#8D6E63] text-white py-2 px-4 rounded-md hover:bg-[#6D4C41] transition-colors inline-block"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      ) : success ? (
        <div className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6] text-center">
          <svg className="h-16 w-16 text-green-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold text-[#5D4037] mb-2">Password Berhasil Direset</h2>
          <p className="text-[#5D4037] mb-4">
            Password Anda telah berhasil diubah. Sekarang Anda dapat login dengan password baru Anda.
          </p>
          <Link 
            href="/login" 
            className="bg-[#8D6E63] text-white py-2 px-4 rounded-md hover:bg-[#6D4C41] transition-colors inline-block"
          >
            Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6]">
          {email && (
            <div className="mb-4">
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded" role="alert">
                <p className="font-medium">Reset password untuk: {email}</p>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-[#5D4037] font-medium mb-2">Password Baru</label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-2 px-3 pl-10 border border-[#d3c6a6] rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none"
                autoFocus
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-[#5D4037]">
              Password harus minimal 6 karakter
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-[#5D4037] font-medium mb-2">Konfirmasi Password Baru</label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full py-2 px-3 pl-10 border border-[#d3c6a6] rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Link 
              href="/login"
              className="text-[#8D6E63] hover:underline"
            >
              Kembali ke Login
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#8D6E63] text-white py-2 px-4 rounded-md hover:bg-[#6D4C41] transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
