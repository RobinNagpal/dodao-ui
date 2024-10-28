import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SmartContract from './smart-contract.mdx';

export default async function RiskAnalysisPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <SmartContract />
      </div>
    </PageWrapper>
  );
}
