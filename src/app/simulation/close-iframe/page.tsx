'use client';

import { useEffect } from 'react';

export default function CloseSimulation() {
  useEffect(() => {
    window.close();
    setTimeout(() => {
      window.close();
    }, 2000);
  }, []);
  return null;
}
