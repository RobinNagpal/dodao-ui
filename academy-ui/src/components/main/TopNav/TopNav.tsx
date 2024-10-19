import DoDAOHomeTopNav from '@/components/home/DoDAOHome/components/TopNav';
import { SpaceProps } from '@/contexts/withSpace';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import React from 'react';
import AcademyTopNav from './AcademyTopNav/AcademyTopNav';

export default function TopNav({ space }: SpaceProps) {
  if (space.id === PredefinedSpaces.DODAO_HOME) {
    return <DoDAOHomeTopNav />;
  }
  return <AcademyTopNav space={space} />;
}
