import React from 'react';
import styled, { css } from 'styled-components';

interface IconButtonProps {
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}

const StyledButton = styled.button<{ disabled?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-color);
  outline: none;

  &:not(:disabled):hover {
    background-color: var(--header-bg);
  }

  &:disabled {
    color: var(--border-color) !important;
    cursor: not-allowed;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      color: var(--border-color) !important;
      cursor: not-allowed;
    `}
`;

function IconButton({ disabled = false, children, className = '', onClick }: IconButtonProps) {
  return (
    <StyledButton disabled={disabled} className={className} onClick={onClick}>
      {children}
    </StyledButton>
  );
}

export default IconButton;
