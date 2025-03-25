import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CriterionDebugPage from './CriterionDebugPage';

export default async function Page({ params }: { params: Promise<{ ticker: string; criterion: string }> }) {
  const { ticker, criterion } = await params;

  return (
    <PageWrapper>
      <CriterionDebugPage ticker={ticker} criterionKey={criterion} />
    </PageWrapper>
  );
}
