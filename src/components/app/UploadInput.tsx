import Input from '@/components/core/input/Input';
import Upload from '@/components/app/Upload';
import styled from 'styled-components';

const UploadWrapper = styled.div`
  position: relative;
  overflow: hidden;
  padding-top: 22px;
  margin-bottom: 3px;
  border-bottom: 1px solid;
  border-color: var(--border-color);
  background-color: transparent;

  padding-right: 15px;
  cursor: pointer;
  transition: border-color 0.15s ease-in-out;
`;

export default function UploadInput(props: {
  modelValue?: string | null;
  imageType: string;
  objectId: string;
  error: any;
  onUpdate: (newValue: string | number | undefined) => void;
  spaceId: string;
  onInput: (url: string) => void;
  onLoading: (value: ((prevState: boolean) => boolean) | boolean) => void;
}) {
  return (
    <div className="flex justify-between mb-3">
      <Input modelValue={props.modelValue} placeholder="e.g. https://example.com/guide.png" error={props.error} onUpdate={props.onUpdate}>
        <div>Thumbnail</div>
      </Input>
      <UploadWrapper>
        <Upload
          className="!ml-2"
          spaceId={props.spaceId}
          onInput={props.onInput}
          imageType={props.imageType}
          objectId={props.objectId}
          onLoading={props.onLoading}
        >
          Upload
        </Upload>
      </UploadWrapper>
    </div>
  );
}
