'use client';

import { ReactNode } from 'react';
import { NewsDataProvider } from './NewsDataProvider';

interface NewsDataProviderWrapperProps {
  children: ReactNode;
}

export function NewsDataProviderWrapper({ children }: NewsDataProviderWrapperProps) {
  return <NewsDataProvider>{children}</NewsDataProvider>;
}
