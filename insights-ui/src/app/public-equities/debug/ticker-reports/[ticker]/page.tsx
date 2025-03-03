import TickerDetailsPage from '@/app/public-equities/debug/ticker-reports/[ticker]/TickerDetailsPage';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function Page({ params }: { params: Promise<{ ticker: string }> }) {
  const pageParams = await params;
  const { ticker } = pageParams;

  return (
    <PageWrapper>
      <TickerDetailsPage ticker={ticker} />
    </PageWrapper>
  );
}
