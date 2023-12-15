import styles from './DefaultHome.module.scss';
import Link from 'next/link';
import React from 'react';

export function GetStartedButton({ children, href }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        'rounded-md px-6 py-3 md:px-24 md:py-4 lg:px-24 lg:py-4 text-2xl font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
        styles.getStartedButton
      }
    >
      {children}
    </Link>
  );
}
