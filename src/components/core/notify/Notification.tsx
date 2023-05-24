import { Fragment, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, StopCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';
import styled from 'styled-components';

const NotificationPanel = styled.div`
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background-color: var(--bg-color);
  color: var(--text-color);
  &:hover {
    color: var(--link-color);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--link-color);
  }
`;

const Paragraph = styled.p`
  color: var(--text-color);
`;

export interface NotificationProps {
  type?: 'success' | 'error' | 'info';
  heading?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export default function Notification({ heading, message, duration = 5000, type = 'success', onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  let headingText = heading;
  if (!headingText) {
    //  add emoji to heading
    if (type === 'success') headingText = 'Success 🎉';
    if (type === 'error') headingText = 'Error ❌';
    if (type === 'info') headingText = 'Info ℹ️';
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div aria-live="assertive" className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6">
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={isVisible}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <NotificationPanel className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {type === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />}{' '}
                    {type === 'error' && <StopCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />}
                    {type === 'info' && <InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <Paragraph className="text-sm font-medium text-gray-900">{heading}</Paragraph>
                    <Paragraph className="mt-1 text-sm text-gray-500">{message}</Paragraph>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <CloseButton
                      type="button"
                      className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        handleClose();
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </CloseButton>
                  </div>
                </div>
              </div>
            </NotificationPanel>
          </Transition>
        </div>
      </div>
    </>
  );
}
