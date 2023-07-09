import PageLoading from '@/components/core/loaders/PageLoading';
import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import SpaceAuthDetails from '@/components/spaces/View/SpaceAuthDetails';
import SpaceBasicDetails from '@/components/spaces/View/SpaceBasicDetails';
import SpaceCourseDetails from '@/components/spaces/View/SpaceCoursesDetails';
import SpaceGuideDetails from '@/components/spaces/View/SpaceGuideDetails';
import SpaceSocialDetails from '@/components/spaces/View/SpaceSocialDetails';
import { useExtendedSpaceQuery } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

interface SpaceDetailsProps {
  spaceId: string;
}

enum TabIds {
  Basic = 'Basic',
  Content = 'Courses',
}

export default function SpaceDetails(props: SpaceDetailsProps) {
  const { data } = useExtendedSpaceQuery({
    variables: {
      spaceId: props.spaceId,
    },
  });

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

  const [selectedTabId, setSelectedTabId] = useState(TabIds.Basic);
  return data?.space ? (
    <div>
      <div className="flex justify-end">
        <TabsWithUnderline selectedTabId={selectedTabId} setSelectedTabId={(id) => setSelectedTabId(id as TabIds)} tabs={tabs} className="w-96" />
      </div>
      {selectedTabId === TabIds.Basic && (
        <div className="flex flex-col divide-y-2 gap-y-10 divide-gray-300">
          <SpaceBasicDetails space={data.space} className="pt-12" />
          <SpaceAuthDetails space={data.space} className="pt-12" />
          <SpaceSocialDetails space={data.space} className="pt-12" />
        </div>
      )}
      {selectedTabId === TabIds.Content && (
        <div className="flex flex-col divide-y-2 gap-y-10 divide-gray-300">
          <SpaceCourseDetails space={data.space} className="pt-12" />
          <SpaceGuideDetails space={data.space} className="pt-12" />
        </div>
      )}
    </div>
  ) : (
    <PageLoading />
  );
}
