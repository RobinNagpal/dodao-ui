// Import required dependencies
import LoadingSpinner from '@/components/core/loaders/LoadingSpinner';
import React from 'react';
import styled, { css } from 'styled-components';

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
  onClick?: () => void;
  className?: string;
};

// Styled component
const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  border: ${(props) => (props.removeBorder ? 'none' : '1px solid')};
  background-color: transparent;
  color: var(--link-color);
  border-radius: 0.5rem;
  outline: none;
  height: 36px;
  font-size: 15px;

  ${(props) =>
    props.size === 'sm' &&
    css`
      padding: 0 16px;
      border-radius: 0.2rem;
      font-size: 14px;
      line-height: 26px;
      height: 28px;
    `}

  ${(props) =>
    props.variant === 'outlined' &&
    css`
      border-color: var(--skin-border);
      ${props.primary && `color: var(--primary-color); border-color: var(--primary-color);`}

      &:hover {
        color: white;
        background-color: var(--primary-color);
        border-color: var(--primary-color);
      }
    `}

  ${(props) =>
    props.variant === 'contained' &&
    props.primary &&
    css`
      color: white;
      background-color: var(--primary-color);
      border-color: var(--primary-color);

      &:hover {
        border-color: var(--text-color);
      }

      &:disabled {
        color: var(--link-color) !important;
        border-color: var(--border-color);
        background-color: var(--border-color);
      }
    `}

  &:hover {
    color: var(--link-color);
    border-color: var(--link-color);
  }

  &:disabled {
    opacity: 0.8 !important;
    cursor: not-allowed;
  }
`;

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
  return (
    <StyledButton
      type={type}
      primary={primary}
      variant={variant}
      size={size}
      removeBorder={removeBorder}
      disabled={disabled || loading}
      style={style}
      onClick={() => onClick?.()}
      className={className}
    >
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
};

export default CustomButton;
