'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

interface User {
  user_id: string;
  username: string;
  email: string;
}

function useAuth() {
  const { data: session, status } = useSession();
  
  // Format the user data to maintain compatibility with existing code
  const user = session?.user ? {
    user_id: session.user.id as string || '',
    username: session.user.name || '',
    email: session.user.email || '',
  } : null;
  
  const loading = status === 'loading';

  // Login function that uses NextAuth signIn
  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  }, []);

  // Request password reset for a user
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }
      
      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }, []);
  
  // For backward compatibility - redirects to login page instead
  const createTempUser = useCallback(async () => {
    await signIn(undefined, { callbackUrl: '/profile' });
    return null;
  }, []);

  // Register a new user
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/' });
  }, []);

  return {
    user,
    loading,
    login,
    register,
    forgotPassword,
    createTempUser,
    logout,
    isAuthenticated: status === 'authenticated'
  };
}

export default useAuth;
