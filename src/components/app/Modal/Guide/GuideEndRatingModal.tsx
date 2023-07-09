import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { GuideFeedback } from '@/graphql/generated/generated-types';
import { useState } from 'react';
import styled, { ThemedStyledProps } from 'styled-components';
import Image from 'next/image';
import Button from '@/components/core/buttons/Button';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { QuestionMarkCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export interface GuideEndRatingModalProps {
  open: boolean;
  onClose: () => void;
  skipEndRating: () => void;
  setEndRating: (rating: number) => void;
  setFeedback: (feedback: GuideFeedback) => void;
  guideSuccess: boolean | null;
  showFeedBackModal: boolean;
}

export interface GuideFeedbackOptions {
  name: string;
  label: string;
  image: any;
}

export interface GuideFeedbackState {
  [key: string]: boolean;
}

const feedbackOptions: GuideFeedbackOptions[] = [
  { name: 'content', label: 'Usefulness of Guides', image: ClipboardDocumentListIcon },
  { name: 'questions', label: 'Questions', image: QuestionMarkCircleIcon },
  { name: 'UX', label: 'User Experience', image: RocketLaunchIcon },
];

const RatingButton = styled.button`
  :hover {
    border: 2px solid #00ad79;
  }
  &.selected {
    border: 2px solid #00ad79;
  }

  display: inline-block;
  padding: 10px 20px;
  background-color: #000;
  margin-left: 10px;
  color: #fff;
  border-radius: 5px;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));

  :active {
    background-color: #444;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid white;
  padding: 10px;
  background-color: #0d131a;
`;

export default function GuideEndRatingModal({
  open,
  onClose,
  skipEndRating,
  setEndRating,
  setFeedback,
  guideSuccess,
  showFeedBackModal,
}: GuideEndRatingModalProps) {
  const ratings = [
    { number: 1, label: 'sad' },
    { number: 2, label: 'neutral' },
    { number: 3, label: 'smile' },
    { number: 4, label: 'smiling' },
    { number: 5, label: 'superstar' },
  ];
  const handleSubmitFeedback = () => {
    const selectedFeedback: GuideFeedback = {
      content: feedbackState['content'],
      questions: feedbackState['questions'],
      ux: feedbackState['UX'],
    };

    setFeedback(selectedFeedback);
    onClose();
  };

  const [feedbackState, setFeedbackState] = useState<GuideFeedbackState>({
    content: false,
    questions: false,
    ux: false,
  });

  const handleFeedbackSelection = (optionName: string) => {
    setFeedbackState((prevState) => ({
      ...prevState,
      [optionName]: !prevState[optionName],
    }));
  };
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  return (
    <FullScreenModal open={open} onClose={onClose} title={''}>
      <ModalContent>
        <div className="mt-2 text-center sm:mt-1">
          <div className="flex flex-row items-center justify-center ">
            <h1 className="text-2xl font-semibold leading-6 text-gray-200 mr-2">How confident are you after going through the guide !</h1>
            <Image height={60} width={50} src="/confidence.png" alt="feedbackIcon" />
          </div>

          <div className={`mt-4 flex justify-center`}>
            {ratings.map(({ number, label }) => (
              <RatingButton
                key={number}
                type="button"
                className={`inline-flex items-center justify-center  text-3xl  hover:scale-110 transition-transform duration-200  ${
                  selectedRating === number ? 'selected' : ''
                }`}
                onClick={() => {
                  setEndRating(number);
                  setSelectedRating(number);
                }}
              >
                <Image src={`/${label}.png`} width={50} height={60} alt={label} />
              </RatingButton>
            ))}
          </div>
          {!showFeedBackModal && (
            <div className="mt-10">
              <a className="text-md text-[#00AD79] cursor-pointer underline" onClick={() => skipEndRating()}>
                Skip
              </a>
            </div>
          )}
        </div>

        {showFeedBackModal && (
          <div className="flex flex-col  items-center mt-8">
            {guideSuccess ? (
              <div className="flex flex-row items-center justify-center ">
                <h2 className="text-2xl mr-2  font-semibold leading-6 text-gray-200 ">What did you like the most?</h2>
                <Image height={60} width={50} src="/feedback.png" alt="feedbackIcon" />
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center ">
                <h2 className="text-2xl  mr-2 font-semibold leading-6 text-gray-200 ">What do you want us to improve upon?</h2>
                <Image height={60} width={50} src="/feedback.png" alt="feedbackIcon" />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              {feedbackOptions.map((option) => (
                <div key={option.name} onClick={() => handleFeedbackSelection(option.name)} className={`flex flex-col items-center cursor-pointer`}>
                  <option.image
                    className={`mb-4 hover:border-2 h-20 hover:border-[#00AD79] p-4 ${feedbackState[option.name] ? 'scale-125 border border-green-300 ' : ''}`}
                  />
                  <h2 className="text-lg mt-2">{option.label}</h2>
                </div>
              ))}
            </div>
            <div className="flex flex-row w-[80%] mt-10">
              <Button
                className=" w-full flex justify-center items-center "
                onClick={() => {
                  skipEndRating;
                }}
              >
                Skip{' '}
              </Button>
              <button className="ml-4 w-full text-sm font-medium text-white bg-[#00AD79] rounded-md " onClick={handleSubmitFeedback}>
                Submit Feedback
              </button>
            </div>
          </div>
        )}
      </ModalContent>
    </FullScreenModal>
  );
}
