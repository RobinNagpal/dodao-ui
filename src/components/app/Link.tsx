import { PropsWithChildren } from '@/types/PropsWithChildren';
import { ReactVueRouter } from '@/types/ReactVueRouter';
import React from 'react';
import styled from 'styled-components';

interface LinkProps extends PropsWithChildren {
  to: {
    path?: string | null;
    pathname?: string | null;
    query?: any;
    name?: string;
    params?: any;
  };
  reactVueRouter: ReactVueRouter;
  className?: string;
}

const LinkSpan = styled.span`
  cursor: pointer;
`;
function Link(props: LinkProps) {
  return <LinkSpan onClick={() => props.reactVueRouter.push(props.to)}>{props.children}</LinkSpan>;
}

export default Link;
