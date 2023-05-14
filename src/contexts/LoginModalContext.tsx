// login-modal-context.tsx
import { createContext, useContext, useState } from 'react';

interface LoginModalContextData {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

const LoginModalContext = createContext<LoginModalContextData>({
  showModal: false,
  setShowModal: () => {},
});

export const useLoginModalContext = () => useContext(LoginModalContext);

export const LoginModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [showModal, setShowModal] = useState(false);

  return <LoginModalContext.Provider value={{ showModal, setShowModal }}>{children}</LoginModalContext.Provider>;
};
