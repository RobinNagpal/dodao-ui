import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  @media (min-width: 992px) {
    border: 1px solid var(--border-color);
    border-radius: 16px;
  }
  background-color: var(--bg-color);
`;
const SingleCardLayout = ({ children }: PropsWithChildren) => {
  return <CardContainer className="px-6 py-4 rounded-2xl sm:shadow-lg">{children}</CardContainer>;
};

export default SingleCardLayout;
