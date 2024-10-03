import { useState } from 'react';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import styles from './CaptureInput.module.scss';
import ArrowUpTrayIcon from '@heroicons/react/24/solid/ArrowUpTrayIcon';
import SelectHtmlCaptureModal from '@/components/clickableDemoHtmlCapture/SelectHtmlCaptureModal';

interface HtmlCapture {
  id: string;
  clickable_demo_id: string;
  fileName: string;
  fileUrl: string;
  fileImageUrl: string;
  created_at: string;
}

interface CaptureInputProps {
  label?: string;
  modelValue?: string | null;
  onInput: (url: string, screenImgUrl: string) => void;
  placeholder?: string;
  error?: any;
  helpText?: string;
  demoId: string;
  spaceId: string;
}

export default function CaptureInput({
  label,
  modelValue,
  onInput,
  placeholder = 'e.g. https://example.com/guide.png',
  error,
  helpText,
  demoId,
  spaceId,
}: CaptureInputProps) {
  const [showSelectHtmlCaptureModal, setShowSelectHtmlCaptureModal] = useState(false);

  const inputId = 'capture-input';

  const handleSelectHtmlCaptures = (selectedCaptures: HtmlCapture[]) => {
    if (selectedCaptures.length > 0) {
      const selectedCapture = selectedCaptures[0];
      onInput(selectedCapture.fileUrl, selectedCapture.fileImageUrl || '');
    }
    setShowSelectHtmlCaptureModal(false);
  };

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
            className={`block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 ring-1 ring-inset placeholder:text-gray-400 ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${styles.StyledInput}`}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={`${inputId}-error`}
            value={modelValue || ''}
            onChange={(e) => onInput(e.target.value, '')}
          />
        </div>
        <button
          type="button"
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={() => setShowSelectHtmlCaptureModal(true)}
        >
          <ArrowUpTrayIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="mx-2">Select</span>
        </button>
      </div>
      {helpText && <p className="ml-1 mt-2 mb-2 text-sm">{helpText}</p>}
      {typeof error === 'string' && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-left text-red-600">
          {error}
        </p>
      )}
      {showSelectHtmlCaptureModal && (
        <SelectHtmlCaptureModal
          showSelectHtmlCaptureModal={showSelectHtmlCaptureModal}
          onClose={() => setShowSelectHtmlCaptureModal(false)}
          addHtmlCaptures={handleSelectHtmlCaptures}
          demoId={demoId}
          spaceId={spaceId} // Add the appropriate spaceId value here
        />
      )}
    </div>
  );
}
