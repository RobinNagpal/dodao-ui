import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import EducationalContent from './educational-content.mdx';

export default async function RiskAnalysisPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <EducationalContent />
      </div>
    </PageWrapper>
  );
}
