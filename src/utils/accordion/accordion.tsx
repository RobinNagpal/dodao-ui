import React, { ReactNode } from 'react';
import styled from 'styled-components';
import styles from './accordion.module.scss';

interface AccordionProps {
  isOpen: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

const AccordionContainer = styled.div`
  margin-top: 2px;
  border-radius: 0.375rem;
`;
const AccordionContent = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: all 0.4s ease-in-out;
`;

export const Accordion: React.FC<AccordionProps> = ({ isOpen, label, onClick, children }) => {
  return (
    <AccordionContainer className={isOpen ? 'bg-gray-200' : ''}>
      <h2 id={`accordion-${label}`}>
        <button
          type="button"
          className={`flex rounded-md items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 gap-3 ${styles.backgroundColor}`}
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
      </h2>
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
