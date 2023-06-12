import React from 'react';

type Props = {};

const MinusCircle = (props: Props) => {
  return (
    <svg
      className="text-skin-text"
      width="20"
      height="20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  );
};

export default MinusCircle;
