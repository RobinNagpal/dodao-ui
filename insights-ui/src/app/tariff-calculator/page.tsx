import CalculatorClient from './CalculatorClient';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'US Tariff Calculator | KoalaGains',
  description:
    'Estimate US import duties for any HTS code. Combines base HTSUS duty rates with Chapter 99 special tariffs (IEEPA, Section 232/301) plus HMF and MPF to give a per-line landed-cost breakdown.',
  alternates: { canonical: 'https://koalagains.com/tariff-calculator' },
  openGraph: {
    title: 'US Tariff Calculator | KoalaGains',
    description: 'Per-line landed-cost estimator for US imports — base HTSUS + Chapter 99 special tariffs + HMF/MPF.',
    url: 'https://koalagains.com/tariff-calculator',
    siteName: 'KoalaGains',
    type: 'website',
  },
  keywords: ['tariff calculator', 'HTS duty calculator', 'HTSUS', 'Section 301', 'IEEPA', 'landed cost', 'import duty'],
};

export default function TariffCalculatorPage() {
  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">US Tariff Calculator</h1>
          <p className="mt-2 text-sm opacity-80 max-w-3xl">
            Estimate US import duties on a 10-digit HTSUS line. The calculator looks up the base HTSUS rate plus every Chapter 99 special tariff that applies
            for the shipment&apos;s country of origin, mode of transport, and entry date — then layers in the Harbor Maintenance Fee and Merchandise Processing
            Fee for a landed-cost estimate.
          </p>
        </header>
        <CalculatorClient />
      </div>
    </PageWrapper>
  );
}
