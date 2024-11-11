import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import AiLlmDev from './ai-llm-dev.mdx';

export default async function AiLlmDevPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <AiLlmDev />
      </div>
    </PageWrapper>
  );
}
