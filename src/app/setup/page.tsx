'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

export default function InitDbPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');
  const { user, createTempUser } = useAuthContext();

  const initializeDb = async () => {
    setStatus('loading');
    setMessage('Initializing database...');
    
    try {
      const response = await axios.get('/api/initdb');
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
      } else {
        setStatus('error');
        setMessage(response.data.message);
        setDetails(response.data.details || '');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to initialize database');
      setDetails(error.response?.data?.details || error.message || '');
    }
  };

  const createDemoUser = async () => {
    if (user) return;
    
    try {
      await createTempUser();
    } catch (error) {
      console.error('Failed to create demo user:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-amber-800 mb-6">Database Setup</h1>
      
      <div className="bg-white p-6 rounded-lg border border-amber-200 shadow mb-6">
        <h2 className="text-xl font-semibold text-amber-700 mb-4">Database Connection Status</h2>
        
        {status === 'idle' && (
          <div>
            <p className="mb-4">Click the button below to check and initialize the database connection.</p>
            <button 
              onClick={initializeDb}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 mr-2"
            >
              Check & Initialize Database
            </button>
          </div>
        )}
        
        {status === 'loading' && (
          <div className="text-amber-700">
            <p>{message}</p>
            <div className="flex items-center mt-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-700"></div>
              <span className="ml-2">Please wait...</span>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-green-700 font-medium">{message}</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-amber-700 mb-2">Next Steps</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>The database connection is successfully established and all required tables are created.</li>
              <li>Create a user account to use the bookmark and favorite features.</li>
              <li>Browse the Quran and add bookmarks and favorites to verses.</li>
            </ol>
            
            <div className="mt-6 flex gap-4">
              <Link 
                href="/"
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Go to Homepage
              </Link>
              
              <button
                onClick={createDemoUser}
                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                disabled={!!user}
              >
                {user ? 'Demo User Created' : 'Create Demo User'}
              </button>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium">{message}</p>
                </div>
              </div>
            </div>
            
            {details && (
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                <h4 className="text-gray-700 font-semibold mb-2">Details:</h4>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">{details}</pre>
              </div>
            )}
            
            <p className="mt-4 text-gray-700">
              Please make sure:
            </p>
            <ul className="list-disc pl-5 mt-2 text-gray-700">
              <li>MySQL server is running</li>
              <li>The credentials (username: <code>root</code>, password: <code>root</code>) are correct</li>
              <li>The <code>indoquran_db</code> database exists or the user has permission to create it</li>
            </ul>
            
            <button 
              onClick={initializeDb}
              className="mt-6 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-amber-200">
        <h2 className="text-xl font-semibold text-amber-700 mb-4">Manual Setup</h2>
        <p className="mb-2">If the automatic setup doesn't work, you can manually set up the database:</p>
        
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Make sure MySQL is installed and running</li>
          <li>Create a database named <code>indoquran_db</code></li>
          <li>Run the following commands in your MySQL client:</li>
        </ol>
        
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 overflow-x-auto">
          <pre className="text-sm text-gray-600">
{`-- Create database
CREATE DATABASE IF NOT EXISTS indoquran_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE indoquran_db;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
  bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  surah_id INT NOT NULL,
  ayat_number INT NOT NULL,
  title VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_bookmark (user_id, surah_id, ayat_number)
);

CREATE TABLE IF NOT EXISTS favorites (
  favorite_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  surah_id INT NOT NULL,
  ayat_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, surah_id, ayat_number)
);

CREATE TABLE IF NOT EXISTS reading_positions (
  position_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  surah_id INT NOT NULL,
  ayat_number INT NOT NULL,
  last_read TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_position (user_id)
);`}
          </pre>
        </div>
        
        <p className="mt-4 text-gray-700">
          Or run the setup script from the terminal:
        </p>
        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
          <code className="text-sm">./setup-database.sh</code>
        </div>
      </div>
    </div>
  );
}
