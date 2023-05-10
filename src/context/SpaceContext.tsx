// SpaceContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Space {
  id: string;
  name: string;
}

interface SpaceContextProps {
  space: Space | null;
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
  const [space, setSpace] = useState<Space | null>(null);

  return <SpaceContext.Provider value={{ space, setSpace }}>{children}</SpaceContext.Provider>;
};
