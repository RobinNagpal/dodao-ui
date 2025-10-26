'use client';

import { MissingFactorAnalysisForIndustry } from '@/app/api/[spaceId]/tickers-v1/missing-factor-analysis/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

interface MissingFactorAnalysisTableProps {
  rows: MissingFactorAnalysisForIndustry[];
}

function MissingFactorAnalysisTable({ rows }: MissingFactorAnalysisTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">Industry</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sub-Industry</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Business & Moat</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Financial Analysis</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Past Performance</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Future Growth</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Fair Value</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((row: MissingFactorAnalysisForIndustry, index) => (
            <tr key={`${row.industryKey}-${row.subIndustryKey}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-gray-800 z-10">
                <div>{row.industryName}</div>
                <div className="text-xs text-gray-400">{row.industryKey}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div>{row.subIndustryName}</div>
                <div className="text-xs text-gray-400">{row.subIndustryKey}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    row.businessAndMoatFactorsCount >= 5 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                  }`}
                >
                  {row.businessAndMoatFactorsCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    row.financialAnalysisFactorsCount >= 5 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                  }`}
                >
                  {row.financialAnalysisFactorsCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    row.pastPerformanceFactorsCount >= 5 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                  }`}
                >
                  {row.pastPerformanceFactorsCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${row.futureGrowthFactorsCount >= 5 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                >
                  {row.futureGrowthFactorsCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${row.fairValueFactorsCount >= 5 ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                >
                  {row.fairValueFactorsCount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MissingFactorAnalysisContainer(): JSX.Element {
  // Build URL for the API endpoint
  const apiUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/missing-factor-analysis`;

  // Fetch data using the useFetchData hook
  const { data, loading, error } = useFetchData<MissingFactorAnalysisForIndustry[]>(apiUrl, {}, 'Failed to fetch missing factor analysis');

  if (loading) {
    return <div className="py-8">Loading missing factor analysis...</div>;
  }

  if (error) {
    return <div className="py-4 text-red-500">Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="py-4">No industries/subindustries with missing factor analysis found.</div>;
  }

  return (
    <div className="mb-6">
      <div className="bg-gray-800 border border-red-500 rounded-lg p-4">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xl font-semibold">Industries/Subindustries with Less Than 5 Factor Analysis</h3>
          <span className="text-sm text-gray-400">Showing {data.length} industries/subindustries</span>
        </div>
        <MissingFactorAnalysisTable rows={data} />
      </div>
    </div>
  );
}
