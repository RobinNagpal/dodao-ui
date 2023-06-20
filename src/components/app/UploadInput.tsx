import Upload from '@/components/app/Upload';
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/solid';
import styled from 'styled-components';
import { v4 as uuidV4 } from 'uuid';

const UploadWrapper = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

const StyledInput = styled.input`
  background-color: var(--bg-color);
  border-color: var(--primary-color) !important;
  color: var(--text-color);
  &:focus {
    box-shadow: 0 0 0 2px var(--primary-color) !important;
  }
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
  const inputId = uuidV4();
  return (
    <UploadWrapper className="mt-2">
      <label htmlFor={inputId} className="block text-sm font-medium leading-6">
        Image URL
      </label>
      <div className="mt-2 flex rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <StyledInput
            id={inputId}
            className="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 ring-1 ring-inset placeholder:text-gray-400 ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6"
            placeholder="e.g. https://example.com/guide.png"
            aria-invalid="true"
            aria-describedby="email-error"
            value={props.modelValue || ''}
            onChange={(e) => props.onUpdate(e.target.value)}
          />
        </div>
        <Upload
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          spaceId={props.spaceId}
          onInput={props.onInput}
          imageType={props.imageType}
          objectId={props.objectId}
          onLoading={props.onLoading}
        >
          <div className="flex">
            <ArrowUpTrayIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="mx-2">Upload</span>
          </div>
        </Upload>
      </div>
    </UploadWrapper>
  );
}
