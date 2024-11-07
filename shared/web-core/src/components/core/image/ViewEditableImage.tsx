import React from 'react';
import styles from './ViewEditableImage.module.scss';
import IconButton from '../buttons/IconButton';
import { IconTypes } from '../icons/IconTypes';

interface ViewEditableImageProps {
  onClickEditIcon: () => void;
  onClickTrashIcon: () => void;
}

export default function ViewEditableImage({ onClickEditIcon, onClickTrashIcon }: ViewEditableImageProps) {
  return (
    <div className="flex gap-4">
      <IconButton
        tooltip="Change Image"
        iconName={IconTypes.Edit}
        height="30"
        width="30"
        className={`p-1 rounded-full ${styles.iconsColorToggle}`}
        onClick={onClickEditIcon}
      />
      <IconButton
        tooltip="Remove Image"
        iconName={IconTypes.Trash}
        height="30"
        width="30"
        className={`p-1 rounded-full ${styles.iconsColorToggle}`}
        onClick={onClickTrashIcon}
      />
    </div>
  );
}
