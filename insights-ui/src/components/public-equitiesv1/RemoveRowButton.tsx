import * as React from 'react';

interface RemoveRowButtonProps {
  onClick: () => void;
  ariaLabel: string;
}

export default function RemoveRowButton({ onClick, ariaLabel }: RemoveRowButtonProps): JSX.Element {
  return (
    <button type="button" onClick={onClick} className="flex items-center text-red-500 hover:text-red-700" aria-label={ariaLabel}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      Remove
    </button>
  );
}
