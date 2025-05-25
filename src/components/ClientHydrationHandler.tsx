'use client';

import React from 'react';

export default function ClientHydrationHandler({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      {children}
    </html>
  );
}
