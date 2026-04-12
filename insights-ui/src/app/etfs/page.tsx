import EtfListingGrid from '@/components/etfs/EtfListingGrid';
import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import { EtfListingResponse, EtfListingItem } from '@/app/api/[spaceId]/etfs-v1/listing/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { prisma } from '@/prisma';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

const DEFAULT_PAGE_SIZE = 32;

export const metadata = {
  title: 'US ETFs - Exchange Traded Funds Analysis | KoalaGains',
  description:
    'Explore US ETFs with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights. Filter by AUM, P/E ratio, payout frequency, and more.',
};

function toEtfListingItem(etf: any): EtfListingItem {
  return {
    id: etf.id,
    symbol: etf.symbol,
    name: etf.name,
    exchange: etf.exchange,
    aum: etf.financialInfo?.aum ?? null,
    expenseRatio: etf.financialInfo?.expenseRatio ?? null,
    pe: etf.financialInfo?.pe ?? null,
    sharesOut: etf.financialInfo?.sharesOut ?? null,
    dividendTtm: etf.financialInfo?.dividendTtm ?? null,
    dividendYield: etf.financialInfo?.dividendYield ?? null,
    payoutFrequency: etf.financialInfo?.payoutFrequency ?? null,
    holdings: etf.financialInfo?.holdings ?? null,
    beta: etf.financialInfo?.beta ?? null,
    hasMorAnalyzerInfo: !!etf.morAnalyzerInfo,
    hasMorRiskInfo: !!etf.morRiskInfo,
    hasMorPeopleInfo: !!etf.morPeopleInfo,
  };
}

export default async function EtfsPage() {
  let data: EtfListingResponse = { etfs: [], totalCount: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1, filtersApplied: false };

  try {
    const [etfs, totalCount] = await Promise.all([
      prisma.etf.findMany({
        where: { spaceId: KoalaGainsSpaceId },
        include: {
          financialInfo: true,
          morAnalyzerInfo: { select: { id: true } },
          morRiskInfo: { select: { id: true } },
          morPeopleInfo: { select: { id: true } },
        },
        orderBy: [{ symbol: 'asc' }],
        skip: 0,
        take: DEFAULT_PAGE_SIZE,
      }),
      prisma.etf.count({ where: { spaceId: KoalaGainsSpaceId } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));

    data = {
      etfs: etfs.map(toEtfListingItem),
      totalCount,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalPages,
      filtersApplied: false,
    };
  } catch (e) {
    console.error('Failed to fetch ETF listing:', e);
  }

  return (
    <EtfPageLayout
      title="US ETFs"
      description="Explore US exchange-traded funds with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights."
    >
      <EtfListingGrid data={data} />
    </EtfPageLayout>
  );
}
