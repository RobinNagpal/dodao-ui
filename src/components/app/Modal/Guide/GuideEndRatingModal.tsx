import EmojiRatings from '@/components/app/Rating/EmojiRatings';
import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { GuideFeedback } from '@/graphql/generated/generated-types';
import { ClipboardDocumentListIcon, QuestionMarkCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState } from 'react';
import styled from 'styled-components';

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
            <EmojiRatings selectRating={(rating) => setSelectedRating(rating)} />
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
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center ">
                <h2 className="text-2xl  mr-2 font-semibold leading-6 text-gray-200 ">What do you want us to improve upon?</h2>
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
