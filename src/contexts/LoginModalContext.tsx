// login-modal-context.tsx
import { createContext, useContext, useState } from 'react';

interface LoginModalContextData {
  showLoginModal: boolean;
  setShowLoginModal: (showModal: boolean) => void;
}

const LoginModalContext = createContext<LoginModalContextData>({
  showLoginModal: false,
  setShowLoginModal: () => {},
});

export const useLoginModalContext = () => useContext(LoginModalContext);

export const LoginModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [showModal, setShowModal] = useState(false);

  return <LoginModalContext.Provider value={{ showLoginModal: showModal, setShowLoginModal: setShowModal }}>{children}</LoginModalContext.Provider>;
};
