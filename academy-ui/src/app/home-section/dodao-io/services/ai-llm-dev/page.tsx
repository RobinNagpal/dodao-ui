import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import AiLlmDev from './ai-llm-dev.mdx';

export default async function RiskAnalysisPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <AiLlmDev />
      </div>
    </PageWrapper>
  );
}
