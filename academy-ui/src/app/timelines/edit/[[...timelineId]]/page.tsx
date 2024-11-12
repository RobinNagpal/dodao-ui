import EditTimeline from '@/app/timelines/edit/[[...timelineId]]/EditTimeline';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

const EditTimelinePage = async ({ params }: { params: Promise<{ timelineId?: string[] }> }) => {
  const space = await getSpaceServerSide();
  const parameters = await params;
  const timelineId = parameters.timelineId ? parameters.timelineId[0] : null;
  return <EditTimeline space={space!} timelineId={timelineId} />;
};

export default EditTimelinePage;
