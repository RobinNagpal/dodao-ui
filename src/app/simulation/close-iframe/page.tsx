'use client';

import { useEffect } from 'react';

export default function CloseTimeline() {
  function inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
  useEffect(() => {
    if (inIframe()) {
      window.close();
    } else {
      window.location.href = '/simulations';
    }
  }, []);
  return null;
}
