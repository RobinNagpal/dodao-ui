'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';
import { PROD_HOST } from './LogRocketComponent';

const CLARITY_PROJECT_ID = 'u82d3rnsxw';

export default function ClarityComponent(): null {
  useEffect(() => {
    // Only initialize on production
    if (typeof window !== 'undefined' && window.location.hostname === PROD_HOST) {
      Clarity.init(CLARITY_PROJECT_ID);
    }
  }, []);

  return null;
}
