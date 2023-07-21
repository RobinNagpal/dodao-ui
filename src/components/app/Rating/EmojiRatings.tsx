import styled from 'styled-components';

const RatingButton = styled.button`
  :hover {
    background-color: var(--primary-color);
  }

  &.selected {
    background-color: var(--primary-color);
  }
`;

export interface EmojiRatingsProps {
  selectedRating?: number;
  selectRating: (rating: number) => void;
  leftHeading: string;
  rightHeading: string;
}
export default function EmojiRatings(props: EmojiRatingsProps) {
  const ratings = [
    { number: 1, label: '😔' },
    { number: 2, label: '🤔' },
    { number: 3, label: '😐' },
    { number: 4, label: '😄' },
    { number: 5, label: '🤩' },
  ];

  return (
    <div className={`flex flex-col items-center`}>
      <div className={`flex justify-center space-x-4`}>
        {ratings.map(({ number, label }) => (
          <RatingButton
            key={number}
            type="button"
            className={`inline-flex items-center justify-center w-20 h-16 text-3xl rounded-full hover:scale-110 transition-transform duration-200 ${
              props.selectedRating === number ? 'selected' : ''
            }`}
            onClick={() => props.selectRating(number)}
          >
            {label}
          </RatingButton>
        ))}
      </div>
      <div className={`flex justify-between font-semibold w-[100%] mt-4`}>
        <span className="text-lg">{props.leftHeading}</span>
        <span className="text-lg">{props.rightHeading}</span>
      </div>
    </div>
  );
}
