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
    <div className="mb-2">
      <p className="text-xs font-medium text-gray-400 mb-1">Business & Moat Analysis:</p>
      <div
        className="text-xs text-gray-300 leading-relaxed markdown-body"
        dangerouslySetInnerHTML={{
          __html: parseMarkdown(summary),
        }}
      />
    </div>
  );
}
