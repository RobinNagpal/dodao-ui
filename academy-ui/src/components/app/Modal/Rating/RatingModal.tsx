import EmojiRatings from '@/components/app/Rating/EmojiRatings';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { ByteFeedback, GuideFeedback, GuideRating } from '@/graphql/generated/generated-types';
import { useState } from 'react';
import styles from './RatingModal.module.scss';

export interface RatingModalProps<T extends GuideFeedback | ByteFeedback | undefined> {
  ratingType: 'Guide' | 'Byte';
  open: boolean;
  feedbackOptions: FeedbackOptions[];
  onClose: () => void;
  skipRating: () => void;
  setRating: (rating: number, feedback?: T) => Promise<void>;
}

export interface FeedbackOptions {
  name: string;
  label: string;
  image: any;
}

export default function RatingModal<T extends GuideFeedback | ByteFeedback | undefined>({
  ratingType,
  open,
  feedbackOptions,
  onClose,
  skipRating,
  setRating,
}: RatingModalProps<T>) {
  const [selectedRating, setSelectedRating] = useState<number>();
  const skipOrCloseModal = async () => {
    if (selectedRating !== undefined) {
      await setRating(selectedRating!);
      onClose();
    } else {
      skipRating();
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

    await setRating(selectedRating!, feedback as T);
    onClose();
  };

  return (
    <FullPageModal open={open} onClose={skipOrCloseModal} title={''}>
      <div className="flex flex-col items-center">
        <div className="mt-2 text-center sm:mt-1">
          <div className="flex flex-row items-center justify-center ">
            <h1 className={`text-xl font-semibold leading-6 mr-2 ${styles.ModalHeading}`}>{`Share your feedback about the ${ratingType}`}</h1>
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

            <div className={`grid ${feedbackOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mt-8`}>
              {feedbackOptions.map((option) => (
                <div key={option.name} className={`${styles.FeedbackOptionDiv}`}>
                  <div className={`flex flex-col items-center cursor-pointer p-2 hover:rounded-lg`} onClick={() => handleFeedbackSelection(option.name)}>
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
