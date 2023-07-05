import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, FormEvent, Fragment, MouseEvent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

export interface GuideStartRatingModalProps {
  open: boolean;
  onClose: () => void;
  skipStartRating: () => void;
  setStartRating: (rating: number) => void;
}

const RatingButton = styled.button`
  :hover {
    background-color: var(--primary-color);
  }
`;

export default function GuideStartRatingModal({ open, onClose, skipStartRating, setStartRating }: GuideStartRatingModalProps) {
  const ratings = [
    { number: 1, label: '🙁' },
    { number: 2, label: '😕' },
    { number: 3, label: '😐' },
    { number: 4, label: '😄' },
    { number: 5, label: '😊' },
  ];

  return (
    <FullScreenModal open={open} onClose={onClose} title={'How well do you know this topic currently?'}>
      <div className="mt-2 text-center sm:mt-1">
        <div className={`mt-4 flex justify-center`}>
          {ratings.map(({ number, label }) => (
            <RatingButton
              key={number}
              type="button"
              className={`inline-flex items-center justify-center w-20 h-16 text-3xl rounded-full hover:scale-110 transition-transform duration-200`}
              onClick={() => setStartRating(number)}
            >
              {label}
            </RatingButton>
          ))}
          <a className="text-xs text-blue-700 cursor-pointer underline mt-2" onClick={() => skipStartRating()}>
            Skip
          </a>
        </div>
      </div>
    </FullScreenModal>
  );
}
