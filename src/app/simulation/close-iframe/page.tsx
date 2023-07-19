'use client';

import { useEffect } from 'react';

export default function CloseTimeline() {
  useEffect(() => {
    window.close();
    setTimeout(() => {
      window.close();
    }, 2000);
  }, []);
  return null;
}
