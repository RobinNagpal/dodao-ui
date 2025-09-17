import { Metadata } from 'next';
import ComparisonPageClient from './ComparisonPageClient';

export const metadata: Metadata = {
  title: 'Stock Comparison Tool | KoalaGains',
  description:
    'Compare up to 5 US stocks within the same industry or sub-industry. View detailed factor scores and see how each company ranks across key categories.',
  keywords: [
    'stock comparison',
    'compare stocks',
    'equity analysis',
    'investment research',
    'US stocks',
    'industry analysis',
    'sub-industry stocks',
    'KoalaGains tool',
  ],
  openGraph: {
    title: 'Stock Comparison Tool | KoalaGains',
    description: 'Compare up to 5 US stocks in the same sector. See pass/fail counts and in-depth analysis across Business, Financials, Growth, and more.',
    url: 'https://koalagains.com/stocks/comparison',
    siteName: 'KoalaGains',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Comparison Tool | KoalaGains',
    description: 'Compare up to 5 US stocks in the same sector with detailed factor analysis and scores.',
  },
  alternates: {
    canonical: 'https://koalagains.com/stocks/comparison',
  },
};

export default function ComparisonPage() {
  return <ComparisonPageClient />;
}
