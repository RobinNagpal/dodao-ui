import Button from '@/components/core/buttons/Button';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function CreateContentModalContents({ hideModal }: { hideModal: () => void }) {
  const router = useRouter();

  const goToUrl = (url: string) => {
    router.push(url);
    hideModal();
  };
  return (
    <div className="pt-4 flex flex-col justify-center items-center w-full h-max">
      <div className="p-4 mb-[100%] sm:mb-0">
        <Grid2Cols>
          <Button variant="outlined" primary className="p-2 w-full" onClick={() => goToUrl('/tidbits/edit')}>
            Create Tidbit
          </Button>
          <Button variant="outlined" primary className="p-2 w-full" onClick={() => goToUrl('/guides/edit')}>
            Create Guide
          </Button>
        </Grid2Cols>
      </div>
    </div>
  );
}
