import { Portfolio } from '@/types/portfolio';
import { parseMarkdown } from '@/util/parse-markdown';

interface PortfolioDetailsProps {
  portfolio: Portfolio;
}

export default function PortfolioDetails({ portfolio }: PortfolioDetailsProps) {
  return (
    <div className="bg-surface rounded-lg py-6">
      <p className="text-body mb-4">{portfolio.summary}</p>

      <div className="text-body prose prose-invert max-w-none">
        {portfolio.detailedDescription ? (
          <div className="text-body markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(portfolio.detailedDescription) }} />
        ) : (
          <p className="text-muted italic">No detailed description provided.</p>
        )}
      </div>
    </div>
  );
}
