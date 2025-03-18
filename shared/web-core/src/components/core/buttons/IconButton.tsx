'use client';

import React from 'react';
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import RobotIconSolid from '@dodao/web-core/components/core/icons/RobotIconSolid';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import DocumentPlusIcon from '@heroicons/react/24/solid/DocumentPlusIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import styles from './IconButton.module.scss';

export type IconButtonProps = {
  disabled?: boolean;
  iconName: IconTypes;
  primary?: boolean;
  variant?: 'outlined' | 'contained' | 'text';
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  height?: string;
  width?: string;
  removeBorder?: boolean;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
};

const IconButton: React.FC<IconButtonProps> = ({
  disabled = false,
  iconName,
  primary = false,
  variant = 'outlined',
  loading = false,
  type = 'button',
  height = '20',
  width = '20',
  removeBorder = false,
  onClick,
  className,
  tooltip,
}) => {
  const classNames = [
    styles.iconButton,
    primary ? `${styles.primary} ${styles[variant]}` : styles[variant],
    removeBorder ? styles.removeBorder : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderIcon = () => {
    switch (iconName) {
      case IconTypes.Trash:
        return <TrashIcon width={width} height={height} />;
      case IconTypes.Edit:
        return <PencilSquareIcon width={width} height={height} />;
      case IconTypes.MoveUp:
        return <ArrowUpIcon width={width} height={height} />;
      case IconTypes.MoveDown:
        return <ArrowDownIcon width={width} height={height} />;
      case IconTypes.GuideAddIcon:
        return <DocumentPlusIcon width={width} height={height} />;
      case IconTypes.ArrowDownTrayIcon:
        return <ArrowDownTrayIcon width={width} height={height} />;
      case IconTypes.Reload:
        return <ArrowPathIcon width={width} height={height} />;
      case IconTypes.RobotIconSolid:
        return <RobotIconSolid />;
      case IconTypes.PlusIcon:
        return <PlusIcon width={width} height={height} />;
      case IconTypes.Refresh:
        return <ArrowPathIcon width={width} height={height} />;
      default:
        return null;
    }
  };

  return (
    <button type={type} onClick={disabled ? undefined : onClick} className={classNames} title={tooltip} disabled={disabled}>
      {loading && <LoadingSpinner primary={primary} />}
      {renderIcon()}
    </button>
  );
};

export default IconButton;
