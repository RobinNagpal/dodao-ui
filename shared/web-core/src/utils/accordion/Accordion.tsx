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
        // Increased bottom margin (mb-6) and top padding (pt-3) for better spacing
        className={`rounded-md mb-6 py-3 cursor-pointer ${styles.accordionContainer} ${hasError ? styles.error : ''} ${isOpen ? styles.isOpened : ''}`}
        onClick={onClick}
      >
        <div id={`accordion-${label}`}>
          <button
            type="button"
            // Increased horizontal padding from px-2 to px-4 for a more spacious feel
            className="flex rounded-md items-center justify-between w-full px-4 font-medium rtl:text-right gap-2"
            onClick={onClick}
          >
            <span className="text-lg">{label}</span>
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
            maxHeight: isOpen ? '2000px' : '0',
            opacity: isOpen ? 1 : 0,
            overflow: isOpen ? 'auto' : 'hidden',
            // When open, add padding on all sides; when closed, no padding
            padding: isOpen ? '1.5rem' : '0',
            transition: 'max-height 0.5s ease, opacity 0.3s ease, padding 0.3s ease',
          }}
          className={styles.accordionContent}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
