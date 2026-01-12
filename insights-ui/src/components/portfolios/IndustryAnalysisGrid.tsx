import Link from 'next/link';
import { IndustryByCountry } from '@/types/portfolio';
import { getCountryCodeForSearchBarDisplay } from '@/utils/countryExchangeUtils';

interface IndustryAnalysisGridProps {
  industriesByCountry: IndustryByCountry[];
  portfolioManagerId: string;
}

export default function IndustryAnalysisGrid({ industriesByCountry, portfolioManagerId }: IndustryAnalysisGridProps) {
  if (!industriesByCountry || industriesByCountry.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
        <p className="text-gray-400">No industry analysis data available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {industriesByCountry.map((item) => {
        const countryCode = getCountryCodeForSearchBarDisplay(item.country);

        return (
          <Link
            key={`${item.industry.industryKey}-${item.country}`}
            href={`/portfolio-managers/profile-details/${portfolioManagerId}/analysis/${item.country}/${item.industry.industryKey}`}
            className="bg-gray-900 rounded-lg p-5 transition-all border border-gray-800 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 group"
          >
            <div className="flex flex-col h-full">
              {/* Industry Name */}
              <h3 className="text-base font-semibold text-blue-400 transition-colors mb-2 line-clamp-2">{item.industry.name}</h3>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs pt-3 border-t border-gray-800">
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded">{countryCode}</span>
                </div>
                {item.favoriteCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-gray-300">{item.favoriteCount}</span>
                  </div>
                )}
                {item.notesCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">📝</span>
                    <span className="text-gray-300">{item.notesCount}</span>
                  </div>
                )}
                <div className="ml-auto">
                  <span className="text-blue-400 transition-colors text-sm font-medium">View →</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
