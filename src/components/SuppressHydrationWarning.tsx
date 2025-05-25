'use client';

import { useEffect, useState } from 'react';

// Component to suppress hydration errors caused by browser extensions
export default function SupressHydrationWarning({
  children
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{mounted ? children : children}</>;
}
