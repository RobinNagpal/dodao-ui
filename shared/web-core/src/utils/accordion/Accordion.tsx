import React, { ReactNode } from 'react';
import styles from './Accordion.module.scss';

interface AccordionProps {
  isOpen: boolean;
  label: string;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  hasError?: boolean;
  errorMessage?: string;
}

export default function Accordion({ isOpen, label, onClick, children, hasError = false, errorMessage }: AccordionProps) {
  return (
    <div>
      {hasError && <div className="text-red-500 ml-1 mb-2">{errorMessage}</div>}
      <div
        className={`rounded-md mb-4 pt-2 cursor-pointer ${styles.accordionContainer} ${hasError ? styles.error : ''} ${isOpen ? styles.isOpened : ''}`}
        onClick={(e) => !isOpen && onClick(e)}
      >
        <div id={`accordion-${label}`}>
          <button type="button" className="flex rounded-md items-center justify-between w-full px-2 font-medium rtl:text-right gap-2" onClick={onClick}>
            <span>{label}</span>
            <svg
              className="w-3 h-3 shrink-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
              style={{ transform: `rotate(${isOpen ? '0deg' : '180deg'})` }}
            >
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5" />
            </svg>
          </button>
        </div>
        <div
          style={{
            maxHeight: isOpen ? '1000px' : '0',
            opacity: isOpen ? 1 : 0,
            overflow: 'auto',
            padding: '0 1rem 1rem 1rem',
          }}
          className={styles.accordionContent}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
