import Button from '@/components/core/buttons/Button';
import Link from 'next/link';
import React from 'react';

export default function CreateContentModalContents({ hideModal }: { hideModal: () => void }) {
  return (
    <div>
      <Link href="/tidbits/edit" onClick={() => hideModal}>
        <Button variant="outlined" primary className="p-2 m-2">
          Create Tidbit
        </Button>
      </Link>
      <Link href="/tidbits/ai/create" onClick={() => hideModal}>
        <Button variant="contained" primary className="p-2 m-2">
          Create Tidbit with AI
        </Button>
      </Link>
    </div>
  );
}
