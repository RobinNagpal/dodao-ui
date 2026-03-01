import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Dashboard - KoalaGains Simulations',
  description: 'Administration dashboard for managing simulations, users, and enrollments',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div>{children}</div>;
}
