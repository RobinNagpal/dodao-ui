import EmojiRatings from '@/components/app/Rating/EmojiRatings';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { ByteFeedback, ByteRating } from '@/graphql/generated/generated-types';
import { ClipboardDocumentListIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import styles from './ByteRatingModal.module.scss';

export interface ByteEndRatingModalProps {
  open: boolean;
  onClose: () => void;
  skipByteRating: () => void;
  setByteRating: (rating: number, feedback?: ByteFeedback) => Promise<void>;
}

export interface ByteFeedbackOptions {
  name: string;
  label: string;
  image: any;
}

const feedbackOptions: ByteFeedbackOptions[] = [
  { name: 'content', label: 'Content', image: ClipboardDocumentListIcon },
  { name: 'ux', label: 'User Experience', image: RocketLaunchIcon },
];

export default function ByteRatingModal({ open, onClose, skipByteRating, setByteRating }: ByteEndRatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number>();
  const skipOrCloseModal = async () => {
    if (selectedRating !== undefined) {
      await setByteRating(selectedRating!);
      onClose();
    } else {
      skipByteRating();
    }
  };
  const handleFeedbackSelection = async (optionName: string) => {
    const feedback: ByteFeedback = {};
    if (optionName === 'content') {
      feedback.content = true;
    } else if (optionName === 'ux') {
      feedback.ux = true;
    }

    await setByteRating(selectedRating!, feedback);
    onClose();
  };

  return (
    <FullPageModal open={open} onClose={skipOrCloseModal} title={''}>
      <div className={`${styles.ModalContent}`}>
        <div className="mt-2 text-center sm:mt-1">
          <div className="flex flex-row items-center justify-center ">
            <h1 className={`text-xl font-semibold leading-6 mr-2 ${styles.ModalHeading}`}>Share your feedback about the Byte</h1>
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

            <div className="grid grid-cols-2 gap-4 mt-8">
              {feedbackOptions.map((option) => (
                <div key={option.name} className={`${styles.FeedbackOptionDiv}`}>
                  <div className={`flex flex-col items-center cursor-pointer p-2`} onClick={() => handleFeedbackSelection(option.name)}>
                    <option.image height={40} width={40} />
                    <h2 className="text-md">{option.label}</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <a className="text-md cursor-pointer underline" onClick={() => skipOrCloseModal()}>
            Skip
          </a>
        </div>
      </div>
    </FullPageModal>
  );
}
