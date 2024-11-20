import React from 'react';
import dummyVideo from '@dodao/web-core/images/video-placeholder.png';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import OverlayOnHover from '@dodao/web-core/components/core/overlay/OverlayOnHover';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import styles from './EditableVideo.module.scss';
import WebCoreFileUploader from '@dodao/web-core/components/core/uploadInput/FileUploader';

interface EditableVideoProps {
  videoUrl?: string | null;
  onRemove: () => void;
  onUpload: (file: File) => Promise<void>;
  height?: string;
  label?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  loading: boolean;
  error?: string | boolean;
}

export default function EditableVideo({
  videoUrl,
  onRemove,
  onUpload,
  height = '150px',
  label,
  disabled,
  disabledTooltip = '',
  loading,
  error,
}: EditableVideoProps) {
  return (
    <div className="my-4 flex justify-center items-center">
      {videoUrl ? (
        <div className={`relative group inline-block h-[${height}] justify-center`}>
          <video src={videoUrl} style={{ height: height }} className="border border-color" />

          <OverlayOnHover>
            <div className={`flex justify-center items-center gap-x-4 ${loading ? 'cursor-progress' : ''}`}>
              <WebCoreFileUploader
                allowedFileTypes={['video/mp4', 'video/x-m4v', 'video/*']}
                className={`flex justify-center items-center`}
                uploadFile={async (file) => {
                  onRemove();
                  onUpload(file);
                }}
                loading={loading}
              >
                <IconButton tooltip="Change Video" iconName={IconTypes.Edit} height="30" width="30" className={`${styles.iconsColorToggle}`} />
              </WebCoreFileUploader>
              <IconButton
                tooltip="Remove Video"
                iconName={IconTypes.Trash}
                height="30"
                width="30"
                className={`${styles.iconsColorToggle}`}
                onClick={onRemove}
              />
            </div>
          </OverlayOnHover>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-center items-center">
          <div className={`relative h-[150px] group ${error ? 'border border-red-600 border-2' : ''}`}>
            <img src={dummyVideo.src} style={{ height: '100%' }} className="cursor-pointer border border-color" />
            <OverlayOnHover>
              <WebCoreFileUploader
                allowedFileTypes={['video/mp4', 'video/x-m4v', 'video/*']}
                className={'flex justify-center items-center px-3 py-2 '}
                uploadFile={onUpload}
                loading={loading}
              >
                <IconButton
                  tooltip={`${disabled ? disabledTooltip : 'Add Video'}`}
                  iconName={IconTypes.PlusIcon}
                  height="30"
                  width="30"
                  className={`p-1 rounded-full ${styles.iconsColorToggle}`}
                />
              </WebCoreFileUploader>
            </OverlayOnHover>
          </div>
          {label && !error && <div className="mt-2 font-semibold">{label}</div>}
          {typeof error === 'string' && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
