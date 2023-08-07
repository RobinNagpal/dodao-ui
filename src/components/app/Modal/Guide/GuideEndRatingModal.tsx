import EmojiRatings from '@/components/app/Rating/EmojiRatings';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { GuideFeedback, GuideRating } from '@/graphql/generated/generated-types';
import { ClipboardDocumentListIcon, QuestionMarkCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import styled from 'styled-components';

export interface GuideEndRatingModalProps {
  open: boolean;
  onClose: () => void;
  skipGuideRating: () => void;
  setGuideRating: (rating: number, feedback?: GuideFeedback) => Promise<void>;
}

export interface GuideFeedbackOptions {
  name: string;
  label: string;
  image: any;
}

const feedbackOptions: GuideFeedbackOptions[] = [
  { name: 'content', label: 'Content', image: ClipboardDocumentListIcon },
  { name: 'questions', label: 'Questions', image: QuestionMarkCircleIcon },
  { name: 'ux', label: 'User Experience', image: RocketLaunchIcon },
];

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FeedbackOptionDiv = styled.div`
  :hover {
    border-radius: 0.5rem;
    border-color: var(--bg-color);
    background-color: var(--primary-color);
  }
`;

export default function GuideEndRatingModal({ open, onClose, skipGuideRating, setGuideRating }: GuideEndRatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number>();
  const skipOrCloseModal = async () => {
    if (selectedRating !== undefined) {
      await setGuideRating(selectedRating!);
      onClose();
    } else {
      skipGuideRating();
    }
  };
  const handleFeedbackSelection = async (optionName: string) => {
    const feedback: GuideFeedback = {};
    if (optionName === 'content') {
      feedback.content = true;
    } else if (optionName === 'questions') {
      feedback.questions = true;
    } else if (optionName === 'ux') {
      feedback.ux = true;
    }

    await setGuideRating(selectedRating!, feedback);
    onClose();
  };

  return (
    <FullScreenModal open={open} onClose={skipOrCloseModal} title={''}>
      <ModalContent>
        <div className="mt-2 text-center sm:mt-1">
          <div className="flex flex-row items-center justify-center ">
            <h1 className="text-xl font-semibold leading-6 text-gray-200 mr-2">Share your feedback about the Guide</h1>
          </div>

          <div className={`mt-4 flex justify-center`}>
            <EmojiRatings
              selectedRating={selectedRating}
              selectRating={(rating) => {
                setSelectedRating(rating);
              }}
            />
          </div>
        </div>

        {selectedRating && (
          <div className="flex flex-col  items-center mt-8">
            {selectedRating > 2 ? (
              <div className="flex flex-row items-center justify-center ">
                <h2 className="text-xl mr-2  font-semibold leading-6 ">What did you like the most?</h2>
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center ">
                <h2 className="text-xl  mr-2 font-semibold leading-6">What do you want us to improve upon?</h2>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              {feedbackOptions.map((option) => (
                <FeedbackOptionDiv
                  key={option.name}
                  onClick={() => handleFeedbackSelection(option.name)}
                  className={`flex flex-col items-center cursor-pointer p-2`}
                >
                  <option.image height={40} width={40} />
                  <h2 className="text-md">{option.label}</h2>
                </FeedbackOptionDiv>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <a className="text-md cursor-pointer underline" onClick={() => skipOrCloseModal()}>
            Skip
          </a>
        </div>
      </ModalContent>
    </FullScreenModal>
  );
}
