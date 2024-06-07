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
    <div className={`flex justify-center`}>
      {ratings.map(({ number, label }) => (
        <RatingButton
          key={number}
          type="button"
          className={`inline-flex items-center justify-center w-20 h-16 text-3xl rounded-full hover:scale-110 transition-transform duration-200  ${
            props.selectedRating === number ? 'selected' : ''
          }`}
          onClick={() => props.selectRating(number)}
        >
          {label}
        </RatingButton>
      ))}
    </div>
  );
}
