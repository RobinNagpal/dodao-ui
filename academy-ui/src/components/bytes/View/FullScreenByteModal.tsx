import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import styled from 'styled-components';

export interface SingleSectionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const ModalContainer = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

export default function FullScreenByteModal({ open, title, children, onClose, showCloseButton = true }: SingleSectionModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
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

        <ModalContainer className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center text-center sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden text-left transition-all sm:w-full sm:max-w-screen-md min-h-screen">
                <div>
                  {showCloseButton && (
                    <div className="absolute right-2 top-2">
                      <button
                        type="button"
                        className="inline-flex rounded-md hover:text-gray-500 focus:outline-none"
                        onClick={() => {
                          onClose();
                        }}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-10 w-10" aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  <div className="text-center">
                    <Dialog.Title as="h3" className="text-xl font-semibold h-14 pt-4 ">
                      {title}
                    </Dialog.Title>
                    <div>{children}</div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </ModalContainer>
      </Dialog>
    </Transition.Root>
  );
}
