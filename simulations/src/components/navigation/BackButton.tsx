'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type UserType = 'admin' | 'instructor' | 'student';

interface BackButtonProps {
  userType: UserType;

  text: string;

  href: string;

  className?: string;
}

export default function BackButton({ userType, text, href, className = '' }: BackButtonProps) {
  const router = useRouter();

  const colorSchemes = {
    admin: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300',
    instructor: 'border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300',
    student: 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300',
  };

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <Button onClick={handleClick} variant="outline" className={`${colorSchemes[userType]} bg-transparent`}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {text}
      </Button>
    </div>
  );
}
