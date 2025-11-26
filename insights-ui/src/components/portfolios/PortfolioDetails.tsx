import { Portfolio } from '@/types/portfolio';
import { parseMarkdown } from '@/util/parse-markdown';

interface PortfolioDetailsProps {
  portfolio: Portfolio;
}

export default function PortfolioDetails({ portfolio }: PortfolioDetailsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Portfolio Summary</h2>
      <p className="text-gray-300 mb-4">{portfolio.summary}</p>

      <h3 className="text-lg font-medium text-white mb-3">Detailed Description</h3>
      <div className="text-gray-300 prose prose-invert max-w-none">
        {portfolio.detailedDescription ? (
          <div className="text-gray-300 markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(portfolio.detailedDescription) }} />
        ) : (
          <p className="text-gray-500 italic">No detailed description provided.</p>
        )}
      </div>
    </div>
  );
}
