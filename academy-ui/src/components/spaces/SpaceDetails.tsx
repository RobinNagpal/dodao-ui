'use client';

import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import TabsWithUnderline, { TabItem } from '@dodao/web-core/components/core/tabs/TabsWithUnderline';
import ConsolidatedByteRatings from '@/components/spaces/Ratings/ConsolidatedByteRatings';
import ConsolidatedGuideRatings from '@/components/spaces/Ratings/ConsolidatedGuideRatings';
import SpaceAuthDetails from '@/components/spaces/View/SpaceAuthDetails';
import SpaceBasicDetails from '@/components/spaces/View/SpaceBasicDetails';
import SpaceByteDetails from '@/components/spaces/View/SpaceByteDetails';
import SpaceCourseDetails from '@/components/spaces/View/SpaceCoursesDetails';
import SpaceDomaiDetails from '@/components/spaces/View/SpaceDomaiDetails';
import SpaceGuideDetails from '@/components/spaces/View/SpaceGuideDetails';
import SpaceSocialDetails from '@/components/spaces/View/SpaceSocialDetails';
import SpaceThemeDetails from '@/components/spaces/View/SpaceThemeDetails';
import { Space } from '@/graphql/generated/generated-types';
import React, { useEffect, useRef, useState } from 'react';
import SpaceTidbitsHomepageDetails from './View/SpaceTidbitsHomepageDetails';
interface SpaceDetailsProps {
  spaceId: string;
}

enum TabIds {
  Basic = 'Basic',
  Content = 'Courses',
}

interface SpaceDetails {
  space: Space;
  status: string;
}

export default function SpaceDetails(props: SpaceDetailsProps) {
  const tabs: TabItem[] = [
    {
      id: TabIds.Basic,
      label: 'Basic',
    },

    {
      id: TabIds.Content,
      label: 'Content',
    },
  ];
  const [data, setData] = useState<SpaceDetails | null>(null);
  useEffect(() => {
    async function getSpaceById() {
      const response = await fetch(`/api/spaces/${props.spaceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const res = await response.json();
        setData(res);
      }
    }
    getSpaceById();
  }, [props.spaceId]);

  const [selectedTabId, setSelectedTabId] = useState(TabIds.Basic);

  return data?.space ? (
    <div>
      <div className="flex justify-end">
        <TabsWithUnderline selectedTabId={selectedTabId} setSelectedTabId={(id) => setSelectedTabId(id as TabIds)} tabs={tabs} className="w-96" />
      </div>
      {selectedTabId === TabIds.Basic && (
        <div className="flex flex-col gap-y-28 divide-gray-300">
          <SpaceBasicDetails space={data.space} className="pt-6" />
          <SpaceAuthDetails space={data.space} />
          <SpaceDomaiDetails space={data.space} />
          <SpaceSocialDetails space={data.space} />
          <SpaceTidbitsHomepageDetails space={data.space} />
          <SpaceThemeDetails space={data.space} />
          <ConsolidatedGuideRatings space={data.space} />
          <ConsolidatedByteRatings space={data.space} />
        </div>
      )}
      {selectedTabId === TabIds.Content && (
        <div className="flex flex-col  gap-y-10 divide-gray-300">
          <SpaceCourseDetails space={data.space} className="pt-6" />
          <SpaceGuideDetails space={data.space} />
          <SpaceByteDetails space={data.space} />
        </div>
      )}
    </div>
  ) : (
    <PageLoading />
  );
}
