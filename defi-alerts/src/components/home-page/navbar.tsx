'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Why Alerts', href: '#why-alerts' },
    { name: 'Features', href: '#features' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'Benefits', href: '#benefits' },
    { name: 'FAQ', href: '#faq' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map((link) => link.href.substring(1));

      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      setActiveSection(currentSection || '');
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navLinks]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d1d5da] bg-[#0D131A]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0D131A]/60">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <img alt="" src="/defialerts_icon.png" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#00AD79] ${
                activeSection === link.href.substring(1) ? 'text-[#00AD79] font-semibold' : 'text-[#f1f1f3]'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button
            className="bg-[#00AD79] hover:bg-[#00AD79]/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Contact Us
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-[#f1f1f3]" onClick={toggleMenu} aria-label="Toggle Menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container mx-auto px-4 py-4 border-t border-[#d1d5da]">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#00AD79] ${
                  activeSection === link.href.substring(1) ? 'text-[#00AD79] font-semibold' : 'text-[#f1f1f3]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              className="bg-[#00AD79] hover:bg-[#00AD79]/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors w-fit"
              onClick={() => {
                setIsMenuOpen(false);
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Contact Us
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
