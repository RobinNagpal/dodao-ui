import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Fragment, useState } from 'react';
import styled from 'styled-components';
import styles from '@/components/core/modals/FullScreenSimulationModal.module.scss';

export interface SingleSectionModalProps {
  open: boolean;
  onClose: () => void;
  title: string | JSX.Element; // Updated the type to allow JSX.Element
  children: React.ReactNode;
  showCloseButton?: boolean;
  fullWidth?: boolean;
}

const ModalContainer = styled.div`
  color: var(--text-color);
`;

const StyledModalWrapper = styled.div`
  background-color: var(--bg-color);
`;
export default function FullScreenSimulationModal({ open, title, children, onClose, showCloseButton = true }: SingleSectionModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <ModalContainer className={`fixed inset-0 z-10 overflow-y-auto`}>
          <div className="flex min--hflul items-end justify-center text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={'relative transform overflow-hidden text-left transition-all sm:my-8 w-full ' + styles.dialogMargin}>
                <StyledModalWrapper className={'w-full pb-4 pt-2'}>
                  <div className="text-center">
                    <Dialog.Title as="h3" className="flex text-base font-semibold leading-6 justify-between">
                      <div className="w-full align-center text-center">{title}</div>
                      {showCloseButton && (
                        <div className="flex justify-end pr-2">
                          <button
                            type="button"
                            className={'inline-flex rounded-md hover:text-gray-500'}
                            onClick={() => {
                              onClose();
                            }}
                          >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-8 w-8" />
                          </button>
                        </div>
                      )}
                    </Dialog.Title>
                    {children}
                  </div>
                </StyledModalWrapper>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </ModalContainer>
      </Dialog>
    </Transition.Root>
  );
}
