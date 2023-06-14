import Button from '@/components/core/buttons/Button';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import Link from 'next/link';
import React from 'react';

export default function CreateContentModalContents({ hideModal }: { hideModal: () => void }) {
  return (
    <div className="pt-4 flex flex-col justify-center items-center w-full h-max">
      <div className="p-4">
        <Grid2Cols>
          <Link href="/tidbits/edit" onClick={() => hideModal} className="p-2">
            <Button variant="outlined" primary className="p-2 w-full">
              Create Tidbit
            </Button>
          </Link>
          <Link href="/guides/edit" onClick={() => hideModal} className="p-2">
            <Button variant="outlined" primary className="p-2 w-full">
              Create Guide
            </Button>
          </Link>
        </Grid2Cols>
      </div>
    </div>
  );
}
