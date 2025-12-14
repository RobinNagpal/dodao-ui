import { parseMarkdown } from '@/util/parse-markdown';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

interface AnalysisDisplayProps {
  title: string;
  details?: string | null;
  breadcrumbs: BreadcrumbsOjbect[];
}

export default function AnalysisDisplay({ title, details, breadcrumbs }: AnalysisDisplayProps) {
  return (
    <PageWrapper>
      <div className="min-h-screen text-white">
        {/* Breadcrumbs */}
        <Breadcrumbs breadcrumbs={breadcrumbs} />

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>

        {/* Content */}
        {details ? (
          <div className="prose prose-invert max-w-none">
            <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(details) }} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No detailed analysis available yet.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
