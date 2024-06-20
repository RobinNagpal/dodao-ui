import React from 'react';
import { GetStartedButton } from '@dodao/web-core/components/home/common/GetStartedButton';

async function Home() {
  return (
    <div>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <GetStartedButton href={`/space-settings/edit`}>
          Get started <span aria-hidden="true">→</span>
        </GetStartedButton>
      </div>
    </div>
  );
}

export default Home;
