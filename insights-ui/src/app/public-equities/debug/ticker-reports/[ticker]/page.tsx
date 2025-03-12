import TickerDetailsDebugPage from '@/app/public-equities/debug/ticker-reports/[ticker]/TickerDetailsDebugPage';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function Page({ params }: { params: Promise<{ ticker: string }> }) {
  const pageParams = await params;
  const { ticker } = pageParams;

  return (
    <PageWrapper>
      <TickerDetailsDebugPage ticker={ticker} />
    </PageWrapper>
  );
}
