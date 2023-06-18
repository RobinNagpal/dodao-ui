import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';

export interface UpsertSpaceProps {
  spaceId: string;
}
export default function UpsertSpace(props: UpsertSpaceProps) {
  return (
    <form>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <Input label="Name" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" primary>
          Save
        </Button>
      </div>
    </form>
  );
}
