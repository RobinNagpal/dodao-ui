'use client';

import Link from 'next/link';

import { Container } from '@/components/home-page/Container';
import { GridPattern } from '@/components/home-page/GridPattern';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="relative flex flex-auto items-center">
      <div className="absolute inset-0 -z-10 text-slate-900/10 [mask-image:linear-gradient(transparent,white,transparent)]">
        <GridPattern x="50%" y="50%" patternTransform="translate(0 60)" />
      </div>
      <Container className="flex flex-col items-center py-16 text-center sm:py-20 lg:py-32">
        <p className="rounded-full px-4 py-1 text-base font-medium tracking-tight text-slate-900 ring-1 ring-slate-900 ring-inset">Error</p>
        <h1 className="mt-6 font-display text-5xl font-extrabold text-slate-900 sm:text-6xl">Something went wrong</h1>
        <p className="mt-4 text-lg tracking-tight text-slate-700">We’re experiencing technical difficulties. Please try again later.</p>
        <Link href="/" className="mt-6 text-base font-medium text-blue-600 hover:text-blue-800">
          Go back home <span aria-hidden="true">&rarr;</span>
        </Link>
      </Container>
    </div>
  );
}
