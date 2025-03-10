'use client';

import UpsertAiCriteria from '@/components/criteria/UpsertAiCriteria';
import UpsertCustomCriteria from '@/components/criteria/UpsertCustomCriteria';
import { CriteriaLookupItem, CriteriaLookupList } from '@/types/public-equity/criteria-types';
import Block from '@dodao/web-core/components/app/Block';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';

const CRITERIA_URL = 'https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/custom-criterias.json';

export default function CriteriaLookupTable() {
  const { data, loading, reFetchData } = useFetchData<CriteriaLookupList>(CRITERIA_URL, {}, 'Failed to fetch spaces');

  return (
    <Block title="Industry Groups & Criteria" className="font-semibold text-color">
      {loading ? (
        <FullPageLoader />
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr>
              <th className="p-3 border text-left">Sector</th>
              <th className="p-3 border text-left">Industry Group</th>
              <th className="p-3 border text-left">AI Criteria</th>
              <th className="p-3 border text-left">Custom Criteria</th>
            </tr>
          </thead>
          <tbody>
            {data?.criteria.map((item: CriteriaLookupItem) => (
              <tr key={item.industryGroupId} className="border">
                <td className="p-3 border text-left">{item.sectorName}</td>
                <td className="p-3 border text-left">{item.industryGroupName}</td>

                {/* AI Criteria Column */}
                <td className="p-3 border text-left">
                  <UpsertAiCriteria item={item} onPostUpsertAiCriteria={() => reFetchData()} />
                </td>

                {/* Custom Criteria Column */}
                <td className="p-3 border text-left">
                  <UpsertCustomCriteria item={item} onPostUpsertCustomCriteria={() => reFetchData()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Block>
  );
}
