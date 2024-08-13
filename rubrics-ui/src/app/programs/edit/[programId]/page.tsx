import ProgramFullScreenModalEdit from '@/components/ProgramFullScreenModalEdit/ProgramFullScreenModalEdit';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

const EditProgram = async ({ params }: { params: { programId: string } }) => {
  const { programId } = params;
  const space = (await getSpaceServerSide())!;
  return <ProgramFullScreenModalEdit programId={programId} space={space} />;
};

export default EditProgram;
