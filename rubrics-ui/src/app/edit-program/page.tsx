import ProgramEdit from '@/components/Program/ProgramEdit/EditProgram';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

async function EditProgram() {
  const space = (await getSpaceServerSide())!;

  return (
    <div>
      <ProgramEdit space={space} />
    </div>
  );
}

export default EditProgram;
