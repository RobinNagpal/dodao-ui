import EmojiRatings from '@/components/app/Rating/EmojiRatings';
import CustomButton from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import styled from 'styled-components';

export interface GuideStartRatingModalProps {
  open: boolean;
  onClose: () => void;
  skipStartRating: () => void;
  setStartRating: (rating: number) => void;
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function GuideStartRatingModal({ open, onClose, skipStartRating, setStartRating }: GuideStartRatingModalProps) {
  return (
    <FullScreenModal open={open} onClose={onClose} title="">
      <ModalContent>
        <div className=" flex flex-col justify-center items-center text-center">
          <h1 className="text-2xl font-semibold leading-6 mb-8">How familiar are you with this topic at the moment?</h1>
          <div className={`mt-4 flex flex-col items-center`}>
            <EmojiRatings selectRating={(rating) => setStartRating(rating)} leftHeading="Beginner" rightHeading="Expert" />
            <CustomButton
              className="mt-5 w-[30%] flex justify-center items-center "
              onClick={() => {
                skipStartRating();
              }}
            >
              Skip
            </CustomButton>
          </div>
        </div>
      </ModalContent>
    </FullScreenModal>
  );
}
