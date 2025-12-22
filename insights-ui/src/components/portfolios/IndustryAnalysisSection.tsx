import { ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { IndustryByCountry } from '@/types/portfolio';
import { getCountryCodeForSearchBarDisplay } from '@/utils/countryExchangeUtils';

interface IndustryAnalysisSectionProps {
  industriesByCountry: IndustryByCountry[];
  portfolioManagerId: string;
}

export default function IndustryAnalysisSection({ industriesByCountry, portfolioManagerId }: IndustryAnalysisSectionProps) {
  if (!industriesByCountry || industriesByCountry.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-blue-500" />
          Analysis & Favourites - by Industry
        </h2>
        <p className="text-gray-400 mt-1">Industries where this portfolio manager has analyzed stocks or marked favorites</p>
      </div>

      {/* Industries Grid */}
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
    </div>
  );
}
