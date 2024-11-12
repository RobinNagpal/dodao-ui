import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import EditGuide from './EditGuide';

const EditGuidePage = async (props: { params: Promise<{ guideId?: string[] }> }) => {
  const params = await props.params;
  const guideId = params.guideId ? params.guideId[0] : null;
  const space = (await getSpaceServerSide())!;
  return <EditGuide guideId={guideId} space={space} />;
};

export default EditGuidePage;
