import { Metadata } from 'next';
import React from 'react';

// The login page is a client component, so its metadata lives here. Without it the page inherited the
// site defaults (indexable, canonical = home page), and Google crawled `/login?callbackPath=…` links.
export const metadata: Metadata = {
  title: 'Log in | KoalaGains',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>;
}
