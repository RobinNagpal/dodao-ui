import { Spinner } from '@dodao/web-core/components/core/icons/Spinner';
import React from 'react';
import styled, { keyframes } from 'styled-components';
interface UiLoadingProps {
  fillWhite?: boolean;
  big?: boolean;
  overlay?: boolean;
  className?: string;
}

const LoadingSpan = styled.span<{ big: boolean }>`
  span {
    width: 100%;
  }

  ${(props) =>
    props.big &&
    `
    svg {
      width: 34px;
      height: 34px;
    }
  `}

  svg {
    display: inline-block;
    vertical-align: middle;
    width: 20px;
    height: 20px;

    path {
      fill: var(--link-color);
      &.fill-white {
        fill: white;
      }
    }
  }

  ${(props: UiLoadingProps) =>
    props.overlay &&
    `
    position: fixed;
    text-align: center;
    display: flex;
    align-items: center;
    align-content: center;
    top: 0;
    bottom: 80px;
    left: 0;
    right: 0;
    width: 100%;
  `}
`;

export default function LoadingSpinner({ fillWhite = false, big = false, overlay = false }: UiLoadingProps) {
  return (
    <LoadingSpan className={overlay ? 'overlay' : ''} big={big}>
      <Spinner />
    </LoadingSpan>
  );
}
