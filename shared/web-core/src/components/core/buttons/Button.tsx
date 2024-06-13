'use client';

// Import required dependencies
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import React, { FormEvent } from 'react';
import styles from './Button.module.scss';

// Define the component's props
export type ButtonProps = {
  primary?: boolean;
  variant?: 'outlined' | 'contained' | 'text';
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  size?: 'sm';
  removeBorder?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (e?: FormEvent<HTMLFormElement>) => void;
  className?: string;
};

// Main component
const CustomButton = ({
  primary,
  variant = 'outlined',
  loading,
  type = 'button',
  disabled,
  size,
  removeBorder,
  style,
  children,
  onClick,
  className,
}: ButtonProps) => {
  const classNames = [
    styles.button,
    primary ? styles.primary : '',
    removeBorder ? styles['remove-border'] : '',
    size === 'sm' ? styles.small : '',
    variant == 'outlined' ? styles.outlined : styles.contained, // 'outlined' or 'contained'
    disabled ? styles.disabled : '',
    className,
  ].join(' ');

  return (
    <button onClick={() => onClick?.()} className={classNames}>
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};

export default CustomButton;
