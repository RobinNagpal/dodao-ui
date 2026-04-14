import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import { EtfMorInfoOptionalWrapper } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/mor-info/route';
import EtfMorInfo from '@/components/etf-reportsv1/EtfMorInfo';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { notFound } from 'next/navigation';

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

async function fetchEtfData(exchange: string, etf: string): Promise<EtfFastResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}?allowNull=true`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as EtfFastResponse | null;
}

async function fetchMorInfo(exchange: string, etf: string): Promise<EtfMorInfoOptionalWrapper> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/exchange/${exchange}/${etf}/mor-info`;
  try {
    const res = await fetch(url);
    if (!res.ok) return { morAnalyzerInfo: null, morRiskInfo: null, morPeopleInfo: null, morPortfolioInfo: null };
    return (await res.json()) as EtfMorInfoOptionalWrapper;
  } catch {
    return { morAnalyzerInfo: null, morRiskInfo: null, morPeopleInfo: null, morPortfolioInfo: null };
  }
}

function JsonSection({ title, data }: { title: string; data: unknown }) {
  if (!data)
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-red-400">{title} — No Data</h3>
      </div>
    );
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-green-400">{title}</h3>
      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-300 max-h-96 overflow-y-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function FieldTable({ title, fields }: { title: string; fields: Record<string, unknown> }) {
  const entries = Object.entries(fields).filter(([k]) => !['id', 'etfId', 'createdAt', 'updatedAt'].includes(k));
  if (entries.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Field</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {entries.map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 text-sm font-mono text-gray-300">{key}</td>
                <td className="px-4 py-2 text-sm text-gray-200">
                  {value === null ? (
                    <span className="text-gray-500 italic">null</span>
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
    </div>
  );
}

export default async function EtfFinancialDataPage({ params }: { params: RouteParams }): Promise<JSX.Element> {
  const { exchange: rawExchange, etf: rawEtf } = await params;
  const exchange = rawExchange.toUpperCase();
  const etfSymbol = rawEtf.toUpperCase();

  const [etfData, morData] = await Promise.all([fetchEtfData(exchange, etfSymbol), fetchMorInfo(exchange, etfSymbol)]);

  if (!etfData) notFound();

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {etfData.name} ({etfData.symbol}) — Raw Financial Data
        </h1>
        <p className="text-sm text-gray-400 mt-1">
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

      <h2 className="text-xl font-bold mt-8 mb-4">Raw JSON Data</h2>
      <JsonSection title="EtfMorAnalyzerInfo" data={morData.morAnalyzerInfo} />
      <JsonSection title="EtfMorRiskInfo" data={morData.morRiskInfo} />
      <JsonSection title="EtfMorPeopleInfo" data={morData.morPeopleInfo} />
      <JsonSection title="EtfMorPortfolioInfo" data={morData.morPortfolioInfo} />
    </PageWrapper>
  );
}
