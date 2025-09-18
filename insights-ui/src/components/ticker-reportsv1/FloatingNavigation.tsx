'use client';

import { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface NavigationSection {
  id: string;
  title: string;
  hasContent?: boolean;
  subsections?: Array<{
    id: string;
    title: string;
  }>;
}

interface FloatingNavigationProps {
  sections: NavigationSection[];
}

export default function FloatingNavigation({ sections }: FloatingNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Handle smooth scrolling to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for any fixed headers
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsOpen(false);
  };

  // Track active section while scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        if (!section.hasContent) continue;

        const element = document.getElementById(section.id);
        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;

          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveSection(section.id);
            break;
          }
        }

        // Check subsections
        if (section.subsections) {
          for (const subsection of section.subsections) {
            const subElement = document.getElementById(subsection.id);
            if (subElement) {
              const subElementTop = subElement.offsetTop;
              const subElementBottom = subElementTop + subElement.offsetHeight;

              if (scrollPosition >= subElementTop && scrollPosition < subElementBottom) {
                setActiveSection(subsection.id);
                break;
              }
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Filter out sections that don't have content
  const visibleSections = sections.filter((section) => section.hasContent);

  if (visibleSections.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        aria-label="Open navigation"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:bg-transparent lg:backdrop-blur-none" onClick={() => setIsOpen(false)} />}

      {/* Navigation Panel */}
      <div
        className={`
        fixed z-50 bg-gray-900 text-white transition-transform duration-300 ease-in-out border-l border-gray-700
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        
        /* Mobile: Full screen */
        inset-0 lg:inset-auto
        
        /* Desktop: Right sidebar */
        lg:top-0 lg:right-0 lg:h-full lg:w-96 lg:max-w-md
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Report Outline</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors" aria-label="Close navigation">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {visibleSections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                    flex items-center justify-between group
                    ${activeSection === section.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300 hover:text-white'}
                  `}
                >
                  <span className="font-medium">{section.title}</span>
                  <ChevronRightIcon className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                </button>

                {/* Subsections */}
                {section.subsections && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {section.subsections.map((subsection) => (
                      <li key={subsection.id}>
                        <button
                          onClick={() => scrollToSection(subsection.id)}
                          className={`
                            w-full text-left px-3 py-1.5 rounded-md transition-all duration-200
                            text-sm flex items-center justify-between group
                            ${activeSection === subsection.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'}
                          `}
                        >
                          <span>{subsection.title}</span>
                          <ChevronRightIcon className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer hint */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 text-center">Click any section to jump there instantly</p>
        </div>
      </div>
    </>
  );
}
