import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import ViewClickableDemo from './ViewClickableDemo';

async function ViewClickableDemoPage(args: { params: Promise<{ demoId: string[] }> }) {
  const params = await args.params;
  const demoId = params.demoId[0];
  const space = await getSpaceServerSide();
  return <ViewClickableDemo space={space!} demoId={demoId} />;
}

export default ViewClickableDemoPage;
