import KoalaGainsLogo from '@/components/ui/KoalaGainsLogo';
import Link from 'next/link';
import React from 'react';

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: 'Research',
    links: [
      { name: 'Stock Reports', href: '/stocks' },
      { name: 'ETF Reports', href: '/etfs' },
      { name: 'Commodities', href: '/commodities' },
      { name: 'Stock Scenarios', href: '/stock-scenarios' },
      { name: 'ETF Scenarios', href: '/etf-scenarios' },
    ],
  },
  {
    title: 'Markets',
    links: [
      { name: 'Top Gainers & Losers', href: '/daily-top-movers' },
      { name: 'Top Gainers (US)', href: '/daily-top-movers/top-gainers/country/US' },
      { name: 'Top Losers (US)', href: '/daily-top-movers/top-losers/country/US' },
    ],
  },
  {
    title: 'Tariffs',
    links: [
      { name: 'Tariff Reports', href: '/tariff-reports' },
      { name: 'Tariff Calculator', href: '/tariff-calculator' },
      { name: 'HTS Codes', href: '/hts-codes' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', href: '/blogs' },
      { name: 'DoDAO', href: 'https://dodao.io', external: true },
    ],
  },
];

const socialLinks = [
  {
    name: 'X',
    href: 'https://twitter.com/dodao_io',
    path: 'M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/dodao/mycompany/',
    path: 'M0 0v24h24v-24h-24zm8 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.397-2.586 7-2.777 7 2.476v6.759z',
  },
];

const linkClass = 'text-sm text-muted transition-colors hover:text-heading';

/**
 * Site-wide link footer: brand blurb + social icons, four link columns covering every main
 * section, and a copyright / not-financial-advice bar. Rendered on the home page and the hub /
 * listing pages only — report pages end with their own `ReportFooter` instead. Colors are all
 * theme tokens, so it follows the light/dark switch.
 */
export default function SiteFooter(): React.JSX.Element {
  return (
    <footer aria-labelledby="site-footer-heading" className="border-t border-border bg-surface">
      <h2 id="site-footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-5">
            <Link href="/" aria-label="KoalaGains home" className="inline-block">
              <KoalaGainsLogo />
            </Link>
            <p className="max-w-xs text-sm leading-6 text-muted">
              AI-powered investment research on stocks, ETFs, commodities and US tariffs — clear scores and plain-English analysis.
            </p>
            <div className="flex gap-5">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-heading">
                  <span className="sr-only">{item.name}</span>
                  <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                    <path d={item.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-2">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-heading">{column.title}</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {link.name}
                        </a>
                      ) : (
                        <Link href={link.href} prefetch={false} className={linkClass}>
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            Copyright &copy; {new Date().getFullYear()} <span className="font-semibold text-heading">KoalaGains.com</span>. All rights reserved.
          </p>
          <p className="md:text-right">AI-generated research for informational purposes only — not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
