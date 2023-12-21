// Accordion.tsx

import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface AccordionProps {
  isOpen: boolean;
  label: string;
  onClick: () => void;
  children : ReactNode
}

const AccordionContainer = styled.div`
  margin-top: 2px;
  border-radius: 0.375rem; /* 6px */
`;

const AccordionHeader = styled.h2`
  /* Add your styles for the accordion header */
`;

const AccordionContent = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: all 0.4s ease-in-out;
`;

export const Accordion: React.FC<AccordionProps> = ({ isOpen, label, onClick, children }) => {
  return (
    <AccordionContainer className={isOpen ? 'bg-gray-200' : ''}>
      <AccordionHeader id={`accordion-${label}`}>
        <button
          type="button"
          className="flex rounded-md items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-200 gap-3"
          onClick={onClick}
        >
          <span className="flex items-center">{label}</span>
          <svg
            className="w-3 h-3 shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
            style={{ transform: `rotate(${isOpen ? '180deg' : '0deg'})` }}
          >
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
          </svg>
        </button>
      </AccordionHeader>
      <AccordionContent
        style={{
          maxHeight: isOpen ? '1000px' : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        {children}
      </AccordionContent>
    </AccordionContainer>
  );
};
