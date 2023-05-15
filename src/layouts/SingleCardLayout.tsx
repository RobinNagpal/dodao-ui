import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  border-radius: 16px;
`;
const SingleCardLayout = ({ children }: PropsWithChildren) => {
  return <CardContainer className="px-6 py-4 rounded-2xl shadow-lg">{children}</CardContainer>;
};

export default SingleCardLayout;
