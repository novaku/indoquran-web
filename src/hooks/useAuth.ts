'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

interface User {
  user_id: string;
  username: string;
  email: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  
  // Format the user data to maintain compatibility with existing code
  const user = session?.user ? {
    user_id: session.user.id as string || '',
    username: session.user.name || '',
    email: session.user.email || '',
  } : null;
  
  const loading = status === 'loading';

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
    createTempUser,
    logout,
    isAuthenticated: status === 'authenticated'
  };
}
