import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import RiskAnalysis from './risk-analysis.mdx';

export default async function RiskAnalysisPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <RiskAnalysis />
      </div>
    </PageWrapper>
  );
}
