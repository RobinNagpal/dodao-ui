import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, FormEvent, Fragment, MouseEvent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

export interface GuideEndRatingModalProps {
  open: boolean;
  onClose: () => void;
  skipEndRating: () => void;
  setEndRating: (rating: number) => void;
  showFeedBackModal:boolean;
  guideSuccess:boolean ; 
}
export interface FeedbackState {
    questions: boolean;
    content: boolean;
    UI: boolean;
    [key: string]: boolean | string;
  }
  
  const feedbackOptions = [
    { name: 'content', label: 'Usefulness of Guides' },
    { name: 'questions', label: 'Questions' },
    { name: 'UI', label: 'User Interface' },
    
  ];

const RatingButton = styled.button`
  :hover {
    background-color: var(--primary-color);
  }
`;

export default function GuideEndRatingModal({ open, onClose, skipEndRating, setEndRating ,showFeedBackModal , guideSuccess  }: GuideEndRatingModalProps) {
   
    const ratings = [
    { number: 1, label: '🙁' },
    { number: 2, label: '😕' },
    { number: 3, label: '😐' },
    { number: 4, label: '😄' },
    { number: 5, label: '😊' },
  ];
  const [finalFeedback, setFinalFeedback] = useState<FeedbackState>({
    questions: false,
    content: false,
    UI: false,
  });

  const handleChange = (event: MouseEvent<HTMLButtonElement>) => {
    const { name } = event.currentTarget;
    setFinalFeedback((prevFeedback) => ({
      ...prevFeedback,
      [name]: !prevFeedback[name],
    }));
  };

  return (
    <FullScreenModal open={open} onClose={onClose} title={'How confident you are after going through the guide'}>
      <div className="mt-2 text-center sm:mt-1">
        <div className={`mt-4 flex justify-center`}>
          {ratings.map(({ number, label }) => (
            <RatingButton
              key={number}
              type="button"
              className={`inline-flex items-center justify-center w-20 h-16 text-3xl rounded-full hover:scale-110 transition-transform duration-200`}
              onClick={() => setEndRating(number)}
            >
              {label}
            </RatingButton>
          ))}
          <a className="text-xs text-blue-700 cursor-pointer underline mt-2" onClick={() => skipEndRating()}>
            Skip
          </a>
        </div>
      </div>
      {showFeedBackModal && (
        <div className="flex flex-col items-center">
        <h2  className="text-xl font-semibold leading-6 text-gray-900">
          {  guideSuccess? 'What do you like the most?' : 'What do you want us to improve on'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {feedbackOptions.map((option) => (
            <button
              key={option.name}
              name={option.name}
              onClick={handleChange}
              className={`w-full h-24 p-3 border-2 rounded-md ${finalFeedback[option.name] ? 'bg-blue-500 text-white' : ''}`}
            >
              <ArrowDownCircleIcon className="w-full h-[50%]" />
              <h2>{option.label}</h2>
            </button>
          ))}
        </div>
        
      </div>
      )}
      
    </FullScreenModal>
  );
}
