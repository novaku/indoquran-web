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

  // For backward compatibility - redirects to login page instead
  const createTempUser = useCallback(async () => {
    await signIn(undefined, { callbackUrl: '/profile' });
    return null;
  }, []);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/' });
  }, []);

  return {
    user,
    loading,
    login,
    createTempUser,
    logout,
    isAuthenticated: status === 'authenticated'
  };
}

export default useAuth;
