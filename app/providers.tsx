'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import ToastProvider from '@/components/providers/ToastProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <ToastProvider />
    </SessionProvider>
  );
}