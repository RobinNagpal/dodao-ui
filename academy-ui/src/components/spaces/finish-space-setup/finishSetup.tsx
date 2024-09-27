'use client';

import { Space } from '@prisma/client';

interface CreateSpaceProps {
  space: Space;
}

function FinishSetup({ space }: CreateSpaceProps) {
  return (
    <section className="h-full flex items-center justify-center pt-36" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div>Finish Setup</div>
    </section>
  );
}

export default FinishSetup;
