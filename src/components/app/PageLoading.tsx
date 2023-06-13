import React from 'react';
import styled from 'styled-components';

const Line = styled.div`
  background-color: var(--skin-text);
  border-radius: 0.375rem;
  animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  margin-bottom: 0.75rem;
`;

function LoadingPlaceholder() {
  return (
    <div>
      <Line className="bg-skin-text rounded-md animate-pulse-fast mb-3" style={{ width: '100%', height: '34px' }} />
      <Line className="bg-skin-text rounded-md animate-pulse-fast mb-3" style={{ width: '40%', height: '34px' }} />
      <Line className="bg-skin-text rounded-md animate-pulse-fast mb-4" style={{ width: '65px', height: '28px' }} />
    </div>
  );
}

export default LoadingPlaceholder;
