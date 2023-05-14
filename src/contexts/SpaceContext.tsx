// SpaceContext.tsx
import { ExtendedSpaceByDomainQuery } from '@/graphql/generated/generated-types';
import React, { createContext, useContext, useState } from 'react';

type Space = ExtendedSpaceByDomainQuery['space'];

interface SpaceContextProps {
  space: Space;
  setSpace: React.Dispatch<React.SetStateAction<Space | null>>;
}

const SpaceContext = createContext<SpaceContextProps>({
  space: null,
  setSpace: () => {},
});

export const useSpace = () => {
  return useContext(SpaceContext);
};

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [space, setSpace] = useState<Space | null>();

  return <SpaceContext.Provider value={{ space, setSpace }}>{children}</SpaceContext.Provider>;
};
