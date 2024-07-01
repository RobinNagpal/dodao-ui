'use client';

import { Space } from '@prisma/client';
// SpaceContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface SpaceContextProps {
  space?: Space | null;
  setSpace: React.Dispatch<React.SetStateAction<Space | null | undefined>>;
}

const SpaceContext = createContext<SpaceContextProps>({
  space: null,
  setSpace: () => {},
});

export const useSpace = () => {
  return useContext(SpaceContext);
};

export const useRequiredSpace = () => {
  return useContext(SpaceContext) as { space: Space };
};

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [space, setSpace] = useState<Space | null>();

  return <SpaceContext.Provider value={{ space, setSpace }}>{children}</SpaceContext.Provider>;
};
