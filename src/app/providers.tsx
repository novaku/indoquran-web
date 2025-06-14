'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRef, type ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { NextAuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: ReactNode }) {
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClientRef.current}>
        <NextAuthProvider>
          <ToastProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ToastProvider>
        </NextAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}