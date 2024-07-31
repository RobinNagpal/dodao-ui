import { Space } from '@/graphql/generated/generated-types';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import ArrowUpTrayIcon from '@heroicons/react/24/solid/ArrowUpTrayIcon';
import ElementSelectorModal from '@/components/clickableDemos/ElementSelector/ElementSelectorModal';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import styles from './SelectElementInput.module.scss';
import { useState } from 'react';

interface SelectElementInputProps {
  label?: string;
  modelValue?: string | null;
  elementImgUrl?: string | null;
  objectId: string;
  space: Space;
  fileUrl?: string;
  onInput: (url: string, elementImgUrl: string) => void;
  onLoading?: (value: ((prevState: boolean) => boolean) | boolean) => void;
  placeholder?: string;
  allowedFileTypes?: string[];
  error?: any;
  helpText?: string;
}

export default function SelectElementInput({
  label,
  modelValue,
  elementImgUrl,
  objectId,
  space,
  fileUrl,
  onInput,
  onLoading,
  placeholder = '/html/body/',
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/svg+xml', 'image/webp', 'text/html'],
  error,
  helpText,
}: SelectElementInputProps) {
  const inputId = space.id + '-' + slugify(label || objectId);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mt-2">
      <label htmlFor={inputId} className="block text-sm font-medium leading-6">
        {label || 'Image URL'}
      </label>
      <div className={`mt-2 flex rounded-md shadow-sm ${styles.UploadWrapper}`}>
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id={inputId}
            className={`block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 ring-1 ring-inset placeholder:text-gray-400 ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6 ${styles.StyledInput}`}
            placeholder={placeholder}
            aria-invalid="true"
            aria-describedby="email-error"
            value={modelValue || ''}
            onChange={(e) => onInput(e.target.value, '')}
          />
        </div>
        <div
          onClick={() => setShowModal(true)}
          className="flex relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
        >
          <ArrowUpTrayIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="mx-2">Select</span>
        </div>
      </div>
      {helpText && <p className="ml-1 mt-2 mb-2 text-sm">{helpText}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-left text-red-600">{error}</p>}
      {showModal && (
        <ElementSelectorModal
          space={space}
          onInput={onInput}
          showModal={showModal}
          objectId={objectId}
          fileUrl={fileUrl!}
          xPath={modelValue || ''}
          elementImgUrl={elementImgUrl || ''}
          onLoading={onLoading}
          setShowModal={setShowModal}
        ></ElementSelectorModal>
      )}
    </div>
  );
}
