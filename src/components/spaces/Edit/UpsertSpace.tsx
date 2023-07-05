import RowLoading from '@/components/core/loaders/RowLoading';
import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import UpsertSpaceBasicSettings from '@/components/spaces/Edit/Basic/UpsertSpaceBasicSettings';
import useEditSpace, { SpaceEditType, UseEditSpaceHelper } from '@/components/spaces/Edit/Basic/useEditSpace';
import CourseListScreen from '@/components/spaces/Edit/Courses/CourseListScreen';
import UpsertSpaceGuideSettings from '@/components/spaces/Edit/Guides/UpsertSpaceGuideSettings';
import { useExtendedSpaceQuery } from '@/graphql/generated/generated-types';
import { useEffect, useState } from 'react';

export interface UpsertSpaceProps {
  spaceId: string;
}

enum TabIds {
  Auth = 'Auth',
  Basic = 'Basic',
  Courses = 'Courses',
  Guides = 'Guides',
}

function SettingsScreen(props: { space: SpaceEditType; editSpaceHelper: UseEditSpaceHelper; selectedTabId: TabIds }) {
  const { data } = useExtendedSpaceQuery({
    variables: { spaceId: props.space.id! },
    skip: !props.space.id,
  });

  if (props.selectedTabId === TabIds.Basic) {
    return <UpsertSpaceBasicSettings editSpaceHelper={props.editSpaceHelper} />;
  }

  if (!data?.space) {
    return <RowLoading />;
  }

  if (props.selectedTabId === TabIds.Courses) {
    return <CourseListScreen spaceId={props.space.id!} />;
  }

  if (props.selectedTabId === TabIds.Guides) {
    return <UpsertSpaceGuideSettings space={data.space} />;
  }

  return null;
}

export default function UpsertSpace(props: UpsertSpaceProps) {
  const editSpaceHelper = useEditSpace(props.spaceId);

  const tabs: TabItem[] = [
    {
      id: TabIds.Basic,
      label: 'Basic',
    },
    {
      id: TabIds.Courses,
      label: 'Courses',
    },
    {
      id: TabIds.Guides,
      label: 'Guides',
    },
    {
      id: TabIds.Auth,
      label: 'Auth',
    },
  ];
  const [selectedTabId, setSelectedTabId] = useState(TabIds.Guides);

  useEffect(() => {
    editSpaceHelper.initialize();
  }, [props.spaceId]);

  return (
    <div>
      <div className="flex justify-end">
        <TabsWithUnderline selectedTabId={selectedTabId} setSelectedTabId={(id) => setSelectedTabId(id as TabIds)} tabs={tabs} className="w-96" />
      </div>
      {editSpaceHelper.space ? (
        <SettingsScreen space={editSpaceHelper.space} editSpaceHelper={editSpaceHelper} selectedTabId={selectedTabId} />
      ) : (
        <RowLoading />
      )}
    </div>
  );
}
