'use client';

import { BaseSpace } from '@prisma/client';
// SpaceContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface SpaceContextProps {
  space?: BaseSpace | null;
  setSpace: React.Dispatch<React.SetStateAction<BaseSpace | null | undefined>>;
}

const SpaceContext = createContext<SpaceContextProps>({
  space: null,
  setSpace: () => {},
});

export const useSpace = () => {
  return useContext(SpaceContext);
};

export const useRequiredSpace = () => {
  return useContext(SpaceContext) as { space: BaseSpace };
};

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [space, setSpace] = useState<BaseSpace | null>();

  return <SpaceContext.Provider value={{ space, setSpace }}>{children}</SpaceContext.Provider>;
};
