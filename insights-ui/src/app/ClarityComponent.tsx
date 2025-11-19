'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';
import { PROD_HOST } from './LogRocketComponent';

export default function ClarityComponent(): null {
  useEffect(() => {
    // Only initialize on production
    if (typeof window !== 'undefined' && window.location.hostname === PROD_HOST) {
      Clarity.init(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID as string);
    }
  }, []);

  return null;
}
