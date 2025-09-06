import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import styles from './SingleSectionModal.module.scss';

export interface SingleSectionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  showSemiTransparentBg?: boolean;
}

export default function SingleSectionModal({ open, title, children, onClose, showCloseButton = true, showSemiTransparentBg = false }: SingleSectionModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-0 transition-opacity" />
        </TransitionChild>

        <div
          className={`${
            showSemiTransparentBg ? styles.modalContainer : 'background-color'
          } text-color fixed inset-0 z-10 overflow-y-auto flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0`}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel className="background-color z-15 border border-color relative transform overflow-hidden rounded-lg p-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              {showCloseButton && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex rounded-md"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className="text-center">
                <DialogTitle as="h3" className="text-base font-semibold leading-6">
                  {title}
                </DialogTitle>
                <div className="mt-2">{children}</div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
