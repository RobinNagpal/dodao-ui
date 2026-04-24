import { EtfInvestor } from '@/types/etf/etf-analysis-types';
import EtfInvestorCard from './EtfInvestorCard';

export default function EtfInvestorListingGrid({ investors }: { investors: EtfInvestor[] }): JSX.Element {
  if (investors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#E5E7EB] text-lg">No investor types defined yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {investors.map((investor) => (
        <EtfInvestorCard key={investor.key} investor={investor} />
      ))}
    </div>
  );
}
