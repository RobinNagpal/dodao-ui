import { SpaceProps } from '@/types/SpaceProps';
import React from 'react';
import AcademyTopNav from './AcademyTopNav/AcademyTopNav';

export default function TopNav({ space }: SpaceProps) {
  return <AcademyTopNav space={space} />;
}
