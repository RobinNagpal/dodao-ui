'use client';

import Button from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import styled from 'styled-components';
import Image from 'next/image';
import NemaLogo from '@/images/logos/nema_logo.png';

const MainContainer = styled.div`
  min-height: calc(100vh - 300px);
`;

export default function InstallNema() {
  return (
    <PageWrapper>
      <MainContainer className="pt-4 flex flex-col justify-center items-center byte-container w-full">
        <Image src={NemaLogo} width={120} height={120} alt="Nema bot logo" />
        <Button className="mt-4" primary variant={'contained'}>
          <a href="https://discord.com/api/oauth2/authorize?client_id=1094692277554774056&permissions=66560&scope=bot" target="_blank">
            Install Nema Bot
          </a>
        </Button>
      </MainContainer>
    </PageWrapper>
  );
}
