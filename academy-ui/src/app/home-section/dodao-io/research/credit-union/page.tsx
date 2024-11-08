import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CreditUnion from './credit-union.mdx';

export default async function RiskAnalysisPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <CreditUnion />
      </div>
    </PageWrapper>
  );
}
