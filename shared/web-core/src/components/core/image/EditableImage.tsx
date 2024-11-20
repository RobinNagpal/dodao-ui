import React from 'react';
import dummyImage from '@dodao/web-core/images/image-placeholder.png';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import OverlayOnHover from '@dodao/web-core/components/core/overlay/OverlayOnHover';
import ViewEditableImage from '@dodao/web-core/components/core/image/ViewEditableImage';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import styles from './EditableImage.module.scss';

interface EditableImageProps {
  imageUrl?: string | null;
  onRemove: () => void;
  onUpload: () => void;
  height?: string;
  label?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  error?: string | boolean;
}

export default function EditableImage({ imageUrl, onRemove, onUpload, height = '150px', label, disabled, disabledTooltip = '', error }: EditableImageProps) {
  return (
    <div className="my-4 flex justify-center items-center">
      {imageUrl ? (
        <div className={`relative group inline-block h-[${height}] justify-center`}>
          <img src={imageUrl} style={{ height: height }} className="border border-color object-cover" />

          <OverlayOnHover>
            <ViewEditableImage onClickEditIcon={onUpload} onClickTrashIcon={onRemove} />
          </OverlayOnHover>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-center items-center">
          <div className={`relative h-[150px] group ${error ? 'border border-red-600 border-2' : ''}`}>
            <img src={dummyImage.src} style={{ height: '100%' }} className="cursor-pointer border border-color" />
            <OverlayOnHover>
              <IconButton
                tooltip={`${disabled ? disabledTooltip : 'Add Image'}`}
                iconName={IconTypes.PlusIcon}
                height="30"
                width="30"
                className={`p-1 rounded-full ${styles.iconsColorToggle}`}
                onClick={onUpload}
                disabled={disabled}
              />
            </OverlayOnHover>
          </div>
          {label && !error && <div className="mt-2 font-semibold">{label}</div>}
          {typeof error === 'string' && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
