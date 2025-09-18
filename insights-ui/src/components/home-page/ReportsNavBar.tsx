'use client';

import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import clsx from 'clsx';

const sections = [
  { id: 'analysis', title: 'Stocks Analysis' },
  { id: 'crowdfunding', title: 'Crowdfunding' },
  { id: 'reit', title: 'REIT' },
  { id: 'tariff', title: 'Tariff' },
];

function MenuIcon({
  open,
  ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
  open: boolean;
}) {
  return (
    <svg aria-hidden="true" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <path d={open ? 'M17 7 7 17M7 7l10 10' : 'm15 16-3 3-3 3M15 8l-3-3-3 3'} />
    </svg>
  );
}

const smoothScrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const navHeight = 128;
    const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - navHeight;

    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
  }
};

export function ReportsNavBar() {
  let navBarRef = useRef<React.ElementRef<'div'>>(null);
  let [activeIndex, setActiveIndex] = useState<number | null>(null);
  let mobileActiveIndex = activeIndex === null ? 0 : activeIndex;

  useEffect(() => {
    function updateActiveIndex() {
      if (!navBarRef.current) {
        return;
      }

      let newActiveIndex = null;
      let elements = sections.map(({ id }) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
      let bodyRect = document.body.getBoundingClientRect();
      let offset = bodyRect.top + navBarRef.current.offsetHeight + 64;

      if (elements.length > 0) {
        const lastElement = elements[elements.length - 1];
        const lastElementBottom = lastElement.getBoundingClientRect().bottom + window.scrollY;
        const lastElementHeight = lastElement.offsetHeight;

        if (window.scrollY > lastElementBottom - lastElementHeight / 2) {
          setActiveIndex(null);
          return;
        }
      }

      for (let index = 0; index < elements.length; index++) {
        if (window.scrollY >= elements[index].getBoundingClientRect().top - offset) {
          newActiveIndex = index;
        } else {
          break;
        }
      }

      setActiveIndex(newActiveIndex);
    }

    updateActiveIndex();

    window.addEventListener('resize', updateActiveIndex);
    window.addEventListener('scroll', updateActiveIndex, { passive: true });

    return () => {
      window.removeEventListener('resize', updateActiveIndex);
      window.removeEventListener('scroll', updateActiveIndex);
    };
  }, []);

  return (
    <div ref={navBarRef} className="sticky top-0 z-50">
      <Popover className="sm:hidden">
        {({ open }) => (
          <>
            <div
              className={clsx(
                'relative flex items-center px-4 py-3',
                !open && 'bg-gray-800/95 shadow-sm [@supports(backdrop-filter:blur(0))]:bg-gray-800/80 [@supports(backdrop-filter:blur(0))]:backdrop-blur-sm'
              )}
            >
              {!open && (
                <>
                  <span aria-hidden="true" className="font-mono text-sm text-indigo-400">
                    {(mobileActiveIndex + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="ml-4 text-base font-medium text-white">{sections[mobileActiveIndex].title}</span>
                </>
              )}
              <PopoverButton
                className={clsx('-mr-1 ml-auto flex h-8 w-8 items-center justify-center', open && 'relative z-10')}
                aria-label="Toggle navigation menu"
              >
                {!open && (
                  <>
                    {/* Increase hit area */}
                    <span className="absolute inset-0" />
                  </>
                )}
                <MenuIcon open={open} className="h-6 w-6 stroke-gray-300" />
              </PopoverButton>
            </div>
            <PopoverPanel className="absolute inset-x-0 top-0 bg-gray-800/95 py-3.5 shadow-sm [@supports(backdrop-filter:blur(0))]:bg-gray-800/80 [@supports(backdrop-filter:blur(0))]:backdrop-blur-sm">
              {sections.map((section, sectionIndex) => (
                <PopoverButton key={section.id} className="flex items-center px-4 py-1.5 w-full" onClick={() => smoothScrollToSection(section.id)}>
                  <span aria-hidden="true" className="font-mono text-sm text-indigo-400">
                    {(sectionIndex + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="ml-4 text-base font-medium text-white">{section.title}</span>
                </PopoverButton>
              ))}
            </PopoverPanel>
            <div className="absolute inset-x-0 bottom-full z-10 h-4 bg-gray-800" />
          </>
        )}
      </Popover>
      <div className="hidden sm:flex sm:h-32 sm:justify-center sm:border-b sm:border-gray-600 sm:bg-gray-800/95 sm:[@supports(backdrop-filter:blur(0))]:bg-gray-800/80 sm:[@supports(backdrop-filter:blur(0))]:backdrop-blur-sm">
        <ol role="list" className="mb-[-2px] grid auto-cols-[minmax(0,15rem)] grid-flow-col text-base font-medium text-white [counter-reset:section]">
          {sections.map((section, sectionIndex) => (
            <li key={section.id} className="flex [counter-increment:section]">
              <button
                onClick={() => smoothScrollToSection(section.id)}
                className={clsx(
                  'flex w-full flex-col items-center justify-center border-b-2 before:mb-2 before:font-mono before:text-sm before:content-[counter(section,decimal-leading-zero)] cursor-pointer',
                  sectionIndex === activeIndex
                    ? 'border-indigo-400 bg-indigo-900/30 text-indigo-400 before:text-indigo-400'
                    : 'border-transparent before:text-gray-500 hover:bg-gray-700/40 hover:before:text-gray-300'
                )}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
