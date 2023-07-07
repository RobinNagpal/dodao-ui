import React from 'react';
import styled from 'styled-components';

const SpinnerWrapper = styled.div`
  color: var(--primary-color);
  svg {
    color: var(--primary-color);
  }
`;

export interface SpinnerWithTextProps {
  message: string;
}
export default function SpinnerWithText({ message }: SpinnerWithTextProps) {
  return (
    <div className="fixed top-0 left-0 w-screen h-full	 flex items-center justify-center bg-opacity-75 z-50">
      <SpinnerWrapper className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {message}
      </SpinnerWrapper>
    </div>
  );
}
