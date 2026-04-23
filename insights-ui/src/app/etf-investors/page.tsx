import { Metadata } from 'next';
import EtfInvestorListingGrid from '@/components/etf-investors/EtfInvestorListingGrid';
import EtfInvestorPageLayout from '@/components/etf-investors/EtfInvestorPageLayout';
import { getInvestorTaxonomy } from '@/etf-analysis-data/etf-investor-taxonomy';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'ETF Investor Goals | KoalaGains',
  description:
    'A taxonomy of investor types — retail, HNW / family office, pension / endowment, insurance / treasury, RIA, hedge fund — and the specific goals each pursues when buying ETFs.',
};

export default async function EtfInvestorsPage() {
  const taxonomy = getInvestorTaxonomy();

  return (
    <EtfInvestorPageLayout
      title="ETF Investor Goals"
      description="Six non-overlapping investor types and the specific goals each pursues when buying ETFs. Click a goal to see its analysis angle, key considerations, and the recommended ETFs."
    >
      <EtfInvestorListingGrid investors={taxonomy.investors} />
    </EtfInvestorPageLayout>
  );
}
