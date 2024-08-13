import ProgramFullScreenModalEdit from '@/components/ProgramFullScreenModalEdit/ProgramFullScreenModalEdit';
const EditProgram = ({ params }: { params: { programId: string } }) => {
  const { programId } = params;
  return <ProgramFullScreenModalEdit programId={programId} />;
};

export default EditProgram;
