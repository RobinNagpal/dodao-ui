import React, { ReactNode } from 'react';
import styles from './Accordion.module.scss';

interface AccordionProps {
  isOpen: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

export default function Accordion({ isOpen, label, onClick, children }: AccordionProps) {
  return (
    <div className={`${styles.accordionContainer} ${isOpen ? styles.isOpened : ''}`}>
      <div id={`accordion-${label}`}>
        <button type="button" className="flex rounded-md items-center justify-between w-full p-5 font-medium rtl:text-right gap-3" onClick={onClick}>
          <span>{label}</span>
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
      </div>
      <div
        style={{
          maxHeight: isOpen ? '1000px' : '0',
          opacity: isOpen ? 1 : 0,
          overflow: 'scroll',
          padding: '0 1rem 1rem 1rem',
        }}
        className={styles.accordionContent}
      >
        {children}
      </div>
    </div>
  );
}
