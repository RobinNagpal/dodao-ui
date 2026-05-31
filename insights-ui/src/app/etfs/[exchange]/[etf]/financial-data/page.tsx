import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import { EtfMorInfoOptionalWrapper } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/mor-info/route';
import EtfMorInfo from '@/components/etf-reportsv1/EtfMorInfo';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ReportSection from '@/components/ui/sections/ReportSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { buildEtfReportSubpageBreadcrumbs } from '@/utils/etf-breadcrumbs-utils';
import { etfAndExchangeTag } from '@/utils/etf-cache-utils';
import { generateBreadcrumbJsonLdFromCrumbs } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

async function fetchEtfData(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}?allowNull=true`;
  const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
  if (!res.ok) return null;
  return (await res.json()) as EtfFastResponse | null;
}

async function fetchMorInfo(exchange: string, etf: string): Promise<EtfMorInfoOptionalWrapper> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}/mor-info`;
  try {
    const res = await fetch(url, { next: { revalidate: WEEK_IN_SECONDS, tags: [etfAndExchangeTag(etf, exchange)] } });
    if (!res.ok) return { morAnalyzerInfo: null, morRiskInfo: null, morPeopleInfo: null, morPortfolioInfo: null };
    return (await res.json()) as EtfMorInfoOptionalWrapper;
  } catch {
    return { morAnalyzerInfo: null, morRiskInfo: null, morPeopleInfo: null, morPortfolioInfo: null };
  }
}

function JsonSection({ title, data }: { title: string; data: unknown }) {
  if (!data)
    return (
      <ReportSection>
        <SectionHeading as="h3" size="sm" className="text-red-400 mb-2">
          {title} — No Data
        </SectionHeading>
      </ReportSection>
    );
  return (
    <ReportSection>
      <SectionHeading as="h3" size="sm" className="text-green-400 mb-2">
        {title}
      </SectionHeading>
      <pre className="bg-surface p-4 rounded-lg overflow-x-auto text-xs text-body max-h-96 overflow-y-auto">{JSON.stringify(data, null, 2)}</pre>
    </ReportSection>
  );
}

function FieldTable({ title, fields }: { title: string; fields: Record<string, unknown> }) {
  const entries = Object.entries(fields).filter(([k]) => !['id', 'etfId', 'createdAt', 'updatedAt'].includes(k));
  if (entries.length === 0) return null;
  return (
    <ReportSection>
      <SectionHeading as="h3" size="sm" className="mb-2">
        {title}
      </SectionHeading>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-2">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Field</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted uppercase">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 text-sm font-mono text-body">{key}</td>
                <td className="px-4 py-2 text-sm text-body">
                  {value === null ? (
                    <span className="text-muted italic">null</span>
                  ) : typeof value === 'object' ? (
                    <span className="text-blue-400">[JSON]</span>
                  ) : (
                    String(value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportSection>
  );
}

export default async function EtfFinancialDataPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const etfSymbol = rawEtf.toUpperCase();

  const [etfData, morData] = await Promise.all([fetchEtfData(exchange, etfSymbol), fetchMorInfo(exchange, etfSymbol)]);

  if (!etfData) notFound();

  const breadcrumbs = buildEtfReportSubpageBreadcrumbs({
    exchange,
    symbol: etfSymbol,
    fundCategory: etfData.stockAnalyzerInfo?.category,
    sectionName: 'Financial Data',
    sectionSlug: 'financial-data',
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLdFromCrumbs(breadcrumbs);

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />
      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-bold">
          {etfData.name} ({etfData.symbol}) — Raw Financial Data
        </h1>
        <p className="text-sm text-muted mt-1">
          Exchange: {etfData.exchange} | Inception: {etfData.inception || 'N/A'} | ID: {etfData.id}
        </p>
      </div>

      {etfData.financialInfo ? (
        <FieldTable title="EtfFinancialInfo" fields={etfData.financialInfo as unknown as Record<string, unknown>} />
      ) : (
        <JsonSection title="EtfFinancialInfo" data={null} />
      )}

      {etfData.stockAnalyzerInfo ? (
        <FieldTable title="EtfStockAnalyzerInfo" fields={etfData.stockAnalyzerInfo as unknown as Record<string, unknown>} />
      ) : (
        <JsonSection title="EtfStockAnalyzerInfo" data={null} />
      )}

      <EtfMorInfo data={morData} />

      <SectionHeading as="h2" weight="bold" className="mt-8 mb-4">
        Raw JSON Data
      </SectionHeading>
      <JsonSection title="EtfMorAnalyzerInfo" data={morData.morAnalyzerInfo} />
      <JsonSection title="EtfMorRiskInfo" data={morData.morRiskInfo} />
      <JsonSection title="EtfMorPeopleInfo" data={morData.morPeopleInfo} />
      <JsonSection title="EtfMorPortfolioInfo" data={morData.morPortfolioInfo} />
    </PageWrapper>
  );
}
