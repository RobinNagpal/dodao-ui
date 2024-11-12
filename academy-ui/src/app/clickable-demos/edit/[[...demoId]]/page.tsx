import EditClickableDemo from '@/app/clickable-demos/edit/[[...demoId]]/EditClickableDemo';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

export default async function EditClickableDemoPage(props: { params: Promise<{ demoId?: string[] }> }) {
  const params = await props.params;
  const demoId = params.demoId ? params.demoId[0] : '';
  const space = await getSpaceServerSide();

  return <EditClickableDemo space={space!} demoId={demoId} />;
}
