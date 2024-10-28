import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DefiAnalytics from './defi-analytics.mdx';

export default async function RiskAnalysisPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <DefiAnalytics />
      </div>
    </PageWrapper>
  );
}
