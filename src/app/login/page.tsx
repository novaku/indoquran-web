'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/profile');
    } catch (err) {
      setError('Login gagal. Periksa email dan password Anda.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-[#5D4037] text-center flex items-center justify-center">
        <img src="/icons/login-icon.svg" alt="Login" className="w-7 h-7 mr-2" />
        Masuk ke Akun Anda
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-[#f8f4e5] p-6 rounded-lg shadow-md border border-[#d3c6a6]">
        <div className="mb-4">
          <label htmlFor="email" className="block text-[#5D4037] font-medium mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-2 px-3 border border-[#d3c6a6] rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-[#5D4037] font-medium mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full py-2 px-3 border border-[#d3c6a6] rounded-md focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none"
          />
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
    </div>
  );
}