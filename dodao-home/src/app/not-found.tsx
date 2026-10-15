import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found | DoDAO',
  robots: { index: false, follow: true },
};

// Exported as out/404.html; CloudFront serves it (with a 404 status) for any missing object.
export default function NotFound() {
  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl py-24 text-center">
        <p className="text-base font-semibold text-primary">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-heading sm:text-5xl">Page not found</h1>
        <p className="mt-6 text-base leading-7 text-muted">Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Go back home
          </a>
          <a href="mailto:info@dodao.com" className="text-sm font-semibold text-link hover:underline">
            Contact us <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </PageWrapper>
  );
}
