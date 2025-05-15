// defi-alerts/src/components/home-page/navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BG_95 = 'hsl(0_0%_100%/0.95)'; // 95 % opacity white
const BG_60 = 'hsl(0_0%_100%/0.60)'; // 60 % opacity white
const BORDER = 'hsl(240_5.9%_90%)';
const PRIMARY = 'hsl(270_50%_40%)';
const FG = 'hsl(240_10%_3.9%)';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const navLinks = [
    { name: 'Why Alerts', href: '#why-alerts' },
    { name: 'Features', href: '#features' },
    { name: 'Architecture', href: '#architecture' },
    { name: 'Benefits', href: '#benefits' },
    { name: 'Case Study', href: '#case-study' },
    { name: 'FAQ', href: '#faq' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const current = navLinks
        .map((l) => l.href.slice(1))
        .find((id) => {
          const el = document.getElementById(id);
          if (!el) return false;
          const { top, bottom } = el.getBoundingClientRect();
          return top <= 100 && bottom >= 100;
        });
      setActiveSection(current || '');
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseLink = `text-sm font-medium transition-colors hover:text-[${PRIMARY}]`;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur
        bg-[${BG_95}] border-[${BORDER}]
        supports-[backdrop-filter]:bg-[${BG_60}]`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">DeFiAlerts</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`${baseLink} ${activeSection === link.href.slice(1) ? `text-[${PRIMARY}] font-semibold` : ''}`}>
              {link.name}
            </Link>
          ))}
          <Button asChild>
            <Link href="#contact">Contact Us</Link>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="container border-t py-4 md:hidden border-[hsl(240_5.9%_90%)]">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`${baseLink} ${activeSection === link.href.slice(1) ? `text-[${PRIMARY}] font-semibold` : ''}`}
              >
                {link.name}
              </Link>
            ))}
            <Button asChild onClick={() => setIsMenuOpen(false)}>
              <Link href="#contact">Contact Us</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
