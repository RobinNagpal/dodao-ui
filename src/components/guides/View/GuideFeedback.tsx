import React, { useState, ChangeEvent, FormEvent, MouseEvent } from 'react';
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline';

interface FeedbackState {
  questions: boolean;
  content: boolean;
  other: string;
  [key: string]: boolean | string;
}

const feedbackOptions = [
  { name: 'Content', label: 'Usefulness of Guides' },
  { name: 'Questions', label: 'Questions' },
  { name: 'clarity', label: 'Clarity of Explanations' },
  { name: 'UI', label: 'User Interface' },
  { name: 'loading', label: 'Loading' },
  { name: 'other', label: 'Other' },
];

const GuideFeedback: React.FC = () => {
  const [finalFeedback, setFinalFeedback] = useState<FeedbackState>({
    questions: false,
    content: false,
    other: '',
  });

  const handleChange = (event: MouseEvent<HTMLButtonElement>) => {
    const { name } = event.currentTarget;
    setFinalFeedback((prevFeedback) => ({
      ...prevFeedback,
      [name]: !prevFeedback[name],
    }));
  };

  const handleOtherChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setFinalFeedback((prevFeedback) => ({
      ...prevFeedback,
      other: value,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log(finalFeedback);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="m-2">What do you like the most?</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {feedbackOptions.map((option) => (
          <button
            key={option.name}
            name={option.name}
            onClick={handleChange}
            className={`w-full h-24 p-3 border-2 rounded-md ${
              finalFeedback[option.name] ? 'bg-blue-500 text-white' : ''
            }`}
          >
            <ArrowDownCircleIcon className="w-full h-[50%]" />
            <h2>{option.label}</h2>
          </button>
        ))}
      </div>
      {finalFeedback.other && (
        <textarea
          onChange={handleOtherChange}
          className="mt-4 border-2 rounded-md w-full sm:w-[70%] h-40"
          placeholder="Optional"
        />
      )}
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 text-white bg-blue-500 rounded-md"
      >
        Submit
      </button>
    </div>
  );
};

export default GuideFeedback;
