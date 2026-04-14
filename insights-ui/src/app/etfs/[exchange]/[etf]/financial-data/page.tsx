import { prisma } from '@/prisma';
import EtfMorInfo from '@/components/etf-reportsv1/EtfMorInfo';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { notFound } from 'next/navigation';

type RouteParams = Promise<Readonly<{ exchange: string; etf: string }>>;

function JsonSection({ title, data }: { title: string; data: unknown }) {
  if (!data) return <div className="mb-6"><h3 className="text-lg font-semibold mb-2 text-red-400">{title} — No Data</h3></div>;
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-green-400">{title}</h3>
      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-300 max-h-96 overflow-y-auto">
        {JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)}
      </pre>
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
                  {value === null ? <span className="text-gray-500 italic">null</span> : typeof value === 'object' ? <span className="text-blue-400">[JSON]</span> : String(value)}
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
  const { exchange, etf: etfSymbol } = await params;

  const etf = await prisma.etf.findFirst({
    where: {
      spaceId: KoalaGainsSpaceId,
      symbol: etfSymbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
    include: {
      financialInfo: true,
      stockAnalyzerInfo: true,
      morAnalyzerInfo: true,
      morRiskInfo: true,
      morPeopleInfo: true,
      morPortfolioInfo: true,
    },
  });

  if (!etf) notFound();

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {etf.name} ({etf.symbol}) — Raw Financial Data
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Exchange: {etf.exchange} | Inception: {etf.inception || 'N/A'} | ID: {etf.id}
        </p>
        <a href={`/etfs/${exchange}/${etfSymbol}`} className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
          ← Back to ETF detail page
        </a>
      </div>

      {etf.financialInfo ? (
        <FieldTable title="EtfFinancialInfo" fields={etf.financialInfo as unknown as Record<string, unknown>} />
      ) : (
        <JsonSection title="EtfFinancialInfo" data={null} />
      )}

      {etf.stockAnalyzerInfo ? (
        <FieldTable title="EtfStockAnalyzerInfo" fields={etf.stockAnalyzerInfo as unknown as Record<string, unknown>} />
      ) : (
        <JsonSection title="EtfStockAnalyzerInfo" data={null} />
      )}

      <EtfMorInfo
        data={{
          morAnalyzerInfo: etf.morAnalyzerInfo,
          morRiskInfo: etf.morRiskInfo,
          morPeopleInfo: etf.morPeopleInfo,
          morPortfolioInfo: etf.morPortfolioInfo,
        }}
      />

      <h2 className="text-xl font-bold mt-8 mb-4">Raw JSON Data</h2>
      <JsonSection title="EtfMorAnalyzerInfo" data={etf.morAnalyzerInfo} />
      <JsonSection title="EtfMorRiskInfo" data={etf.morRiskInfo} />
      <JsonSection title="EtfMorPeopleInfo" data={etf.morPeopleInfo} />
      <JsonSection title="EtfMorPortfolioInfo" data={etf.morPortfolioInfo} />
    </PageWrapper>
  );
}
