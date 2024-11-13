'use client';

import ConsolidatedByteRatings from '@/components/spaces/Ratings/ConsolidatedByteRatings';
import ConsolidatedGuideRatings from '@/components/spaces/Ratings/ConsolidatedGuideRatings';
import SpaceAuthDetails from '@/components/spaces/View/SpaceAuthDetails';
import SpaceBasicDetails from '@/components/spaces/View/SpaceBasicDetails';
import SpaceByteDetails from '@/components/spaces/View/SpaceByteDetails';
import SpaceCourseDetails from '@/components/spaces/View/SpaceCoursesDetails';
import SpaceGuideDetails from '@/components/spaces/View/SpaceGuideDetails';
import SpaceSocialDetails from '@/components/spaces/View/SpaceSocialDetails';
import SpaceThemeDetails from '@/components/spaces/View/SpaceThemeDetails';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { SpaceTags } from '@/utils/api/fetchTags';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import TabsWithUnderline, { TabItem } from '@dodao/web-core/components/core/tabs/TabsWithUnderline';
import React, { useEffect, useState } from 'react';
import SpaceApiKeyDetails from './View/SpaceApiKeysDetails';
import SpaceTidbitsHomepageDetails from './View/SpaceTidbitsHomepageDetails';

interface SpaceDetailsProps {
  spaceId: string;
}

enum TabIds {
  Basic = 'Basic',
  Content = 'Courses',
}

interface SpaceDetails {
  space: SpaceWithIntegrationsDto;
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

  async function getSpaceById() {
    const response = await fetch(`/api/spaces/${props.spaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        tags: [SpaceTags.GET_SPACE.toString()],
      },
    });

    if (response.ok) {
      const res = await response.json();
      setData(res);
    }
  }

  useEffect(() => {
    getSpaceById();
  }, [props.spaceId]);

  const onUpdateSettings = async () => {
    await getSpaceById();
  };

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
          <SpaceApiKeyDetails space={data.space} />
          {/*<SpaceDomaiDetails space={data.space} />*/}
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
          <SpaceByteDetails space={data.space} onUpdateSettings={onUpdateSettings} />
        </div>
      )}
    </div>
  ) : (
    <PageLoading />
  );
}
