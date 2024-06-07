import { PropsWithChildren } from '@dodao/web-core/types/PropsWithChildren';
import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import Icon from './Icon'; // Assuming you have an Icon component in your project

interface ModalProps extends PropsWithChildren {
  open: boolean;
  shellClass?: string;
  onClose: () => void;
}

const fadeAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const Fade = styled.div`
  animation: ${fadeAnimation} 0.3s linear;
`;

const ModalWrapper = styled.div`
  position: fixed;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  z-index: 40;
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.4);
`;

const Shell = styled.div`
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  padding-left: 0 !important;
  padding-right: 0 !important;
  max-width: 440px;
  overflow-y: auto !important;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  z-index: 999;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 767px) {
    border: 0;
    width: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    min-height: 100% !important;
    margin-bottom: 0 !important;
  }
`;

const CloseButton = styled.a`
  position: absolute;
  right: 25px;
  top: 1rem;
  padding: 1rem;
  color: var(--text-color);
  cursor: pointer;
`;

function Modal({ open, shellClass, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.opacity = open ? '1' : '0';
    }
  }, [open]);

  return (
    <Fade ref={modalRef}>
      {open && (
        <ModalWrapper>
          <Backdrop onClick={onClose} />
          <Shell className={`shell overflow-hidden relative rounded-none md:rounded-lg ${shellClass || ''}`}>
            {children}
            <CloseButton onClick={onClose}>
              <Icon name="close" />
            </CloseButton>
          </Shell>
        </ModalWrapper>
      )}
    </Fade>
  );
}

export default Modal;
