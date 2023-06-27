import TabsWithUnderline, { TabItem } from '@/components/core/tabs/TabsWithUnderline';
import BasicSettings from '@/components/spaces/Edit/BasicSettings';
import CourseListScreen from '@/components/spaces/Edit/CourseListScreen';
import useEditSpace, { UseEditSpaceHelper } from '@/components/spaces/useEditSpace';
import { useEffect, useState } from 'react';

export interface UpsertSpaceProps {
  spaceId: string;
}

enum TabIds {
  BasicInfo = 'BasicInfo',
  Courses = 'Courses',
}

function SettingsScreen(props: { spaceId: string; editSpaceHelper: UseEditSpaceHelper; selectedTabId: TabIds }) {
  if (props.selectedTabId === TabIds.BasicInfo) {
    return <BasicSettings editSpaceHelper={props.editSpaceHelper} />;
  }

  if (props.selectedTabId === TabIds.Courses) {
    return <CourseListScreen spaceId={props.spaceId} />;
  }

  return null;
}

export default function UpsertSpace(props: UpsertSpaceProps) {
  const editSpaceHelper = useEditSpace(props.spaceId);

  const tabs: TabItem[] = [
    {
      id: TabIds.BasicInfo,
      label: 'Basic Info',
    },
    {
      id: TabIds.Courses,
      label: 'Courses',
    },
  ];
  const [selectedTabId, setSelectedTabId] = useState(TabIds.BasicInfo);

  useEffect(() => {
    editSpaceHelper.initialize();
  }, [props.spaceId]);

  return (
    <div>
      <div className="flex justify-end">
        <TabsWithUnderline selectedTabId={selectedTabId} setSelectedTabId={(id) => setSelectedTabId(id as TabIds)} tabs={tabs} className="w-96" />
      </div>
      <SettingsScreen selectedTabId={selectedTabId} editSpaceHelper={editSpaceHelper} spaceId={props.spaceId} />
    </div>
  );
}
