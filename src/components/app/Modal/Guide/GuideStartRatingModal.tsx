import FullScreenModal from '@/components/core/modals/FullScreenModal';
import styled from 'styled-components';
import { useState } from 'react';
import CustomButton from '@/components/core/buttons/Button';

export interface GuideStartRatingModalProps {
  open: boolean;
  onClose: () => void;
  skipStartRating: () => void;
  setStartRating: (rating: number) => void;
}

const RatingButton = styled.button`
  :hover {
    border: 1px solid #00AD79; 
    background-color: #222;
  }
  
    display: inline-block;
    padding: 10px 20px;
    background-color: #000;
    color: #fff;
    border-radius: 5px;
    border: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
    background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  
  :active {
    background-color: #444;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  &.selected {
    background-color: var(--primary-color);

`;
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;


export default function GuideStartRatingModal({ open, onClose, skipStartRating, setStartRating }: GuideStartRatingModalProps) {
  const ratings = [
    { number: 1, label: '🙁' },
    { number: 2, label: '😕' },
    { number: 3, label: '😐' },
    { number: 4, label: '😄' },
    { number: 5, label: '😊' },
  ];

  
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  return (
    <FullScreenModal open={open} onClose={onClose} title='' >
     <ModalContent className='border-white border-2 p-10 bg-[#0D131A] '>

      <div className=" flex flex-col justify-center items-center  text-center  h-[300px]">
      <h1 className='text-2xl font-semibold leading-6 text-gray-200 mb-10'>How well do you know this topic ? </h1>
        <div className={`mt-4 flex flex-col items-center`}>
          <div className="flex justify-center space-x-3">
            {ratings.map(({ number, label }) => (
              <RatingButton
                key={number}
                type="button"
                className={`inline-flex items-center justify-center w-20 h-16 text-3xl  hover:scale-110 transition-transform duration-200 ${
                  selectedRating === number ? 'selected' : '' 
                }`}
                onClick={() => {
                  setSelectedRating(number); 
                  setStartRating(number);
                }}
              >
                {label}
              </RatingButton>
            ))}
          </div>
          <CustomButton  className="mt-5 w-[30%] flex justify-center items-center " onClick={()=>{ skipStartRating}}>Skip </CustomButton>
        </div>
        
      </div>
      
      </ModalContent>
    </FullScreenModal>
  );
}
