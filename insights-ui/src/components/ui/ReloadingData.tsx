import React, { useEffect, useState, useRef, useCallback } from 'react';

interface ReloadingDataProps {
  loadDataFn: () => Promise<any>;
  needsLoading: boolean;
  reloadDurationInSec?: number;
  message?: string;
  onLoadComplete?: (data: any) => void;
}

export default function ReloadingData({ loadDataFn, needsLoading, reloadDurationInSec = 20, message = 'Refreshing data', onLoadComplete }: ReloadingDataProps) {
  const [countdown, setCountdown] = useState(reloadDurationInSec);
  const [isLoading, setIsLoading] = useState(false);
  const countdownRef = useRef(reloadDurationInSec);

  const handleReload = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await loadDataFn();
      onLoadComplete?.(data);
    } catch (error) {
      console.error('Error reloading data:', error);
    } finally {
      setIsLoading(false);
      // Reset countdown
      countdownRef.current = reloadDurationInSec;
      setCountdown(reloadDurationInSec);
    }
  }, [loadDataFn, isLoading, onLoadComplete, reloadDurationInSec]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (needsLoading) {
      // Initialize countdown
      countdownRef.current = reloadDurationInSec;
      setCountdown(reloadDurationInSec);

      intervalId = setInterval(() => {
        // Decrement the "seconds left" in the ref
        countdownRef.current -= 1;
        setCountdown(countdownRef.current);

        if (countdownRef.current <= 0) {
          // Time's up, reload data
          handleReload();
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [needsLoading, reloadDurationInSec, handleReload]);

  // If not loading, we don't display anything
  if (!needsLoading) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-md">
      {message && <div className="text-sm text-gray-700">{message}</div>}
      <div className="text-sm text-gray-600">{isLoading ? 'Updating...' : `Refreshing in ${countdown} sec...`}</div>
    </div>
  );
}
