'use client';

import UpsertAiCriteria from '@/components/criteria/UpsertAiCriteria';
import { CriteriaLookupList } from '@/types/criteria/criteria';
import Block from '@dodao/web-core/components/app/Block';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { PlusIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

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
            {data?.criteria.map((item) => (
              <tr key={item.industryGroupId} className="border">
                <td className="p-3 border text-left">{item.sectorName}</td>
                <td className="p-3 border text-left">{item.industryGroupName}</td>

                {/* AI Criteria Column */}
                <td className="p-3 border text-left">
                  <UpsertAiCriteria item={item} onPostUpsertAiCriteria={() => reFetchData()} />
                </td>

                {/* Custom Criteria Column */}
                <td className="p-3 border text-left">
                  <div className="flex items-center gap-2">
                    {!item.customCriteriaFileLocation ? (
                      <Link href={`/public-equities/common/${item.industryGroupId}/custom-criteria`}>
                        <PlusIcon width={20} height={20} className="ml-2 link-color cursor-pointer" />
                      </Link>
                    ) : (
                      <a href={item.customCriteriaFileLocation} className="link-color pointer-cursor ">
                        View Custom Criteria
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Block>
  );
}
