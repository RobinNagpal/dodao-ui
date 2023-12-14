import styles from '@/components/core/modals/FullScreenModal.module.scss';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import styled from 'styled-components';

export interface SingleSectionModalProps {
  open: boolean;
  onClose: () => void;
  title: string | JSX.Element; // Updated the type to allow JSX.Element
  children: React.ReactNode;
  showCloseButton?: boolean;
  fullWidth?: boolean;
}

const StyledModalWrapper = styled.div`
  background-color: var(--bg-color);
`;
export default function FullScreenModal({ open, title, children, onClose, showCloseButton = true }: SingleSectionModalProps) {
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
          <div className="h-screen bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className={`fixed inset-0 z-10 overflow-y-auto ${styles.modalContainer}`}>
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
                <StyledModalWrapper className={'w-full'}>
                  <div className="text-center">
                    <Dialog.Title as="h3" className={'flex text-base font-semibold leading-6 justify-between p-2 ' + styles.modalTitle}>
                      <div className="w-full align-center text-center text-xl mt-1">{title}</div>
                      {showCloseButton && (
                        <div className="flex justify-end pr-2">
                          <button
                            type="button"
                            className={'rounded-md border-2 border-gray-400'}
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
        </div>
      </Dialog>
    </Transition.Root>
  );
}
