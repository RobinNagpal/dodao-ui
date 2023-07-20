'use client';

import Button from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useEffect } from 'react';

export default function CloseSimulation() {
  useEffect(() => {
    window.close();
    setTimeout(() => {
      window.close();
    }, 2000);
  }, []);
  return (
    <PageWrapper>
      <div className="flex flex-col justify-center h-full w-full align-center">
        <Button onClick={() => window.close()} className="w-96">
          Close Simulation
        </Button>
      </div>
    </PageWrapper>
  );
}
