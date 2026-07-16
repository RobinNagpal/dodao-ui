import { parseMarkdown } from '@/util/parse-markdown';

interface BusinessAnalysisProps {
  summary: string | null;
  showBusinessAnalysis: boolean;
}

export default function BusinessAnalysis({ summary, showBusinessAnalysis }: BusinessAnalysisProps) {
  if (!showBusinessAnalysis || !summary || summary.trim() === '') {
    return null;
  }

  return (
    <div className="mb-1.5">
      <h5 className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Business & Moat Analysis</h5>
      <div
        className="text-xs text-body leading-snug markdown-body"
        dangerouslySetInnerHTML={{
          __html: parseMarkdown(summary),
        }}
      />
    </div>
  );
}
