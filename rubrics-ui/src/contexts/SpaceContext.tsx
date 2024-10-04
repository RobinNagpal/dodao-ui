'use client';

import { RubricSpace } from '@prisma/client';
// SpaceContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface SpaceContextProps {
  space?: RubricSpace | null;
  setSpace: React.Dispatch<React.SetStateAction<RubricSpace | null | undefined>>;
}

const SpaceContext = createContext<SpaceContextProps>({
  space: null,
  setSpace: () => {},
});

export const useSpace = () => {
  return useContext(SpaceContext);
};

export const useRequiredSpace = () => {
  return useContext(SpaceContext) as { space: RubricSpace };
};

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [space, setSpace] = useState<RubricSpace | null>();

  return <SpaceContext.Provider value={{ space, setSpace }}>{children}</SpaceContext.Provider>;
};
